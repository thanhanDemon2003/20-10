import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import test from "node:test";
import {
  ADMIN_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, adminCookieOptions,
  createSessionToken, verifyAdminPassword, verifySessionToken,
} from "../src/lib/admin-session";
import { HttpError, readSmallJson, requireSameOrigin } from "../src/lib/http";
import {
  createBlobMessageStore, createLocalMessageStore, getMessageStore, parseMessageDocument,
  type BlobSnapshot, type MessageBlobAdapter,
} from "../src/lib/message-store";
import { parseMessageInput } from "../src/lib/message-validation";
import type { GiftMessage, MessageDocument, RecipientId } from "../src/lib/message-types";
import { getRecipient, recipients, sender } from "../src/config/recipients";
import { GET as getMessages, POST as postMessage } from "../src/app/api/messages/route";
import { POST as login } from "../src/app/api/admin/login/route";
import { POST as logout } from "../src/app/api/admin/logout/route";

const testPassword = "test-only-long-password";
const testSecret = "test-only-session-secret-32-characters-minimum";
const originalEnv = { ...process.env };
const savedCwd = process.cwd();

function message(recipientId: RecipientId = 1): GiftMessage {
  return {
    id: randomUUID(), name: "Người nhận", message: "Cảm ơn anh!\nMột ngày thật vui.",
    recipientId, createdAt: new Date().toISOString(),
  };
}

function request(path: string, body?: unknown, cookie?: string): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Origin: "http://localhost:3000", "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function assertHttp(status: number) {
  return (error: unknown) => error instanceof HttpError && error.status === status;
}

test("backend: validation, persistence, CAS, auth and API contracts", async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), "gift-backend-tests-"));
  Object.assign(process.env, {
    NODE_ENV: "test", LETTERS_ADMIN_PASSWORD: testPassword, ADMIN_SESSION_SECRET: testSecret,
  });
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.VERCEL;
  try {
    await t.test("normalizes Vietnamese input and rejects invalid/extra values", () => {
      assert.deepEqual(parseMessageInput({
        name: "  Người   nhận  ", message: "  Cảm  ơn!\r\n Chúc vui.  ", recipientId: 2, website: "",
      }), { name: "Người nhận", message: "Cảm ơn!\n Chúc vui.", recipientId: 2 });
      for (const bad of [
        { name: "", message: "Chào", recipientId: 1 },
        { name: "An", message: "x".repeat(1001), recipientId: 1 },
        { name: "An", message: " \n ", recipientId: 1 },
        { name: "An", message: "Chào", recipientId: 99 },
        { name: "An", message: "Chào", recipientId: "1" },
        { name: "An", message: "Chào", recipientId: 1, id: randomUUID() },
        { name: "An", message: "Chào", recipientId: 1, website: "spam" },
      ]) assert.throws(() => parseMessageInput(bad), assertHttp(400));
    });

    await t.test("four recipient configurations preserve pronouns and share one sender identity", () => {
      assert.deepEqual(Object.values(recipients).map(({ id }) => id), [1, 2, 3, 4]);
      assert.deepEqual(Object.values(recipients).map(({ senderPronoun }) => senderPronoun), ["con", "mình", "anh", "em"]);
      assert.equal(getRecipient("4")?.recipientPronoun, "chị");
      assert.equal(getRecipient("99"), null);
      assert.equal(getRecipient(undefined), null);
      assert.equal(sender.name, "Thành An");
      assert.equal(sender.facebookUrl, "https://www.facebook.com/thanhanthinker");
    });

    await t.test("recipient four validates and persists alongside earlier recipient messages", async () => {
      const input = parseMessageInput({ name: "Chị yêu", message: "Cảm ơn em.", recipientId: 4, website: "" });
      assert.equal(input.recipientId, 4);
      const legacyEntries = [message(1), message(2), message(3)];
      const legacyDocument = { version: 1, messages: legacyEntries };
      assert.deepEqual(parseMessageDocument(legacyDocument), legacyDocument);
      const path = join(workspace, "four-recipients", "messages.json");
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, JSON.stringify(legacyDocument));
      await createLocalMessageStore(path).append({ ...message(4), ...input });
      const reloaded = await createLocalMessageStore(path).read();
      assert.deepEqual(reloaded.messages.map(({ recipientId }) => recipientId), [1, 2, 3, 4]);
      assert.deepEqual(reloaded.messages.slice(0, 3), legacyEntries);
      assert.equal(reloaded.messages[3].message, "Cảm ơn em.");
    });

    await t.test("limits streaming bodies and rejects foreign or missing origin", async () => {
      await assert.rejects(readSmallJson(request("/api/messages", { big: "x".repeat(9000) })), assertHttp(413));
      await assert.rejects(readSmallJson(new Request("http://localhost/", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad",
      })), assertHttp(400));
      await assert.rejects(readSmallJson(new Request("http://localhost/", {
        method: "POST", body: "{}",
      })), assertHttp(415));
      assert.throws(() => requireSameOrigin(new Request("http://localhost:3000/api/messages")), assertHttp(403));
      assert.throws(() => requireSameOrigin(new Request("http://localhost:3000/api/messages", {
        headers: { Origin: "https://example.com", "X-Forwarded-Host": "example.com" },
      })), assertHttp(403));
      requireSameOrigin(request("/api/messages", {}));
    });

    await t.test("origin checks honor the browser Host behind Next's bind address without trusting forwarding headers", () => {
      requireSameOrigin(new Request("http://0.0.0.0:3000/api/messages", {
        headers: { Origin: "http://localhost:3000", Host: "localhost:3000", "Sec-Fetch-Site": "same-origin" },
      }));
      requireSameOrigin(new Request("http://0.0.0.0:3000/api/messages", {
        headers: { Origin: "http://127.0.0.1:3000", Host: "127.0.0.1:3000" },
      }));
      const hostileHeaders: Record<string, string>[] = [
        { Origin: "https://foreign.example", Host: "localhost:3000", "X-Forwarded-Host": "foreign.example" },
        { Origin: "https://localhost:3000", Host: "localhost:3000" },
        { Origin: "http://localhost:3000", Host: "localhost:3000", "Sec-Fetch-Site": "cross-site" },
        { Origin: "http://localhost:3000", Host: "localhost:3000,foreign.example" },
        { Origin: "http://localhost:3000/path", Host: "localhost:3000" },
        { Origin: "http://foreign.example", Host: "localhost:3000@foreign.example" },
      ];
      for (const headers of hostileHeaders) {
        assert.throws(() => requireSameOrigin(new Request("http://0.0.0.0:3000/api/messages", {
          headers,
        })), assertHttp(403));
      }
      Object.assign(process.env, { NODE_ENV: "production", VERCEL: "1" });
      try {
        requireSameOrigin(new Request("http://internal:3000/api/messages", {
          headers: { Origin: "https://gift.example", Host: "gift.example" },
        }));
        assert.throws(() => requireSameOrigin(new Request("http://internal:3000/api/messages", {
          headers: { Origin: "http://gift.example", Host: "gift.example" },
        })), assertHttp(403));
      } finally {
        Object.assign(process.env, { NODE_ENV: "test" });
        delete process.env.VERCEL;
      }
    });

    await t.test("sessions expire, reject tampering and revoke when secrets change", () => {
      const now = Date.now();
      const token = createSessionToken(now);
      assert.equal(verifyAdminPassword(testPassword), true);
      assert.equal(verifyAdminPassword("wrong-password"), false);
      assert.equal(verifySessionToken(token, now), true);
      assert.equal(verifySessionToken(`${token}x`, now), false);
      assert.equal(verifySessionToken(token, now + SESSION_MAX_AGE_SECONDS * 1000), false);
      assert.equal(verifySessionToken(createSessionToken(now + 60_000), now), false);
      process.env.LETTERS_ADMIN_PASSWORD = "changed-password-for-test";
      assert.equal(verifySessionToken(token, now), false);
      process.env.LETTERS_ADMIN_PASSWORD = testPassword;
      delete process.env.ADMIN_SESSION_SECRET;
      assert.equal(verifySessionToken(token, now), false);
      assert.throws(() => createSessionToken(), assertHttp(503));
      process.env.ADMIN_SESSION_SECRET = testSecret;
      Object.assign(process.env, { NODE_ENV: "production" });
      assert.deepEqual(adminCookieOptions(), {
        httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: SESSION_MAX_AGE_SECONDS,
      });
      Object.assign(process.env, { NODE_ENV: "test" });
    });

    await t.test("local concurrent writers preserve messages and valid JSON on reload", async () => {
      const path = join(workspace, "concurrency", "messages.json");
      const messages = Array.from({ length: 8 }, (_, index) => message(index % 2 ? 1 : 2));
      await Promise.all(messages.map((entry) => createLocalMessageStore(path).append(entry)));
      const reloaded = await createLocalMessageStore(path).read();
      assert.equal(reloaded.messages.length, 8);
      assert.equal(new Set(reloaded.messages.map((entry) => entry.id)).size, 8);
      assert.deepEqual((await readdir(join(workspace, "concurrency"))), ["messages.json"]);
      await createLocalMessageStore(path).append(messages[0]);
      assert.equal((await createLocalMessageStore(path).read()).messages.length, 8);
      assert.equal(JSON.parse(await readFile(path, "utf8")).version, 1);
    });

    await t.test("durable rate limits apply inside serialized JSON updates", async () => {
      const path = join(workspace, "limit", "messages.json");
      const store = createLocalMessageStore(path);
      for (let i = 0; i < 5; i += 1) await store.append(message());
      await assert.rejects(store.append(message()), assertHttp(429));
      assert.equal((await store.read()).messages.length, 5);
    });

    await t.test("corrupt JSON and failed local writes never report success or erase old data", async () => {
      const path = join(workspace, "broken.json");
      await writeFile(path, "{broken");
      await assert.rejects(createLocalMessageStore(path).append(message()));
      assert.equal(await readFile(path, "utf8"), "{broken");
      const directoryPath = join(workspace, "not-a-file.json");
      await mkdir(directoryPath);
      await assert.rejects(createLocalMessageStore(directoryPath).append(message()));
      assert.equal((await readdir(workspace)).some((entry) => entry.endsWith(".lock")), false);
    });

    await t.test("private Blob CAS handles concurrent creation and existing-version conflicts", async () => {
      let snapshot: BlobSnapshot | null = null;
      let revision = 0;
      let conflicts = 0;
      const attemptedEtags: Array<string | null> = [];
      class Conflict extends Error {}
      const adapter: MessageBlobAdapter = {
        async read() {
          const captured = structuredClone(snapshot);
          await new Promise((resolve) => setTimeout(resolve, 2));
          return captured;
        },
        async write(document, etag) {
          attemptedEtags.push(etag);
          if ((snapshot?.etag ?? null) !== etag) {
            conflicts += 1;
            throw new Conflict();
          }
          snapshot = { document: structuredClone(document), etag: String(++revision) };
        },
        isConflict: (error) => error instanceof Conflict,
      };
      const store = createBlobMessageStore(adapter, async () => {});
      const first = message(1);
      await Promise.all([store.append(first), store.append(message(2))]);
      assert.equal((await store.read()).messages.length, 2);
      assert.ok(conflicts >= 1);
      assert.equal(attemptedEtags.filter((etag) => etag === null).length, 2);
      await Promise.all([store.append(message(1)), store.append(message(2))]);
      assert.equal((await store.read()).messages.length, 4);
      assert.ok(conflicts >= 2);
      await store.append(first);
      assert.equal((await store.read()).messages.length, 4);
    });

    await t.test("Blob write failure propagates and conflict retries are bounded", async () => {
      let writes = 0;
      const document: MessageDocument = { version: 1, messages: [] };
      const failure = new Error("storage unavailable");
      const adapter: MessageBlobAdapter = {
        read: async () => ({ document, etag: "version" }),
        write: async () => { writes += 1; throw failure; },
        isConflict: () => false,
      };
      await assert.rejects(createBlobMessageStore(adapter).append(message()), failure);
      assert.equal(writes, 1);
      writes = 0;
      adapter.isConflict = () => true;
      await assert.rejects(createBlobMessageStore(adapter, async () => {}).append(message()), assertHttp(503));
      assert.equal(writes, 6);
      assert.equal(document.messages.length, 0);
    });

    await t.test("production without a Blob connection fails closed", () => {
      Object.assign(process.env, { NODE_ENV: "production" });
      assert.throws(() => getMessageStore(), assertHttp(503));
      Object.assign(process.env, { NODE_ENV: "test" });
    });

    await t.test("API validates, persists, guards private reads, exports, expires and logs out", async () => {
      process.chdir(workspace);
      const unauth = await getMessages(request("/api/messages"));
      assert.equal(unauth.status, 401);
      assert.equal(unauth.headers.get("cache-control"), "private, no-store, max-age=0");
      assert.equal((await getMessages(request("/api/messages?download=1"))).status, 401);
      assert.equal((await login(request("/api/admin/login", { password: "wrong" }))).status, 401);
      const loggedIn = await login(request("/api/admin/login", { password: testPassword }));
      assert.equal(loggedIn.status, 200);
      const setCookie = loggedIn.headers.get("set-cookie")!;
      assert.match(setCookie, /HttpOnly/i);
      assert.match(setCookie, /SameSite=strict/i);
      const cookie = setCookie.split(";")[0];
      const validInput = { name: "Mẹ yêu", message: "Cảm ơn con.\nMẹ rất vui.", recipientId: 1, website: "" };
      const saved = await postMessage(new Request("http://0.0.0.0:3000/api/messages", {
        method: "POST",
        headers: { Origin: "http://localhost:3000", Host: "localhost:3000", "Content-Type": "application/json" },
        body: JSON.stringify(validInput),
      }));
      assert.equal(saved.status, 201);
      assert.deepEqual(await saved.json(), { ok: true });
      const stored = JSON.parse(await readFile(join(workspace, "data/messages.json"), "utf8")) as MessageDocument;
      assert.equal(stored.messages.length, 1);
      assert.match(stored.messages[0].id, /^[0-9a-f-]{36}$/);
      assert.equal(stored.messages[0].message, validInput.message);
      const sisterSaved = await postMessage(request("/api/messages", {
        name: "Chị", message: "Cảm ơn em, Thành An.", recipientId: 4, website: "",
      }));
      assert.equal(sisterSaved.status, 201);
      assert.deepEqual(await sisterSaved.json(), { ok: true });
      const inbox = await getMessages(request("/api/messages", undefined, cookie));
      assert.equal(inbox.status, 200);
      const inboxDocument = await inbox.json() as MessageDocument;
      assert.equal(inboxDocument.messages.length, 2);
      assert.ok(inboxDocument.messages.some((entry) => entry.recipientId === 4 && entry.message === "Cảm ơn em, Thành An."));
      const download = await getMessages(request("/api/messages?download=1", undefined, cookie));
      assert.equal(download.status, 200);
      assert.match(download.headers.get("content-disposition")!, /attachment/);
      for (const input of [
        { ...validInput, name: "" },
        { ...validInput, message: "x".repeat(1001) },
        { ...validInput, recipientId: 9 },
        { ...validInput, website: "https://spam.example" },
      ]) assert.equal((await postMessage(request("/api/messages", input))).status, 400);
      const expiredCookie = `${ADMIN_COOKIE_NAME}=${createSessionToken(Date.now() - (SESSION_MAX_AGE_SECONDS + 1) * 1000)}`;
      assert.equal((await getMessages(request("/api/messages", undefined, expiredCookie))).status, 401);
      const loggedOut = await logout(request("/api/admin/logout", {}, cookie));
      assert.equal(loggedOut.status, 200);
      assert.match(loggedOut.headers.get("set-cookie")!, /Max-Age=0/i);
      assert.equal((await getMessages(request("/api/messages"))).status, 401);
      const foreignLogout = new Request("http://localhost:3000/api/admin/logout", {
        method: "POST", headers: { Cookie: cookie, Origin: "https://foreign.example" },
      });
      assert.equal((await logout(foreignLogout)).status, 403);
      Object.assign(process.env, { NODE_ENV: "production" });
      const failure = await postMessage(request("/api/messages", validInput));
      assert.equal(failure.status, 503);
      assert.equal("ok" in await failure.json(), false);
      Object.assign(process.env, { NODE_ENV: "test" });
      assert.equal((await createLocalMessageStore(join(workspace, "data/messages.json")).read()).messages.length, 2);
    });
  } finally {
    process.chdir(savedCwd);
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
    const cleanupPath = resolve(workspace);
    assert.equal(dirname(cleanupPath).toLowerCase(), resolve(tmpdir()).toLowerCase());
    assert.ok(basename(cleanupPath).startsWith("gift-backend-tests-"));
    await rm(cleanupPath, { recursive: true, force: true });
  }
});
