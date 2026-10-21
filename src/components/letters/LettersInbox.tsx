"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Flower2 } from "lucide-react";
import LettersLogin from "./LettersLogin";
import LettersList, { type Letter } from "./LettersList";
import styles from "./letters.module.css";

type SessionState = "loading" | "anonymous" | "authenticated" | "error";
type InboxResult = { authenticated: false } | { authenticated: true; letters: Letter[] };

async function requestLetters(signal?: AbortSignal): Promise<InboxResult> {
  const response = await fetch("/api/messages", { cache: "no-store", credentials: "same-origin", signal });
  if (response.status === 401) return { authenticated: false };
  const data = (await response.json()) as { messages?: Letter[]; error?: string };
  if (!response.ok || !Array.isArray(data.messages)) {
    throw new Error(data.error || "Chưa tải được lời nhắn. Bạn thử lại nhé.");
  }
  return {
    authenticated: true,
    letters: [...data.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export default function LettersInbox() {
  const [session, setSession] = useState<SessionState>("loading");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const receiveLetters = useCallback((result: InboxResult) => {
    setLetters(result.authenticated ? result.letters : []);
    setSession(result.authenticated ? "authenticated" : "anonymous");
    setError("");
  }, []);

  const receiveError = useCallback((caught: unknown) => {
    setError(caught instanceof Error ? caught.message : "Chưa kết nối được với hộp thư.");
    setSession((current) => current === "authenticated" ? current : "error");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void requestLetters(controller.signal).then((result) => {
      if (!controller.signal.aborted) receiveLetters(result);
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) receiveError(caught);
    });
    return () => controller.abort();
  }, [receiveLetters, receiveError]);

  async function loadLetters() {
    try {
      receiveLetters(await requestLetters());
    } catch (caught) {
      receiveError(caught);
    }
  }

  async function refresh() {
    if (busy) return;
    setBusy(true);
    await loadLetters();
    setBusy(false);
  }

  async function logout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok && response.status !== 401) throw new Error("Chưa đăng xuất được. Bạn thử lại nhé.");
      setLetters([]);
      setSession("anonymous");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Chưa kết nối được với hộp thư.");
    } finally {
      setBusy(false);
    }
  }

  async function exportLetters() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/messages?download=1", { cache: "no-store", credentials: "same-origin" });
      if (response.status === 401) {
        setLetters([]);
        setSession("anonymous");
        return;
      }
      if (!response.ok) throw new Error("Chưa xuất được lời nhắn. Bạn thử lại nhé.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `loi-nhan-20-10-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Chưa xuất được lời nhắn.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/20-10" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> Về những tấm thiệp</Link>
        <span className={styles.brand}><Flower2 size={19} strokeWidth={1.2} aria-hidden="true" /> 20.10</span>
      </header>
      {session === "loading" && <p className={styles.loading} role="status">Đang mở hộp thư…</p>}
      {session === "anonymous" && <LettersLogin onLogin={loadLetters} />}
      {session === "authenticated" && (
        <LettersList letters={letters} busy={busy} error={error} onRefresh={refresh} onLogout={logout} onExport={exportLetters} />
      )}
      {session === "error" && (
        <section className={styles.loginCard}>
          <h1>Hộp thư đang<br /><em>chờ một chút.</em></h1>
          <p className={styles.error} role="alert">{error}</p>
          <button type="button" className={styles.primaryButton} onClick={refresh} disabled={busy}>{busy ? "Đang tải…" : "Thử tải lại"}</button>
        </section>
      )}
    </main>
  );
}
