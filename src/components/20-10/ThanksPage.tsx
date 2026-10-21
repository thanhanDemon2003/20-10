"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Clock3, Heart } from "lucide-react";
import { Botanical, FlowerMark } from "./Botanical";
import { FloatingPetals } from "./FloatingPetals";
import { MusicControl, type MusicHandle } from "./MusicControl";
import { SenderLink } from "./SenderLink";
import { WindAtmosphere } from "./WindAtmosphere";
import styles from "./ThanksPage.module.css";

const rise = (i: number) => ({ "--i": i }) as React.CSSProperties;

function BlinkingPortrait() {
  const reduced = useReducedMotion();
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let next: ReturnType<typeof setTimeout>;
    let open: ReturnType<typeof setTimeout>;
    function blink() {
      if (cancelled) return;
      if (document.visibilityState === "visible") {
        setBlinking(true);
        open = setTimeout(() => setBlinking(false), 200);
      }
      next = setTimeout(blink, 3600 + Math.random() * 2900);
    }
    next = setTimeout(blink, 1800);
    return () => { cancelled = true; clearTimeout(next); clearTimeout(open); };
  }, [reduced]);

  return <div className={`${styles.photo} ${styles.rise}`} style={rise(2)}>
    <Image
      className={styles.photoImage}
      src="/images/boy-clean-plate.png"
      alt="Chàng trai đeo kính, mặc áo khoác màu kem, mỉm cười gửi lời cảm ơn"
      width={1024}
      height={1536}
      sizes="(max-width: 860px) 320px, 470px"
      priority
    />
    <svg className={styles.art} viewBox="0 0 1024 1536" aria-hidden="true">
      <g className={`${styles.eyelids} ${blinking && !reduced ? styles.blinking : ""}`}>
        <path d="M462 140Q475 133 489 141L488 153Q474 159 461 151Z" fill="#e4b89b" />
        <path d="M528 143Q541 137 554 144L553 155Q541 160 529 153Z" fill="#e5b79a" />
        <path d="M463 147Q476 153 488 146M530 150Q542 155 553 148" fill="none" stroke="#6f4f42" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  </div>;
}

export function ThanksPage() {
  const music = useRef<MusicHandle>(null);

  useEffect(() => { music.current?.receiveFlowers(); }, []);

  return <main className={`gift-shell ${styles.shell}`}>
    <FloatingPetals />
    <WindAtmosphere warm />
    <header className="gift-header">
      <span className="wordmark"><FlowerMark /><span>một chút dịu dàng</span></span>
      <MusicControl ref={music} quiet />
    </header>

    <div className={styles.stage}>
      <section className={styles.copy} aria-labelledby="thanks-title">
        <p className={`${styles.badge} ${styles.rise}`} style={rise(0)}>
          <Clock3 size={14} strokeWidth={1.4} aria-hidden="true" />
          Món quà đã hết thời gian để xem
        </p>
        <p className={`${styles.kicker} ${styles.rise}`} style={rise(1)}>20 THÁNG 10 · MỘT LỜI CẢM ƠN</p>
        <h1 id="thanks-title" className={`${styles.title} ${styles.rise}`} style={rise(2)}>
          Cảm ơn bạn<br /><em>đã ghé qua.</em>
        </h1>
        <FlowerMark className={`${styles.mark} ${styles.rise}`} />
        <div className={`${styles.body} ${styles.rise}`} style={rise(3)}>
          <p>Ngày 20/10 đã khép lại, và món quà nhỏ này cũng đã qua thời gian được mở xem.</p>
          <p>Nhưng mình vẫn muốn nói một lời nói cảm ơn, vì bạn đã dành một chút thời gian để mở nó ra, đọc từng dòng và đón nhận tấm lòng mình gửi.</p>
        </div>
        <blockquote className={`${styles.wish} ${styles.rise}`} style={rise(4)}>
          <p>Chúc bạn một hành trình phía trước <em>thật đẹp</em> nhéee, người phụ nữ đặc biệt.</p>
          <p lang="en" className={styles.wishEn}>Wishing you a beautiful journey ahead, you truly special woman.</p>
        </blockquote>
        <div className={`${styles.signoff} ${styles.rise}`} style={rise(5)}>
          <span>Thân mến gửi,</span>
          <SenderLink signature />
        </div>
        <p className={`${styles.date} ${styles.rise}`} style={rise(6)}>20 tháng 10 · Một lời chúc từ trái tim</p>
      </section>

      <div className={styles.portrait}>
        <div className={styles.arch} aria-hidden="true" />
        <Botanical className={styles.sprig} />
        <BlinkingPortrait />
        <div className={styles.shadow} aria-hidden="true" />
      </div>
    </div>

    <footer className={styles.footer}>
      <Heart size={16} strokeWidth={1.2} aria-hidden="true" />
      <p style={{ margin: 0 }}>Tự tay chuẩn bị, bằng cả tấm lòng.</p>
    </footer>
    <Botanical className="botanical-bottom" />
  </main>;
}
