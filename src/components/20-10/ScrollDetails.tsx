"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowDown } from "lucide-react";

export function ReadingProgress({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ trackContentSize: true });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 32, restDelta: .001 });
  return <motion.div className="reading-progress" style={{ scaleX: reduced ? scrollYProgress : progress, opacity: active ? 1 : 0 }} aria-hidden="true" />;
}

export function ScrollInvitation({ pronoun }: { pronoun: string }) {
  return <a className="scroll-invitation" href="#reply-section" aria-label="Cuộn đến phần gửi lời nhắn">
    <span>Vài dòng gửi lại, nếu {pronoun} muốn</span>
    <ArrowDown size={17} strokeWidth={1.2} aria-hidden="true" />
  </a>;
}

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div
    className={className}
    initial={reduced ? false : { opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: .12 }}
    transition={{ duration: reduced ? 0 : .75, delay: reduced ? 0 : delay, ease: [.22, 1, .36, 1] }}
  >{children}</motion.div>;
}
