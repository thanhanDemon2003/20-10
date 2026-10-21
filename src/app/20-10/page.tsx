import type { Metadata } from "next";
import { getRecipient } from "@/config/recipients";
import { GiftExperience } from "@/components/20-10/GiftExperience";
import { RecipientPicker } from "@/components/20-10/RecipientPicker";
import { redirectIfGiftExpired } from "@/lib/gift-window";

type Props = { searchParams: Promise<{ to?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { to } = await searchParams;
  const recipient = getRecipient(typeof to === "string" ? to : undefined);
  return { title: recipient ? `${recipient.pageTitle.replace(/\n/g, " ")} · 20 tháng 10` : "Một món quà đang chờ · 20 tháng 10" };
}

export default async function GiftPage({ searchParams }: Props) {
  redirectIfGiftExpired();
  const { to } = await searchParams;
  const recipient = getRecipient(typeof to === "string" ? to : undefined);
  return recipient ? <GiftExperience key={recipient.id} recipient={recipient} /> : <RecipientPicker />;
}
