"use client";
import { useRef, useEffect } from "react";
import { prefersReducedMotion } from "@/lib/animations";

interface Blip { id: string; label: string; sublabel?: string; ring: number; angle: number; glow: number }

const BLIPS: Blip[] = [
  { id:"cpp",  label:"C++",        ring:1, angle:300, glow:0 },
  { id:"py",   label:"Python",     ring:1, angle: 60, glow:0 },
  { id:"ts",   label:"TypeScript", ring:1, angle:120, glow:0 },
  { id:"c",    label:"C",          ring:1, angle:240, glow:0 },
  { id:"sql",  label:"SQL",        ring:1, angle:185, glow:0 },
  { id:"java", label:"Java",       ring:1, angle: 10, glow:0 },

  { id:"ogl",  label:"OpenGL",     ring:2, angle:280, glow:0 },
  { id:"pt",   label:"PyTorch",    ring:2, angle: 45, glow:0 },
  { id:"xgb",  label:"XGBoost",    ring:2, angle: 85, glow:0 },
  { id:"nxt",  label:"Next.js",    ring:2, angle:105, glow:0 },
  { id:"tfl",  label:"TF Lite",    ring:2, angle:225, glow:0 },
  { id:"pg",   label:"PostgreSQL", ring:2, angle:205, glow:0 },
  { id:"nd",   label:"Node.js",    ring:2, angle:155, glow:0 },
  { id:"glsl", label:"GLSL",       ring:2, angle:265, glow:0 },

  { id:"gem",  label:"Gemini API", ring:3, angle: 52, glow:0 },
  { id:"dkr",  label:"Docker",     ring:3, angle:172, glow:0 },
  { id:"rd",   label:"Redis",      ring:3, angle:192, glow:0 },
  { id:"cf",   label:"Cloudflare", ring:3, angle:112, glow:0 },
  { id:"gtk",  label:"Genkit",     ring:3, angle: 72, glow:0 },

  { id:"ev",   label:"EdgeVision", sublabel:"AI Image Engine",  ring:4, angle: 55, glow:0 },
  { id:"upi",  label:"UPI Fraud",  sublabel:"6M+ Transactions", ring:4, angle:182, glow:0 },
  { id:"agr",  label:"AgriVision", sublabel:"AI Ã— Agriculture", ring:4, angle:102, glow:0 },
  { id:"pac",  label:"Pac-Man AI", sublabel:"C++17 Â· OpenGL",   ring:4, angle:268, glow:0 },
  { id:"tml",  label:"TinyML",     sublabel:"ARM Cortex-M",     ring:4, angle:223, glow:0 },
  { id:"acm",  label:"ACM @ NIE",  sublabel:"180+ students",    ring:4, angle:330, glow:0 },
];

const SIG       = "240,160,0";
const RING_PCTS = [0.15, 0.29, 0.43, 0.60]; // ring radii as fraction of min(W,H)
const SECTOR    = 80;   // trailing glow arc in degrees
const DECAY     = 0.09; // glow/second decay rate (~11s full fade)
const IDLE_SPD  = 11;   // degrees/second when idle  (~33s per rotation)
const FAST_SPD  = 45;   // degrees/second when scrolling fast
const RING_LABELS = ["LANGUAGES", "FRAMEWORKS", "SYSTEMS", "PROJECTS"];

export default function NeuralFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, raf = 0;
    const blips: Blip[] = BLIPS.map(b => ({ ...b }));
    let sweep  = 0;     // degrees, monotonically increasing clockwise
    let lastTs = 0;
    let sVel   = 0;
    let lastSY = window.scrollY;
    let mx = -1, my = -1;

    blips.forEach(b => {
      const age = b.angle / IDLE_SPD; // seconds as if sweep started from 0
      b.glow = Math.max(0, 0.9 - DECAY * age);
    });

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onScroll = () => {
      sVel   = Math.min(80, Math.abs(window.scrollY - lastSY));
      lastSY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", (e: MouseEvent) => { mx = e.clientX; my = e.clientY; });

    const pt = (angle: number, r: number, cx: number, cy: number): [number, number] => [
      cx + r * Math.sin(angle * Math.PI / 180),
      cy - r * Math.cos(angle * Math.PI / 180),
    ];

    const render = (ts: number) => {
      raf = requestAnimationFrame(render);
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016;
      lastTs = ts;
      sVel *= 0.88;

      const speed = IDLE_SPD + sVel * (FAST_SPD - IDLE_SPD) / 80;
      const delta = speed * dt;
      const prev  = sweep % 360;
      sweep      += delta;
      const curr  = sweep % 360;

      blips.forEach(b => {
        const a       = b.angle;
        const crossed = prev < curr
          ? (a >= prev && a < curr)
          : (a >= prev || a < curr);
        if (crossed) b.glow = 1.0;
        else         b.glow = Math.max(0, b.glow - DECAY * dt);
      });

      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const base = Math.min(W, H);
      const radii = RING_PCTS.map(f => base * f);
      const maxR  = radii[radii.length - 1];

      radii.forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${SIG},${i === radii.length - 1 ? 0.07 : 0.04})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      });

      for (let a = 0; a < 360; a += 30) {
        const [ex, ey] = pt(a, maxR, cx, cy);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(${SIG},0.03)`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }

      const SLICES = 40;
      for (let s = 0; s < SLICES; s++) {
        const t0 = s / SLICES;
        const t1 = (s + 1) / SLICES;
        const a0 = (curr - t1 * SECTOR - 90) * Math.PI / 180;
        const a1 = (curr - t0 * SECTOR - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a0, a1, false);
        ctx.closePath();
        ctx.fillStyle = `rgba(${SIG},${(1 - t0) * 0.05})`;
        ctx.fill();
      }

      const [ex, ey] = pt(curr, maxR, cx, cy);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(${SIG},0.7)`;
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = `rgba(${SIG},0.8)`;
      ctx.shadowBlur  = 10;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle   = `rgb(${SIG})`;
      ctx.shadowColor = `rgba(${SIG},1)`;
      ctx.shadowBlur  = 14;
      ctx.fill();
      ctx.shadowBlur  = 0;

      blips.forEach(b => {
        const [bx, by] = pt(b.angle, radii[b.ring - 1], cx, cy);
        const near     = mx >= 0 && Math.hypot(mx - bx, my - by) < 44;
        const gEff     = near ? Math.max(b.glow, 0.65) : b.glow;
        const isProj   = b.ring === 4;
        const r        = isProj ? 5 : 3.5;

        if (gEff > 0.04) {
          const hr = r * (isProj ? 9 : 6);
          const hg = ctx.createRadialGradient(bx, by, 0, bx, by, hr);
          hg.addColorStop(0, `rgba(${SIG},${gEff * 0.4})`);
          hg.addColorStop(1, `rgba(${SIG},0)`);
          ctx.beginPath();
          ctx.arc(bx, by, hr, 0, Math.PI * 2);
          ctx.fillStyle = hg;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(${SIG},${0.18 + gEff * 0.82})`;
        if (gEff > 0.08) { ctx.shadowColor = `rgba(${SIG},0.85)`; ctx.shadowBlur = 9; }
        ctx.fill();
        ctx.shadowBlur = 0;

        const baseAlpha = isProj ? 0.38 : 0;
        const lAlpha    = near || gEff > 0.12 ? Math.min(1, gEff + 0.2) : baseAlpha;

        if (lAlpha > 0.02) {
          const dx = bx - cx, dy = by - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const nx = dx / dist, ny = dy / dist;
          const lx = bx + nx * (r + 9);
          const ly = by + ny * (r + 9);

          ctx.save();
          ctx.globalAlpha  = lAlpha;
          ctx.textAlign    = lx >= cx ? "left" : "right";
          ctx.textBaseline = ly >= cy ? "top" : "bottom";
          ctx.font = `${isProj ? "bold 11" : "10"}px 'IBM Plex Mono', monospace`;
          ctx.fillStyle = `rgb(${SIG})`;
          ctx.fillText(b.label, lx, ly);

          if (b.sublabel && (gEff > 0.12 || near)) {
            ctx.font      = "9px 'IBM Plex Mono', monospace";
            ctx.fillStyle = "rgba(139,148,158,0.9)";
            const ly2 = ly + (ly >= cy ? 13 : -13);
            ctx.textBaseline = ly >= cy ? "top" : "bottom";
            ctx.fillText(b.sublabel, lx, ly2);
          }
          ctx.restore();
        }
      });

      RING_LABELS.forEach((lbl, i) => {
        ctx.save();
        ctx.globalAlpha  = 0.18;
        ctx.textAlign    = "left";
        ctx.textBaseline = "middle";
        ctx.font         = "7px 'IBM Plex Mono', monospace";
        ctx.fillStyle    = `rgb(${SIG})`;
        ctx.fillText(lbl, cx + radii[i] + 5, cy);
        ctx.restore();
      });

      ctx.save();
      ctx.globalAlpha  = 0.25;
      ctx.textAlign    = "center";
      ctx.textBaseline = "bottom";
      ctx.font         = "8px 'IBM Plex Mono', monospace";
      ctx.fillStyle    = `rgb(${SIG})`;
      ctx.fillText("N", cx, cy - maxR - 6);
      ctx.restore();
    };

    requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
