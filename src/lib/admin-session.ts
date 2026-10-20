import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { HttpError } from "./http";

export const ADMIN_COOKIE_NAME = "gift_letters_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

interface SessionPayload {
  version: 1;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

function credentials() {
  const password = process.env.LETTERS_ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 12 || !secret || secret.length < 32) {
    throw new HttpError(503, "Hộp thư chưa sẵn sàng. Hãy cấu hình mật khẩu quản trị và khóa phiên trên máy chủ.");
  }
  return { password, secret };
}

function safeEqual(first: string, second: string) {
  // Compare equal-length digests to avoid leaking length through early returns.
  const a = createHash("sha256").update(first).digest();
  const b = createHash("sha256").update(second).digest();
  return timingSafeEqual(a, b);
}

export function verifyAdminPassword(password: string): boolean {
  return safeEqual(password, credentials().password);
}

function sessionSigningKey(secret: string, password: string) {
  // Changing either environment secret revokes previously issued cookies.
  return createHmac("sha256", secret).update(`letters-session-v1:${password}`).digest();
}

export function createSessionToken(now = Date.now()): string {
  const { secret, password } = credentials();
  const payload: SessionPayload = {
    version: 1,
    role: "admin",
    issuedAt: Math.floor(now / 1000),
    expiresAt: Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS,
    nonce: randomUUID(),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", sessionSigningKey(secret, password))
    .update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  try {
    const { secret, password } = credentials();
    if (!token || token.length > 1024) return false;
    const [encoded, signature, extra] = token.split(".");
    if (!encoded || !signature || extra !== undefined) return false;
    const expected = createHmac("sha256", sessionSigningKey(secret, password))
      .update(encoded).digest("base64url");
    if (!safeEqual(signature, expected)) return false;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<SessionPayload>;
    const nowSeconds = Math.floor(now / 1000);
    return payload.version === 1 &&
      payload.role === "admin" &&
      typeof payload.issuedAt === "number" &&
      Number.isInteger(payload.issuedAt) &&
      payload.issuedAt <= nowSeconds + 30 &&
      typeof payload.expiresAt === "number" &&
      Number.isInteger(payload.expiresAt) &&
      payload.expiresAt > nowSeconds &&
      payload.expiresAt - payload.issuedAt === SESSION_MAX_AGE_SECONDS &&
      typeof payload.nonce === "string" &&
      /^[0-9a-f-]{36}$/i.test(payload.nonce);
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function getAdminSession(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(ADMIN_COOKIE_NAME)?.value);
}

export function requireAdminRequest(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));
  const token = cookie?.slice(ADMIN_COOKIE_NAME.length + 1);
  if (!verifySessionToken(token)) {
    throw new HttpError(401, "Vui lòng đăng nhập để mở hộp thư.");
  }
}
