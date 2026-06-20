"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-register";

const FRAMES = [
  "---===+++= ",
  "----===+++ ",
  "-----===++ ",
  "------===+ ",
  "=------=== ",
  "==------== ",
  "+==------= ",
  "++==------ ",
  "+++===---- ",
  "=+++===--- ",
  "==+++===-- ",
  "---===+++= ",
];

const BOOT_LINES = [
  "sys.init → kernel.v3",
  "loading modules...",
  "stack.fullstack ✓",
  "ai.ml.ready ✓",
  "systems.online ✓",
  "portfolio.ready",
];

const N_PETALS = 30;
const RING_R = 76;
const RING_CX = 100;
const RING_CY = 100;
const ROSETTE_PTS = Array.from({ length: N_PETALS }, (_, i) => {
  const a = (i / N_PETALS) * Math.PI * 2;
  return {
    cx: Math.round((RING_CX + Math.cos(a) * RING_R) * 1e4) / 1e4,
    cy: Math.round((RING_CY + Math.sin(a) * RING_R) * 1e4) / 1e4,
  };
});
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

function RosetteRing({ pct }: { pct: number }) {
  const dashoffset = CIRCUMFERENCE * (1 - pct / 100);
  return (
    <svg width={200} height={200} viewBox="0 0 200 200">
      {ROSETTE_PTS.map((pt, i) => (
        <circle
          key={i}
          cx={pt.cx}
          cy={pt.cy}
          r={16}
          fill="none"
          stroke="rgba(240,160,0,0.28)"
          strokeWidth="0.8"
        />
      ))}
      <circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R}
        fill="none"
        stroke="rgba(240,160,0,0.07)"
        strokeWidth="2"
      />
      <circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R}
        fill="none"
        stroke="rgba(240,160,0,0.65)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashoffset}
        transform={`rotate(-90 ${RING_CX} ${RING_CY})`}
        style={{ transition: "stroke-dashoffset 0.07s linear" }}
      />
    </svg>
  );
}

export default function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [skipRender, setSkipRender] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768 || sessionStorage.getItem("bootComplete")) {
      setSkipRender(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("bootComplete", "true");
        setHidden(true);
      },
    });

    const progressObj = { val: 0, frame: 0, line: 0 };

    tl.to(progressObj, {
      val: 100,
      duration: 2.8,
      ease: "power1.inOut",
      onUpdate: () => {
        setPct(Math.floor(progressObj.val));
      }
    }, 0);

    tl.to(progressObj, {
      frame: 2800 / 110, // Approximate frame count
      duration: 2.8,
      ease: "none",
      onUpdate: () => {
        setFrameIdx(Math.floor(progressObj.frame) % FRAMES.length);
      }
    }, 0);

    tl.to(progressObj, {
      line: BOOT_LINES.length,
      duration: 2.8,
      ease: "none",
      onUpdate: () => {
        setBootLines(BOOT_LINES.slice(0, Math.floor(progressObj.line) + 1));
      }
    }, 0);

    tl.to(bootRef.current, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, 2.8);
    tl.to(ringRef.current, { opacity: 0, scale: 0.92, duration: 0.45, ease: "power2.in" }, 3.1);

    tl.fromTo(nameRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 3.3);

    tl.to(nameRef.current, { skewX: 4, scaleX: 1.02, duration: 0.05 }, 3.5);
    tl.to(nameRef.current, { skewX: -2, scaleX: 0.98, duration: 0.05 }, 3.55);
    tl.to(nameRef.current, { skewX: 3, scaleX: 1.01, x: 3, duration: 0.04 }, 3.6);
    tl.to(nameRef.current, { skewX: 0, scaleX: 1, x: 0, duration: 0.06 }, 3.64);

    tl.fromTo(lineRef.current, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.6, ease: "expo.out" }, 3.65);
    tl.fromTo(subtitleRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 3.95);

    tl.to(containerRef.current, { yPercent: -100, duration: 0.75, ease: "expo.inOut" }, 5.2);

    return () => {
      tl.kill();
    };
  }, []);

  if (skipRender) return null;

  return (
    <div
      ref={containerRef}
      className="hidden md:flex fixed inset-0 z-[999] bg-[#0d0b08] flex-col items-center justify-center"
      style={{
        willChange: "transform",
        display: hidden ? "none" : undefined,
        pointerEvents: hidden ? "none" : undefined,
      }}
    >
      <div
        ref={bootRef}
        className="absolute top-8 left-8 md:left-12 font-mono text-[10px] text-signal/40 space-y-1"
        style={{ letterSpacing: "0.08em" }}
      >
        {bootLines.map((line, i) => (
          <div
            key={i}
            className="boot-line"
            style={{
              animation: "fadeSlideIn 0.3s ease-out forwards",
              opacity: 0,
            }}
          >
            <span className="text-signal/60">{">"}</span> {line}
          </div>
        ))}
      </div>

      <div
        className="font-mono font-bold text-sm mb-8"
        style={{
          color: "#f0a000",
          letterSpacing: "0.18em",
          textShadow: "0 0 16px rgba(240,160,0,0.6), 0 0 40px rgba(240,160,0,0.2)",
        }}
      >
        {FRAMES[frameIdx]}
      </div>

      <div ref={ringRef} className="relative flex items-center justify-center mb-8">
        <div style={{ animation: "spin 16s linear infinite" }}>
          <RosetteRing pct={pct} />
        </div>
        <div
          className="absolute font-display font-bold text-ink"
          style={{ fontSize: "2.2rem", letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          {pct}
        </div>
      </div>

      <div
        ref={nameRef}
        className="font-display font-bold text-ink tracking-tighter leading-none mb-5"
        style={{ fontSize: "clamp(3rem, 8vw, 6rem)", opacity: 0 }}
      >
        dhruv
      </div>

      <div
        ref={lineRef}
        className="w-32 bg-signal mb-5"
        style={{ height: "1.5px", transform: "scaleX(0)", boxShadow: "0 0 12px rgba(240,160,0,0.5)" }}
      />

      <div
        ref={subtitleRef}
        className="font-mono text-[10px] text-muted tracking-[0.5em] uppercase"
        style={{ opacity: 0 }}
      >
        developer . builder . engineer
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}