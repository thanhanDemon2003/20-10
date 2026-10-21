"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Recipient } from "@/config/recipients";
import { Botanical, FlowerMark } from "./Botanical";
import { MessageForm } from "./MessageForm";
import { SenderLink } from "./SenderLink";
import { Reveal, ScrollInvitation } from "./ScrollDetails";
import styles from "./GreetingCard.module.css";

export function GreetingCard({ recipient }: { recipient: Recipient }) {
  const reduced = useReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const composition = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = viewport.current;
    const letter = composition.current;
    if (!frame || !letter) return;
    let active = true;
    let pendingFrame = 0;
    const fit = () => {
      if (!active) return;
      const scale = Math.min(1, (frame.clientWidth - 8) / letter.offsetWidth,
        (frame.clientHeight - 24) / letter.offsetHeight);
      letter.style.setProperty("--letter-scale", String(Math.max(.1, scale)));
    };
    const scheduleFit = () => {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = requestAnimationFrame(fit);
    };
    const observer = new ResizeObserver(scheduleFit);
    observer.observe(frame);
    observer.observe(letter);
    fit();
    void document.fonts.ready.then(scheduleFit);
    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(pendingFrame);
    };
  }, [recipient.id]);

  return <section className={styles.scene} aria-labelledby="scene-title">
    <div ref={viewport} className={styles.viewport} data-letter-viewport>
      <div ref={composition} className={styles.composition} data-letter-composition>
        <motion.div className={styles.reveal} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .85, ease: [.22, 1, .36, 1] }}>
          <div className={styles.flower}><Image src="/images/bouquet.png" width={1145} height={1373} alt="Bó hồng phấn dành tặng bạn" sizes="(max-width: 700px) 150px, 180px" priority /></div>
          <article className={styles.card} data-letter-card>
      <div className={styles.border} aria-hidden="true" />
      <p className={styles.eyebrow}>20 THÁNG 10 · DÀNH RIÊNG CHO {recipient.recipientPronoun.toLocaleUpperCase("vi")}</p>
      <h1 id="scene-title" tabIndex={-1}>{recipient.greetingTitle.split("\n")[0]}<br /><em>{recipient.greetingTitle.split("\n").slice(1).join(" ")}</em></h1>
      <FlowerMark className={styles.mark} />
      <div className={styles.body}>{recipient.greetingMessage.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <p className={styles.closing}>{recipient.closingMessage}</p>
      <div className={styles.signature}><span>{recipient.signature}</span><SenderLink signature /><span className={styles.date}>20 tháng 10 · Một lời chúc từ trái tim</span></div>
      <Botanical className={styles.sprig} />
          </article>
        </motion.div>
      </div>
    </div>
    <ScrollInvitation pronoun={recipient.recipientPronoun} />
    <Reveal><MessageForm recipient={recipient} /></Reveal>
  </section>;
}
