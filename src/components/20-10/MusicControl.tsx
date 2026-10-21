"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

const TRACKS = {
  background: { src: "/audio/20-10-piano.mp3", label: "Một chút dịu dàng" },
  flowers: { src: "/audio/20-10-for-you.mp3", label: "Hoa và lời thương" },
} as const;

type Track = keyof typeof TRACKS;
export type MusicHandle = { start: () => void; receiveFlowers: () => void };

export const MusicControl = forwardRef<MusicHandle, { quiet: boolean }>(function MusicControl({ quiet }, ref) {
  const audio = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<Track>("background");
  const currentTrack = useRef<Track>("background");
  const pendingAttempt = useRef<number | null>(null);
  const generation = useRef(0);
  const unavailable = useRef(new Set<Track>());
  const explicitlyMuted = useRef(false);

  const start = useCallback(() => {
    const element = audio.current;
    if (!element) return;
    if (unavailable.current.has(currentTrack.current) || pendingAttempt.current !== null ||
        !element.paused || explicitlyMuted.current) return;
    const attempt = ++generation.current;
    pendingAttempt.current = attempt;
    void element.play().then(() => {
      if (generation.current === attempt && !element.paused && !explicitlyMuted.current) setPlaying(true);
    }).catch(() => {
      if (generation.current === attempt) setPlaying(false);
    }).finally(() => {
      if (pendingAttempt.current === attempt) pendingAttempt.current = null;
    });
  }, []);

  useEffect(() => { if (audio.current) audio.current.volume = quiet ? 0.18 : 0.3; }, [quiet]);
  useEffect(() => {
    const element = audio.current;
    start();
    function resumeOnGesture(event: Event) {
      if (!event.isTrusted || explicitlyMuted.current) return;
      // A first tap on "Tắt nhạc" must only mute, without a brief sound first.
      if (event.target instanceof Element && event.target.closest("[data-music-toggle]")) return;
      if (event instanceof KeyboardEvent && (event.repeat || event.metaKey || event.ctrlKey || event.altKey)) return;
      start();
    }
    document.addEventListener("pointerup", resumeOnGesture);
    document.addEventListener("keydown", resumeOnGesture);
    return () => {
      document.removeEventListener("pointerup", resumeOnGesture);
      document.removeEventListener("keydown", resumeOnGesture);
      generation.current += 1;
      pendingAttempt.current = null;
      element?.pause();
    };
  }, [start]);

  function receiveFlowers() {
    if (currentTrack.current === "flowers") return;
    const element = audio.current;
    if (!element) return;
    generation.current += 1;
    pendingAttempt.current = null;
    element.pause();
    setPlaying(false);
    currentTrack.current = "flowers";
    setTrack("flowers");
    // Reuse the same audio element: the two melodies can never overlap.
    element.src = TRACKS.flowers.src;
    element.volume = 0.18;
    element.load();
    if (!explicitlyMuted.current) start();
  }

  function toggle() {
    const element = audio.current;
    if (!element) return;
    if (!explicitlyMuted.current) {
      explicitlyMuted.current = true;
      setEnabled(false);
      generation.current += 1;
      pendingAttempt.current = null;
      element.pause();
      setPlaying(false);
    } else {
      explicitlyMuted.current = false;
      setEnabled(true);
      if (unavailable.current.delete(currentTrack.current)) element.load();
      start();
    }
  }

  useImperativeHandle(ref, () => ({ start: () => start(), receiveFlowers }));

  return <>
    <audio ref={audio} src={TRACKS.background.src} data-track={track} loop preload="none"
      onError={() => {
        // A queued event from the previous source must not disable the new song.
        if (!audio.current?.error) return;
        unavailable.current.add(currentTrack.current);
        generation.current += 1;
        pendingAttempt.current = null;
        setPlaying(false);
      }}
      onPlaying={() => {
        if (!audio.current?.paused && !explicitlyMuted.current) setPlaying(true);
      }}
      onPause={() => { if (audio.current?.paused) setPlaying(false); }}
    />
    <button type="button" data-music-toggle data-enabled={enabled} className={`music-control ${playing ? "is-playing" : ""}`}
      aria-label={enabled ? "Tắt nhạc nền" : "Bật nhạc nền"} aria-pressed={enabled}
      title={`${TRACKS[track].label} · ${enabled ? "nhạc nền đang bật" : "nhạc nền đang tắt"}`} onClick={toggle}>
      {enabled ? <Volume2 size={15} strokeWidth={1.5} /> : <VolumeX size={15} strokeWidth={1.5} />}
      <span>{playing ? TRACKS[track].label : enabled ? "Nhạc: bật" : "Bật chút nhạc"}</span>
      {playing && <span className="sound-bars" aria-hidden="true"><i /><i /><i /></span>}
    </button>
  </>;
});
