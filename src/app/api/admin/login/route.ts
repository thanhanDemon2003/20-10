import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE_NAME, adminCookieOptions, createSessionToken, verifyAdminPassword } from "@/lib/admin-session";
import { HttpError, PRIVATE_HEADERS, errorResponse, readSmallJson, requireSameOrigin } from "@/lib/http";
import { applyInstanceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const loginSchema = z.object({ password: z.string().min(1).max(256) }).strict();

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    applyInstanceRateLimit("login");
    const result = loginSchema.safeParse(await readSmallJson(request, 2048));
    if (!result.success) throw new HttpError(400, "Vui lòng nhập mật khẩu hợp lệ.");
    if (!verifyAdminPassword(result.data.password)) {
      throw new HttpError(401, "Mật khẩu chưa đúng. Bạn thử lại nhé.");
    }
    const response = NextResponse.json({ ok: true }, { headers: PRIVATE_HEADERS });
    response.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(), adminCookieOptions());
    return response;
  } catch (error) {
    return errorResponse(error, "Chưa thể đăng nhập. Vui lòng thử lại sau.");
  }
}
