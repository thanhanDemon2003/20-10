import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { z } from "zod";
import { HttpError } from "./http";
import type { GiftMessage, MessageDocument, MessageInput } from "./message-types";

export const MESSAGE_BLOB_PATH = "20-10/messages.json";
const MAX_WRITE_ATTEMPTS = 6;
const documentSchema = z.object({
  version: z.literal(1),
  messages: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(2).max(50),
    message: z.string().min(1).max(1000),
    recipientId: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    createdAt: z.string().datetime(),
  }).strict()),
}).strict();

const emptyDocument = (): MessageDocument => ({ version: 1, messages: [] });

export function parseMessageDocument(value: unknown): MessageDocument {
  const parsed = documentSchema.safeParse(value);
  if (!parsed.success) {
    // Never replace a corrupt or unknown schema with an empty document.
    throw new HttpError(503, "Hộp thư tạm thời chưa đọc được. Vui lòng thử lại sau.");
  }
  return parsed.data;
}

export interface MessageStore {
  read(): Promise<MessageDocument>;
  append(message: GiftMessage): Promise<void>;
}

function checkDurableRateLimit(document: MessageDocument, incoming: GiftMessage) {
  const cutoff = Date.parse(incoming.createdAt) - 60_000;
  const recent = document.messages.filter((message) => Date.parse(message.createdAt) > cutoff);
  if (recent.length >= 30 || recent.filter((message) => message.recipientId === incoming.recipientId).length >= 5) {
    throw new HttpError(429, "Hộp thư vừa nhận nhiều lời nhắn. Bạn chờ một phút rồi gửi lại nhé.");
  }
}

function addToDocument(document: MessageDocument, message: GiftMessage): MessageDocument {
  checkDurableRateLimit(document, message);
  return { version: 1, messages: [...document.messages, message] };
}

function isFileError(error: unknown, code: string) {
  return error instanceof Error && "code" in error && error.code === code;
}

/**
 * A same-directory rename prevents partial JSON. An exclusive lock file
 * serializes writers across local Node processes, not just a single instance.
 * If a process is killed mid-write, remove the .lock only after stopping all
 * local servers; the original JSON remains intact.
 */
export function createLocalMessageStore(filePath: string): MessageStore {
  async function read(): Promise<MessageDocument> {
    try {
      return parseMessageDocument(JSON.parse(await readFile(filePath, "utf8")) as unknown);
    } catch (error) {
      if (isFileError(error, "ENOENT")) return emptyDocument();
      throw error;
    }
  }

  async function append(message: GiftMessage) {
    await mkdir(dirname(filePath), { recursive: true });
    const lockPath = `${filePath}.lock`;
    let lock: Awaited<ReturnType<typeof open>> | undefined;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        lock = await open(lockPath, "wx", 0o600);
        break;
      } catch (error) {
        if (!isFileError(error, "EEXIST")) throw error;
        await delay(25);
      }
    }
    if (!lock) {
      throw new HttpError(503, "Hộp thư đang bận. Vui lòng thử gửi lại sau một lát.");
    }
    const tempPath = `${filePath}.${randomUUID()}.tmp`;
    try {
      const current = await read();
      if (current.messages.some((item) => item.id === message.id)) return;
      const next = addToDocument(current, message);
      const temp = await open(tempPath, "wx", 0o600);
      try {
        await temp.writeFile(`${JSON.stringify(next, null, 2)}\n`, "utf8");
        await temp.sync();
      } finally {
        await temp.close();
      }
      await rename(tempPath, filePath);
    } finally {
      try {
        await unlink(tempPath).catch((error: unknown) => {
          if (!isFileError(error, "ENOENT")) throw error;
        });
      } finally {
        await lock.close();
        await unlink(lockPath);
      }
    }
  }
  return { read, append };
}

export interface BlobSnapshot {
  document: MessageDocument;
  etag: string;
}

export interface MessageBlobAdapter {
  read(): Promise<BlobSnapshot | null>;
  write(document: MessageDocument, etag: string | null): Promise<void>;
  isConflict(error: unknown): boolean;
}

const vercelAdapter: MessageBlobAdapter = {
  async read() {
    // useCache:false reads origin storage; Cache-Control alone cannot bypass
    // Vercel Blob's CDN. Required for both fresh admin reads and CAS retries.
    const result = await get(MESSAGE_BLOB_PATH, { access: "private", useCache: false });
    if (!result) return null;
    if (result.statusCode !== 200 || !result.stream || !result.blob.etag) {
      throw new Error("Private blob response is missing content or ETag.");
    }
    const document = parseMessageDocument(await new Response(result.stream).json());
    return { document, etag: result.blob.etag };
  },
  async write(document, etag) {
    await put(MESSAGE_BLOB_PATH, JSON.stringify(document), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
      allowOverwrite: etag !== null,
      ...(etag !== null ? { ifMatch: etag } : {}),
    });
  },
  isConflict(error) {
    // SDK exposes a typed ETag error; create-only collisions are BlobError
    // with this documented message, rather than a separate exported class.
    return error instanceof BlobPreconditionFailedError ||
      (error instanceof Error && /this blob already exists/i.test(error.message));
  },
};

export function createBlobMessageStore(
  adapter: MessageBlobAdapter = vercelAdapter,
  wait: (milliseconds: number) => Promise<unknown> = delay,
): MessageStore {
  return {
    async read() {
      return (await adapter.read())?.document ?? emptyDocument();
    },
    async append(message) {
      for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
        const current = await adapter.read();
        // Also handles an SDK retry after a write succeeded but its response
        // was interrupted; the same server-generated UUID is never appended twice.
        if (current?.document.messages.some((item) => item.id === message.id)) return;
        const next = addToDocument(current?.document ?? emptyDocument(), message);
        try {
          await adapter.write(next, current?.etag ?? null);
          return;
        } catch (error) {
          if (!adapter.isConflict(error)) throw error;
          if (attempt === MAX_WRITE_ATTEMPTS - 1) {
            throw new HttpError(503, "Hộp thư đang bận. Lời nhắn chưa được lưu, bạn thử lại nhé.");
          }
          await wait(30 * 2 ** attempt + Math.floor(Math.random() * 30));
        }
      }
    },
  };
}

export function getMessageStore(): MessageStore {
  const hasBlobAuth = Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN);
  if (hasBlobAuth) return createBlobMessageStore();
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new HttpError(
      503,
      "Hộp thư chưa được kết nối. Chủ website cần cấu hình Vercel Blob riêng tư trước khi nhận lời nhắn.",
    );
  }
  return createLocalMessageStore(join(process.cwd(), "data", "messages.json"));
}

export async function saveMessage(input: MessageInput): Promise<void> {
  const message: GiftMessage = {
    id: randomUUID(),
    name: input.name,
    message: input.message,
    recipientId: input.recipientId,
    createdAt: new Date().toISOString(),
  };
  await getMessageStore().append(message);
}

export async function readMessages(): Promise<MessageDocument> {
  const document = await getMessageStore().read();
  return {
    version: 1,
    messages: [...document.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}
