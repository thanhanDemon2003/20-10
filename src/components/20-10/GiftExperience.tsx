"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Recipient } from "@/config/recipients";
import { ApologyScene } from "./ApologyScene";
import { FlowerOfferingScene } from "./FlowerOfferingScene";
import { GreetingCard } from "./GreetingCard";
import { FloatingPetals } from "./FloatingPetals";
import { Botanical, FlowerMark } from "./Botanical";
import { MusicControl, type MusicHandle } from "./MusicControl";
import { SenderLink } from "./SenderLink";
import { ReadingProgress } from "./ScrollDetails";
import { WindAtmosphere } from "./WindAtmosphere";

type Stage = "apology" | "offering" | "greeting";
const stages: { id: Stage; label: string }[] = [{ id: "apology", label: "Lời mở đầu" }, { id: "offering", label: "Một bó hoa" }, { id: "greeting", label: "Lời thương" }];

export function GiftExperience({ recipient, keepOpen = false }: { recipient: Recipient; keepOpen?: boolean }) {
  const [stage, setStage] = useState<Stage>("apology");
  const [giving, setGiving] = useState(false);
  const music = useRef<MusicHandle>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); }, []);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const timer = setTimeout(() => { document.getElementById("scene-title")?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, reduced ? 20 : 550);
    return () => clearTimeout(timer);
  }, [stage, reduced]);

  function acceptFlowers() {
    if (giving) return;
    music.current?.receiveFlowers();
    setGiving(true);
    transitionTimer.current = setTimeout(() => { setStage("greeting"); setGiving(false); }, reduced ? 0 : 1550);
  }

  return <main className={`gift-shell stage-${stage}`}>
    <ReadingProgress active={stage === "greeting"} />
    <FloatingPetals burst={giving} />
    <WindAtmosphere warm={stage === "greeting"} />
    <header className="gift-header"><Link href={keepOpen ? "/?open=true" : "/"} className="wordmark" aria-label="Một chút dịu dàng — trang chủ"><FlowerMark /><span>một chút dịu dàng</span></Link><MusicControl ref={music} quiet={stage === "greeting"} /></header>
    <div className="scene-container"><AnimatePresence mode="wait">
      <motion.div className="scene-transition" key={stage} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -12 }} transition={{ duration: reduced ? 0 : .45 }}>
        {stage === "apology" && <ApologyScene recipient={recipient} onContinue={() => { music.current?.start(); setStage("offering"); }} />}
        {stage === "offering" && <FlowerOfferingScene recipient={recipient} giving={giving} onAccept={acceptFlowers} />}
        {stage === "greeting" && <GreetingCard recipient={recipient} />}
      </motion.div>
    </AnimatePresence></div>
    <footer className="gift-footer">
      <ol className="stage-progress" aria-label="Hành trình món quà">{stages.map((item, i) => <li key={item.id} aria-current={item.id === stage ? "step" : undefined} className={item.id === stage ? "current" : ""}><span className="stage-number">0{i + 1}</span><span>{item.label}</span>{i < 2 && <i />}</li>)}</ol>
      <div className="footer-dedication">
        <Heart className="footer-heart" size={18} strokeWidth={1.2} aria-hidden="true" />
        <p>Tự tay chuẩn bị, bằng cả tấm lòng.</p>
        <SenderLink />
      </div>
    </footer>
    <Botanical className="botanical-bottom" />
    <span className="edge-label" aria-hidden="true">A LITTLE GIFT, A HEARTFELT WISH</span>
  </main>;
}
