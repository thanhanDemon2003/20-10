import { ArrowUpRight } from "lucide-react";
import { sender } from "@/config/recipients";

export function SenderLink({ signature = false }: { signature?: boolean }) {
  return (
    <a
      href={sender.facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`sender-link${signature ? " sender-signature" : ""}`}
      aria-label={`${sender.name} — mở Facebook trong tab mới`}
    >
      <span>{sender.name}</span>
      <ArrowUpRight size={signature ? 15 : 11} strokeWidth={1.3} aria-hidden="true" />
    </a>
  );
}
