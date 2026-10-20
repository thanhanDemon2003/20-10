import "server-only";
import { z } from "zod";
import { HttpError } from "./http";
import type { MessageInput } from "./message-types";

const normalizeName = (value: string) => value.normalize("NFC").replace(/\s+/gu, " ").trim();
const normalizeMessage = (value: string) =>
  value.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[^\S\n]+/gu, " ").trim();

export const messageInputSchema = z.object({
  name: z.string().transform(normalizeName).pipe(
    z.string().min(2, "Tên cần có ít nhất 2 ký tự.").max(50, "Tên không được dài quá 50 ký tự."),
  ),
  message: z.string().transform(normalizeMessage).pipe(
    z.string().min(1, "Bạn chưa viết lời nhắn.").max(1000, "Lời nhắn không được dài quá 1.000 ký tự."),
  ),
  recipientId: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  website: z.string().max(0, "Không thể gửi lời nhắn này.").optional().default(""),
}).strict();

export function parseMessageInput(body: unknown): MessageInput {
  const result = messageInputSchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const message = issue?.path[0] === "recipientId"
      ? "Người nhận chưa hợp lệ. Vui lòng mở đúng đường dẫn món quà."
      : issue?.path[0] === "name"
        ? "Tên cần có từ 2 đến 50 ký tự."
        : issue?.path[0] === "message"
          ? "Lời nhắn cần có từ 1 đến 1.000 ký tự."
          : "Dữ liệu lời nhắn không hợp lệ. Vui lòng kiểm tra lại.";
    throw new HttpError(400, message);
  }
  return {
    name: result.data.name,
    message: result.data.message,
    recipientId: result.data.recipientId,
  };
}
