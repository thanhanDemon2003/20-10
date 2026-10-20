import "server-only";
import { HttpError } from "./http";

type Window = { startedAt: number; count: number };
const buckets = new Map<string, Window>();

/**
 * An early, per-instance guard only. No IP addresses or browser identifiers are
 * collected. Production login protection also needs a Vercel Firewall rule.
 * Message writes additionally enforce a durable limit inside the JSON CAS.
 */
export function applyInstanceRateLimit(key: "messages" | "login", now = Date.now()) {
  const limit = key === "login" ? 10 : 60;
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= 60_000) {
    buckets.set(key, { startedAt: now, count: 1 });
    return;
  }
  if (current.count >= limit) {
    throw new HttpError(429, "Bạn đang thao tác hơi nhanh. Hãy chờ một phút rồi thử lại nhé.");
  }
  current.count += 1;
}
