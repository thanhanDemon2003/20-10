"use client";

import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { sender, type Recipient } from "@/config/recipients";
import { Botanical } from "./Botanical";
import { SenderLink } from "./SenderLink";

export function ApologyScene({ recipient, onContinue }: { recipient: Recipient; onContinue: () => void }) {
  const reduced = useReducedMotion();
  return <section className="scene apology-scene" aria-labelledby="scene-title">
    <div className="scene-copy">
      <p className="eyebrow">{recipient.openingEyebrow}</p>
      <h1 id="scene-title" tabIndex={-1}>{recipient.pageTitle.split("\n")[0]}<br /><em>{recipient.pageTitle.split("\n").slice(1).join(" ")}</em></h1>
      <div className="copy-body"><p className="opening-line">{recipient.openingMessage}</p><p className="preserve-lines">{recipient.apologyMessage}</p></div>
      <div className="from-author"><span>Thật lòng,</span><SenderLink signature /></div>
      <button className="primary-button" onClick={onContinue}>{recipient.apologyButtonLabel}<ArrowRight size={18} strokeWidth={1.5} /></button>
      <p className="button-note"><Heart size={12} strokeWidth={1.4} /> Từng chút một, đều được dành riêng cho {recipient.recipientPronoun}.</p>
    </div>
    <motion.div className="envelope-composition" initial={reduced ? false : { opacity: 0, y: 24, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1.1, delay: .12 }}>
      <div className="envelope-halo" />
      <div className="letter-paper"><span>Gửi {recipient.recipientPronoun},</span><i>Một chút yêu thương,<br />từ {sender.name}.</i><div className="paper-line" /><Heart size={17} strokeWidth={1.1} /></div>
      <Image className="envelope-image" src="/images/floral-envelope-cutout.png" alt="Phong bì màu kem với hoa hồng và lá xanh, chứa lời chúc dành riêng cho bạn" width={1254} height={1254} priority sizes="(max-width: 700px) 380px, 630px" />
      <div className="occasion-stamp"><span>HAPPY</span><strong>20<span>/</span>10</strong><span>VIETNAMESE WOMEN&apos;S DAY</span></div>
      <span className="handwritten-note">có những điều, muốn nói bằng hoa.</span>
      <Botanical className="envelope-sprig" />
    </motion.div>
  </section>;
}
