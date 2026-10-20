"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./BoyIllustration.module.css";

function optimizedLayer(filename: string) {
  return getImageProps({
    src: `/images/${filename}.png`,
    alt: "",
    width: 512,
    height: 768,
  }).props.src;
}

const originalLayer = optimizedLayer("boy-with-flowers");
const cleanLayer = optimizedLayer("boy-clean-plate");
const holdingLayer = optimizedLayer("hands-and-bouquet");

// Each path selects part of the actual artwork. Its stationary copy is masked
// out before moving, so leaves and flowers never leave duplicate edges behind.
const foliage = [
  { path: "M232 242L270 242L299 277L326 300L347 335L368 359L370 399L343 402L314 360L286 338L259 309L231 288Z", x: 358, y: 393, delay: "-1.3s", duration: "5.8s", direction: 1 },
  { path: "M374 199L417 197L435 239L440 284L454 331L452 367L415 352L399 305L380 272Z", x: 438, y: 355, delay: "-3.2s", duration: "6.4s", direction: -1 },
  { path: "M548 220L598 212L624 247L615 290L611 322L572 337L554 294Z", x: 584, y: 328, delay: "-2.6s", duration: "5.5s", direction: 1 },
  { path: "M730 267L776 260L789 296L819 301L845 321L848 356L813 392L797 432L758 460L723 439Z", x: 733, y: 443, delay: "-.6s", duration: "6.8s", direction: -1 },
  { path: "M835 411L891 405L921 426L925 450L898 468L951 475L962 510L916 546L862 566L815 568L805 541Z", x: 817, y: 554, delay: "-4.4s", duration: "6.1s", direction: 1 },
  { path: "M107 461L151 465L179 484L218 494L244 522L269 552L252 573L213 570L175 550L137 545L107 517L97 490Z", x: 259, y: 559, delay: "-2s", duration: "7.1s", direction: -1 },
] as const;

const blooms = [
  { path: "M471 347Q507 334 543 353L570 379L568 420L546 448L503 464L464 443L446 413L448 375Z", x: 509, y: 404, delay: "-.8s", duration: "7.2s" },
  { path: "M344 469L383 449L424 456L450 486L465 520L448 560L417 591L380 592L345 566L326 529Z", x: 397, y: 523, delay: "-3.1s", duration: "8.1s" },
  { path: "M605 407L650 393L688 417L716 449L726 484L701 516L668 546L627 536L592 512L577 475L586 438Z", x: 651, y: 471, delay: "-5.4s", duration: "7.6s" },
  { path: "M470 520L510 497L552 506L590 532L612 575L614 618L585 650L546 674L499 663L458 642L441 603L442 557Z", x: 528, y: 589, delay: "-2.4s", duration: "8.6s" },
] as const;

export function BoyIllustration({ giving }: { giving: boolean }) {
  const reduced = useReducedMotion();
  const instanceId = useId().replace(/:/g, "");
  const id = (part: string) => `boy-${instanceId}-${part}`;
  const [blinking, setBlinking] = useState(false);
  const [imageMissing, setImageMissing] = useState(false);
  const [layersReady, setLayersReady] = useState(false);
  const eyeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const layers = [originalLayer, cleanLayer, holdingLayer];
    Promise.all(layers.map((src) => new Promise<void>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve();
      image.onerror = reject;
      image.src = src;
    }))).then(() => { if (!cancelled) setLayersReady(true); }).catch(() => {
      // Keep the original visible if an animation layer cannot be loaded.
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (reduced || !layersReady) return;
    let cancelled = false;
    let next: ReturnType<typeof setTimeout>;
    function blink() {
      if (cancelled) return;
      if (document.visibilityState === "visible") {
        setBlinking(true);
        eyeTimer.current = setTimeout(() => setBlinking(false), 200);
      }
      next = setTimeout(blink, 3600 + Math.random() * 2900);
    }
    next = setTimeout(blink, 1200);
    return () => {
      cancelled = true;
      clearTimeout(next);
      if (eyeTimer.current) clearTimeout(eyeTimer.current);
    };
  }, [reduced, layersReady]);

  return (
    <motion.div
      className={`boy-illustration ${styles.actor} ${giving ? styles.giving : ""}`}
      initial={reduced ? false : { y: 56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.3, ease: [.22, 1, .36, 1] }}
    >
      {!imageMissing ? <>
        <Image
          className={layersReady ? styles.originalHidden : styles.original}
          src="/images/boy-with-flowers.png"
          alt="Chàng trai đeo kính, mặc áo khoác màu kem, mỉm cười và nhẹ nhàng nâng bó hoa"
          width={1024}
          height={1536}
          priority
          sizes="(max-width: 700px) 300px, 440px"
          onError={() => setImageMissing(true)}
        />
        {layersReady && <svg className={styles.art} viewBox="0 0 1024 1536" aria-hidden="true">
          <defs>
            <image id={id("original")} href={originalLayer} width="1024" height="1536" />
            <image id={id("holding")} href={holdingLayer} width="1024" height="1536" />
            <linearGradient id={id("static-gradient")} x1="0" y1="0" x2="0" y2="1536" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="white" /><stop offset=".23" stopColor="white" />
              <stop offset=".245" stopColor="black" /><stop offset=".626" stopColor="black" />
              <stop offset=".646" stopColor="white" /><stop offset="1" stopColor="white" />
            </linearGradient>
            <mask id={id("static")} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536">
              <rect width="1024" height="1536" fill={`url(#${id("static-gradient")})`} />
            </mask>
            <mask id={id("bouquet-still")} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536">
              <rect width="1024" height="1536" fill="white" />
              {foliage.map((leaf, index) => <path key={`leaf-${index}`} d={leaf.path} fill="black" />)}
              {blooms.map((flower, index) => <path key={`flower-${index}`} d={flower.path} fill="black" />)}
            </mask>
            {foliage.map((leaf, index) => <clipPath key={index} id={id(`leaf-${index}`)}><path d={leaf.path} /></clipPath>)}
            {blooms.map((flower, index) => <clipPath key={index} id={id(`flower-${index}`)}><path d={flower.path} /></clipPath>)}
          </defs>
          {/* Clean underpainting replaces only the area behind the moving gift.
              The supplied face, glasses, legs and shoes stay unchanged. */}
          <image href={cleanLayer} width="1024" height="1536" />
          <use href={`#${id("original")}`} mask={`url(#${id("static")})`} />
          <g className={styles.lift}>
            <g className={styles.hold}>
              <g transform="translate(200 240) scale(.6)">
                {blooms.map((flower, index) => <path key={index} d={flower.path} fill="#c78f81" />)}
                <use href={`#${id("holding")}`} mask={`url(#${id("bouquet-still")})`} />
                {foliage.map((leaf, index) => <g
                  key={index}
                  className={styles.leaf}
                  style={{
                    transformOrigin: `${leaf.x}px ${leaf.y}px`,
                    animationDelay: leaf.delay,
                    animationDuration: leaf.duration,
                    animationDirection: leaf.direction === 1 ? "normal" : "reverse",
                  }}
                ><use href={`#${id("holding")}`} clipPath={`url(#${id(`leaf-${index}`)})`} /></g>)}
                {blooms.map((flower, index) => <g
                  key={index}
                  className={styles.bloom}
                  style={{
                    transformOrigin: `${flower.x}px ${flower.y}px`,
                    animationDelay: flower.delay,
                    animationDuration: flower.duration,
                  }}
                ><use href={`#${id("holding")}`} clipPath={`url(#${id(`flower-${index}`)})`} /></g>)}
              </g>
            </g>
          </g>
          <g className={`${styles.eyelids} ${blinking && !reduced ? styles.blinking : ""}`}>
            <path d="M462 140Q475 133 489 141L488 153Q474 159 461 151Z" fill="#e4b89b" />
            <path d="M528 143Q541 137 554 144L553 155Q541 160 529 153Z" fill="#e5b79a" />
            <path d="M463 147Q476 153 488 146M530 150Q542 155 553 148" fill="none" stroke="#6f4f42" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </svg>}
      </> : <svg viewBox="0 0 400 600" className="fallback-boy" role="img" aria-label="Minh họa chàng trai đeo kính cầm hoa"><path d="m135 370-15 190h60l20-135 25 135h60l-20-190" fill="#695d54"/><path d="M123 230q77-30 154 0l30 176H95Z" fill="#e5d5b9"/><path d="m155 226 45 61 45-61-14-20h-62Z" fill="#544039"/><ellipse cx="200" cy="158" rx="62" ry="72" fill="#e4b291"/><path d="M136 150q-23-108 80-86 68 0 46 94l-23-54q-38 40-97 32" fill="#342e2a"/><g fill="none" stroke="#343a35" strokeWidth="4"><rect x="143" y="142" width="49" height="34" rx="11"/><rect x="207" y="142" width="49" height="34" rx="11"/><path d="M192 151h15"/></g><path d="M186 194q14 9 28 0" stroke="#a56957" strokeWidth="3" fill="none"/><path d="m120 300 80 135 80-135" fill="#d3b28f"/><g fill="#b8c2a3"><ellipse cx="156" cy="290" rx="32" ry="60" transform="rotate(-30 156 290)"/><ellipse cx="246" cy="287" rx="32" ry="60" transform="rotate(30 246 287)"/></g><g fill="#e9b2a6" stroke="#f8d3bf" strokeWidth="8"><circle cx="170" cy="289" r="33"/><circle cx="227" cy="283" r="33"/><circle cx="202" cy="329" r="32"/></g></svg>}
      <div className="boy-shadow" />
    </motion.div>
  );
}
