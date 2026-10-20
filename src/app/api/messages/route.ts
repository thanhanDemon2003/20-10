import { requireAdminRequest } from "@/lib/admin-session";
import { errorResponse, jsonResponse, readSmallJson, requireSameOrigin } from "@/lib/http";
import { readMessages, saveMessage } from "@/lib/message-store";
import { parseMessageInput } from "@/lib/message-validation";
import { applyInstanceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    applyInstanceRateLimit("messages");
    const input = parseMessageInput(await readSmallJson(request));
    await saveMessage(input);
    return jsonResponse({ ok: true }, 201);
  } catch (error) {
    return errorResponse(error, "Lời nhắn chưa được lưu. Bạn thử gửi lại sau một lát nhé.");
  }
}

export async function GET(request: Request) {
  try {
    requireAdminRequest(request);
    const document = await readMessages();
    const download = new URL(request.url).searchParams.get("download") === "1";
    return jsonResponse(document, 200, download
      ? { "Content-Disposition": 'attachment; filename="20-10-letters.json"' }
      : undefined);
  } catch (error) {
    return errorResponse(error, "Chưa đọc được hộp thư. Vui lòng thử lại sau.");
  }
}
