import type { Metadata } from "next";
import LettersInbox from "@/components/letters/LettersInbox";

export const metadata: Metadata = {
  title: "Hộp thư yêu thương · 20.10",
  description: "Hộp thư riêng dành cho người gửi những tấm thiệp 20/10.",
  robots: { index: false, follow: false, nocache: true },
};

export default function LettersPage() {
  return <LettersInbox />;
}
