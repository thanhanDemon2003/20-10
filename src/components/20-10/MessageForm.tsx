"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, LoaderCircle, Send } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Recipient } from "@/config/recipients";

type ReplyState = "choice" | "compose" | "sent" | "closed";

export function MessageForm({ recipient }: { recipient: Recipient }) {
  const [state, setState] = useState<ReplyState>("choice");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const reduced = useReducedMotion();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (cleanName.length < 2 || cleanName.length > 50) { setError("Tên cần có từ 2 đến 50 ký tự nhé."); return; }
    if (!message.trim() || message.trim().length > 1000) { setError("Hãy viết lời nhắn từ 1 đến 1.000 ký tự nhé."); return; }
    setPending(true); setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, message: message.trim(), recipientId: recipient.id, website }),
      });
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error(data.error || "Chưa gửi được lời nhắn. Thử lại một chút nữa nhé.");
      setState("sent");
    } catch (error) { setError(error instanceof Error ? error.message : "Kết nối đang gián đoạn. Thử lại nhé."); }
    finally { setPending(false); }
  }

  return <section id="reply-section" className="response-section" aria-labelledby="response-title" tabIndex={-1}>
    <div className="response-divider"><span /><Heart size={17} strokeWidth={1.1} /><span /></div>
    <AnimatePresence mode="wait">
      <motion.div key={state} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .35 }}>
        {state === "choice" && <>
          <p className="eyebrow">MỘT LỜI NHẮN, NẾU MUỐN</p>
          <h2 id="response-title">{recipient.responseTitle}</h2>
          <p className="response-intro">{recipient.responseIntro}</p>
          <div className="reply-choices"><button className="primary-button" onClick={() => setState("compose")}>{recipient.responseYesLabel}<Send size={16} /></button><button className="text-button" onClick={() => setState("closed")}>{recipient.responseNoLabel}<Heart size={14} /></button></div>
        </>}
        {state === "compose" && <form className="reply-form" onSubmit={submit} noValidate>
          <button className="text-button back-button" type="button" disabled={pending} onClick={() => { setState("choice"); setError(""); }}><ArrowLeft size={14} /> Quay lại</button>
          <h2 id="response-title">Vài dòng gửi lại…</h2>
          <label htmlFor="reply-name">Tên của bạn</label>
          <input autoFocus id="reply-name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" minLength={2} maxLength={50} placeholder="Tên để Thành An nhận ra lời nhắn" required aria-describedby={error ? "reply-error" : undefined} disabled={pending} />
          <div className="message-label"><label htmlFor="reply-message">Lời nhắn gửi</label><span>{message.length}/1.000</span></div>
          <textarea id="reply-message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={5} placeholder="Một lời nhắn nhỏ, một điều muốn kể…" required aria-describedby={error ? "reply-error" : undefined} disabled={pending} />
          <div className="honeypot" aria-hidden="true"><label htmlFor="reply-website">Để trống ô này</label><input id="reply-website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" /></div>
          {error && <p id="reply-error" className="form-error" role="alert">{error}</p>}
          <button className="primary-button send-button" disabled={pending} type="submit">{pending ? "Đang gửi lời nhắn…" : "Gửi những điều thật lòng"}{pending ? <LoaderCircle size={17} className="spin" /> : <ArrowRight size={17} />}</button>
          <p className="privacy-note">Những dòng này chỉ Thành An đọc được.</p>
        </form>}
        {(state === "sent" || state === "closed") && <div className="reply-ending" role="status">
          <div className="ending-icon">{state === "sent" ? <Check size={23} strokeWidth={1.2} /> : <Heart size={23} strokeWidth={1.2} />}</div>
          <h2 id="response-title">{state === "sent" ? "Những lời thương đã đến nơi." : "Yêu thương vẫn ở đây."}</h2>
          <p>{state === "sent" ? recipient.responseSuccess : recipient.responseEnd}</p>
          {state === "closed" && <button className="text-button" onClick={() => setState("compose")}>Nếu muốn, vẫn có thể viết vài dòng <ArrowRight size={14} /></button>}
        </div>}
      </motion.div>
    </AnimatePresence>
  </section>;
}
