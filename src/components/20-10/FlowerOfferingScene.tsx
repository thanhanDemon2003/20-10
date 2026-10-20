"use client";

import { ArrowRight, Flower2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Recipient } from "@/config/recipients";
import { BoyIllustration } from "./BoyIllustration";
import { Botanical } from "./Botanical";

export function FlowerOfferingScene({ recipient, giving, onAccept }: { recipient: Recipient; giving: boolean; onAccept: () => void }) {
  const reduced = useReducedMotion();
  return <section className="scene offering-scene" aria-labelledby="scene-title">
    <div className="scene-copy">
      <p className="eyebrow">MỘT CHÚT HƯƠNG HOA · MỘT CHÚT THẬT LÒNG</p>
      <h1 id="scene-title" tabIndex={-1}>{recipient.offeringTitle.split("\n")[0]}<br /><em>{recipient.offeringTitle.split("\n").slice(1).join(" ")}</em></h1>
      <p className="offering-message">{recipient.offeringMessage}</p>
      <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 2.1, duration: .6 }}>
        <button className="primary-button" onClick={onAccept} disabled={giving}>{giving ? "Đang gửi yêu thương…" : recipient.flowerButtonLabel}<ArrowRight size={18} strokeWidth={1.5} /></button>
        <p className="button-note"><Flower2 size={14} strokeWidth={1.3} /> Có một lời chúc nằm trong bó hoa này.</p>
      </motion.div>
    </div>
    <div className="offering-art"><div className="boy-backdrop" /><Botanical className="offering-sprig" /><BoyIllustration giving={giving} /><span className="offering-caption">{recipient.offeringCaption ?? "for you, with love"}</span></div>
  </section>;
}
