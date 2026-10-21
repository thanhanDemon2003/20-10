import "server-only";
import { redirect } from "next/navigation";

// Món quà chỉ được xem đến hết ngày 20/10 (giờ Việt Nam). Từ 00:00 ngày 21/10
// trở đi, người xem được chuyển sang trang cảm ơn /thanks.
// Muốn đổi hạn xem, đặt GIFT_EXPIRES_AT trong .env.local, ví dụ:
//   GIFT_EXPIRES_AT=2026-10-21T00:00:00+07:00
// Luôn ghi kèm múi giờ (+07:00); nếu thiếu, JavaScript hiểu là giờ UTC.
const DEFAULT_EXPIRES_AT = "2026-10-21T00:00:00+07:00";

function expiresAtMs(): number {
  const configured = Date.parse(process.env.GIFT_EXPIRES_AT?.trim() || DEFAULT_EXPIRES_AT);
  // Giá trị sai định dạng thì quay về hạn mặc định, không bao giờ mở quà vô hạn.
  return Number.isNaN(configured) ? Date.parse(DEFAULT_EXPIRES_AT) : configured;
}

export function isGiftExpired(now = Date.now()): boolean {
  return now >= expiresAtMs();
}

/** Gọi ở đầu trang quà. Kiểm tra chạy trên server nên không thể bỏ qua từ trình duyệt. */
export function redirectIfGiftExpired(): void {
  if (isGiftExpired()) redirect("/thanks");
}
