import "server-only";
import { redirect } from "next/navigation";

// Món quà chỉ được xem đến hết ngày 20/10 (giờ Việt Nam). Từ 00:00 ngày 21/10
// trở đi, người xem được chuyển sang trang cảm ơn /thanks.
// Thêm ?open=true vào đường dẫn để vẫn mở được quà sau hạn (ví dụ /?to=1&open=true).
// Tham số này không phải bí mật: ai biết nó đều mở được quà.
// Muốn đổi hạn xem, sửa EXPIRES_AT bên dưới. Luôn ghi kèm múi giờ (+07:00);
// nếu thiếu, JavaScript hiểu là giờ UTC.
const EXPIRES_AT = Date.parse("2026-10-21T00:00:00+07:00");

export function isGiftExpired(now = Date.now()): boolean {
  return now >= EXPIRES_AT;
}

export function isGiftOpenOverride(open: string | string[] | undefined): boolean {
  return open === "true";
}

/** Gọi ở đầu trang quà. Quá hạn thì chuyển sang /thanks, trừ khi có ?open=true. */
export function redirectIfGiftExpired(open?: string | string[]): void {
  if (!isGiftOpenOverride(open) && isGiftExpired()) redirect("/thanks");
}
