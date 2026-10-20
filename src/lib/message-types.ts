export type { RecipientId } from "@/config/recipients";
import type { RecipientId } from "@/config/recipients";

export interface GiftMessage {
  id: string;
  name: string;
  message: string;
  recipientId: RecipientId;
  createdAt: string;
}

export interface MessageDocument {
  version: 1;
  messages: GiftMessage[];
}

export interface MessageInput {
  name: string;
  message: string;
  recipientId: RecipientId;
}
