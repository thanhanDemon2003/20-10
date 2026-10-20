import type { Metadata } from "next";
import { getRecipient } from "@/config/recipients";
import { GiftExperience } from "@/components/20-10/GiftExperience";
import { RecipientPicker } from "@/components/20-10/RecipientPicker";

type Props = { searchParams: Promise<{ to?: string | string[] }> };

function recipientFromQuery(to: string | string[] | undefined) {
  return getRecipient(to === undefined ? "2" : typeof to === "string" ? to : undefined);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const recipient = recipientFromQuery((await searchParams).to);
  return {
    title: recipient
      ? `${recipient.pageTitle.replace(/\n/g, " ")} · 20 tháng 10`
      : "Một món quà đang chờ · 20 tháng 10",
  };
}

export default async function Home({ searchParams }: Props) {
  const recipient = recipientFromQuery((await searchParams).to);
  return recipient ? <GiftExperience key={recipient.id} recipient={recipient} /> : <RecipientPicker />;
}
