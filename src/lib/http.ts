import "server-only";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export function jsonResponse(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, {
    status,
    headers: { ...PRIVATE_HEADERS, ...headers },
  });
}

export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    return jsonResponse(
      { error: error.message },
      error.status,
      error.status === 429 ? { "Retry-After": "60" } : undefined,
    );
  }
  // Deliberately do not log request bodies, credentials or SDK error details.
  return jsonResponse({ error: fallback }, 503);
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || fetchSite === "cross-site") {
    throw new HttpError(403, "Yêu cầu không hợp lệ. Hãy mở lại trang và thử lại.");
  }
  let suppliedOrigin: string;
  let expectedOrigin: string;
  try {
    const originUrl = new URL(origin);
    if (!["http:", "https:"].includes(originUrl.protocol) || originUrl.origin !== origin) {
      throw new Error("Invalid Origin header.");
    }
    suppliedOrigin = originUrl.origin;

    const requestUrl = new URL(request.url);
    // Next may construct request.url from the listening address (0.0.0.0) or
    // an internal proxy address. Host is the authority the browser requested;
    // browser JavaScript cannot override it to bypass this CSRF comparison.
    const host = request.headers.get("host") ?? requestUrl.host;
    if (!host || /[\s/@\\?#,]/u.test(host)) {
      throw new Error("Invalid Host header.");
    }
    // Vercel terminates TLS before forwarding to the function. This is a
    // platform environment flag, never a request-supplied forwarding header.
    const protocol = process.env.VERCEL === "1" && process.env.NODE_ENV === "production"
      ? "https:"
      : requestUrl.protocol;
    expectedOrigin = new URL(`${protocol}//${host}`).origin;
  } catch {
    throw new HttpError(403, "Nguồn gửi yêu cầu không hợp lệ.");
  }
  // Never trust a client-supplied X-Forwarded-Host as an allowed origin.
  if (suppliedOrigin !== expectedOrigin) {
    throw new HttpError(403, "Yêu cầu phải được gửi từ chính website này.");
  }
}

export async function readSmallJson(request: Request, maxBytes = 8192): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "Vui lòng gửi dữ liệu ở định dạng JSON.");
  }
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > maxBytes)) {
    throw new HttpError(413, "Lời nhắn quá dài. Vui lòng rút gọn rồi thử lại.");
  }
  if (!request.body) throw new HttpError(400, "Chưa có dữ liệu để gửi.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, "Lời nhắn quá dài. Vui lòng rút gọn rồi thử lại.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new HttpError(400, "Dữ liệu chưa đúng định dạng. Vui lòng thử lại.");
  }
}
