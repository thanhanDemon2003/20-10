"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import styles from "./letters.module.css";

interface LettersLoginProps {
  onLogin: () => Promise<void>;
}

export default function LettersLogin({ onLogin }: LettersLoginProps) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (!password) {
      setError("Bạn hãy nhập mật khẩu để mở hộp thư nhé.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Chưa đăng nhập được. Bạn thử lại nhé.");
        return;
      }
      setPassword("");
      await onLogin();
    } catch {
      setError("Chưa kết nối được với hộp thư. Bạn kiểm tra kết nối rồi thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.loginCard} aria-labelledby="login-title">
      <div className={styles.seal} aria-hidden="true"><LockKeyhole size={23} strokeWidth={1.3} /></div>
      <p className={styles.eyebrow}>MỘT GÓC RIÊNG CỦA NGƯỜI GỬI</p>
      <h1 id="login-title">Những lời nhắn<br /><em>được gửi về.</em></h1>
      <p className={styles.intro}>Mở hộp thư để đọc những điều mọi người muốn gửi tới bạn.</p>
      <form onSubmit={submit} className={styles.loginForm}>
        <label htmlFor="admin-password">Mật khẩu hộp thư</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-describedby={error ? "login-error" : undefined}
          aria-invalid={Boolean(error)}
          disabled={busy}
          placeholder="Nhập mật khẩu của bạn"
          required
        />
        {error && <p id="login-error" className={styles.error} role="alert">{error}</p>}
        <button className={styles.primaryButton} type="submit" disabled={busy}>
          {busy ? "Đang mở hộp thư…" : "Mở hộp thư"} <ArrowRight size={17} aria-hidden="true" />
        </button>
      </form>
      <p className={styles.privacyNote}>Chỉ bạn mới có thể đọc những lời nhắn này.</p>
    </section>
  );
}
