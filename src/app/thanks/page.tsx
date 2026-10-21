import type { Metadata } from "next";
import { ThanksPage } from "@/components/20-10/ThanksPage";

export const metadata: Metadata = {
  title: "Cảm ơn bạn · 20 tháng 10",
  description: "Món quà đã hết thời gian để xem. Cảm ơn bạn đã ghé qua và chúc bạn một hành trình thật đẹp.",
  robots: { index: false, follow: false },
};

export default function Thanks() {
  return <ThanksPage />;
}
