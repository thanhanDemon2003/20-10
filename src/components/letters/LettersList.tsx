"use client";

import { Download, LogOut, Mail, RefreshCw } from "lucide-react";
import { recipients, type RecipientId } from "@/config/recipients";
import styles from "./letters.module.css";

export interface Letter {
  id: string;
  name: string;
  message: string;
  recipientId: RecipientId;
  createdAt: string;
}

interface LettersListProps {
  letters: Letter[];
  busy: boolean;
  error: string;
  onRefresh: () => void;
  onLogout: () => void;
  onExport: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export default function LettersList({ letters, busy, error, onRefresh, onLogout, onExport }: LettersListProps) {
  return (
    <section className={styles.inbox} aria-labelledby="inbox-title">
      <div className={styles.inboxHeading}>
        <div>
          <p className={styles.eyebrow}>NHỮNG ĐIỀU NHỎ BÉ, ĐƯỢC GIỮ LẠI</p>
          <h1 id="inbox-title">Hộp thư <em>yêu thương.</em></h1>
          <p className={styles.count} aria-live="polite">{letters.length} lời nhắn · Mới nhất ở đầu</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.iconButton} type="button" onClick={onRefresh} disabled={busy}>
            <RefreshCw size={16} aria-hidden="true" /><span>{busy ? "Đang tải…" : "Làm mới"}</span>
          </button>
          <button className={styles.iconButton} type="button" onClick={onExport} disabled={busy}>
            <Download size={16} aria-hidden="true" /><span>Xuất JSON</span>
          </button>
          <button className={styles.iconButton} type="button" onClick={onLogout} disabled={busy}>
            <LogOut size={16} aria-hidden="true" /><span>Đăng xuất</span>
          </button>
        </div>
      </div>
      {error && <p className={styles.errorBanner} role="alert">{error}</p>}
      {letters.length === 0 ? (
        <div className={styles.empty}>
          <Mail size={38} strokeWidth={1.1} aria-hidden="true" />
          <h2>Một chỗ nhỏ, chờ lời nhắn.</h2>
          <p>Khi ai đó gửi lời nhắn từ tấm thiệp, bạn sẽ tìm thấy ở đây.</p>
        </div>
      ) : (
        <ol className={styles.letterList}>
          {letters.map((letter) => (
            <li key={letter.id}>
              <article className={styles.letter}>
                <header className={styles.letterHeader}>
                  <div>
                    <p className={styles.from}>TỪ</p>
                    <h2>{letter.name}</h2>
                  </div>
                  <time dateTime={letter.createdAt}>{dateFormatter.format(new Date(letter.createdAt))}</time>
                </header>
                <p className={styles.letterBody}>{letter.message}</p>
                <footer className={styles.letterFooter}>
                  <span className={styles.dot} aria-hidden="true" />
                  Thiệp dành cho {recipients[letter.recipientId]?.recipientLabel || "người nhận"} · #{letter.recipientId}
                </footer>
              </article>
            </li>
          ))}
        </ol>
      )}
      <p className={styles.inboxNote}>Lời nhắn riêng tư · Thời gian hiển thị theo giờ Việt Nam</p>
    </section>
  );
}
