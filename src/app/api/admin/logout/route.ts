import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminCookieOptions, requireAdminRequest } from "@/lib/admin-session";
import { PRIVATE_HEADERS, errorResponse, requireSameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    requireAdminRequest(request);
    const response = NextResponse.json({ ok: true }, { headers: PRIVATE_HEADERS });
    response.cookies.set(ADMIN_COOKIE_NAME, "", { ...adminCookieOptions(), maxAge: 0 });
    return response;
  } catch (error) {
    return errorResponse(error, "Chưa thể đăng xuất. Vui lòng thử lại.");
  }
}
