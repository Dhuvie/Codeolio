"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";

interface Pt { x: number; y: number }

interface TraceSegment {
  pts: Pt[];        // polyline points (right-angle routing)
  startAt: number;  // scroll progress to begin drawing  (0–1)
  endAt: number;    // scroll progress when fully drawn   (0–1)
}

interface Block {
  rx: number; ry: number; // relative position 0–1
  w: number;  h: number;  // size in px (constant)
  label: string;
  sub: string;
  appearAt: number;       // scroll progress to pop in
}

const BLOCKS: Block[] = [
  { rx: 0.50, ry: 0.50, w: 120, h: 56, label: "AI CORE",   sub: "Gemini · Genkit",   appearAt: 0.42 },
  { rx: 0.20, ry: 0.50, w: 104, h: 44, label: "SYSTEMS",   sub: "C++ · OpenGL · C",  appearAt: 0.16 },
  { rx: 0.80, ry: 0.50, w: 104, h: 44, label: "WEB LAYER", sub: "Next.js · React",   appearAt: 0.16 },
  { rx: 0.50, ry: 0.22, w: 104, h: 44, label: "ML / TINY", sub: "PyTorch · TF Lite", appearAt: 0.28 },
  { rx: 0.50, ry: 0.78, w: 104, h: 44, label: "DATA",      sub: "Postgres · Redis",  appearAt: 0.28 },
  { rx: 0.20, ry: 0.22, w: 94,  h: 40, label: "GRAPHICS",  sub: "GLSL · Canvas 2D",  appearAt: 0.36 },
  { rx: 0.80, ry: 0.22, w: 94,  h: 40, label: "DEVOPS",    sub: "Docker · Vercel",   appearAt: 0.36 },
  { rx: 0.20, ry: 0.78, w: 94,  h: 40, label: "SECURITY",  sub: "JWT · RBAC",        appearAt: 0.36 },
  { rx: 0.80, ry: 0.78, w: 94,  h: 40, label: "EDGE",      sub: "Cloudflare · CDN",  appearAt: 0.36 },
];

const TRACE_DEFS: { from: number; to: number; startAt: number; endAt: number }[] = [
  { from: 1, to: 0, startAt: 0.05, endAt: 0.22 },
  { from: 0, to: 2, startAt: 0.05, endAt: 0.22 },
  { from: 3, to: 0, startAt: 0.14, endAt: 0.30 },
  { from: 0, to: 4, startAt: 0.14, endAt: 0.30 },
  { from: 5, to: 1, startAt: 0.22, endAt: 0.34 },
  { from: 5, to: 3, startAt: 0.25, endAt: 0.36 },
  { from: 6, to: 2, startAt: 0.22, endAt: 0.34 },
  { from: 6, to: 3, startAt: 0.25, endAt: 0.36 },
  { from: 7, to: 1, startAt: 0.28, endAt: 0.40 },
  { from: 7, to: 4, startAt: 0.30, endAt: 0.42 },
  { from: 8, to: 2, startAt: 0.28, endAt: 0.40 },
  { from: 8, to: 4, startAt: 0.30, endAt: 0.42 },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function buildTrace(p1: Pt, p2: Pt): Pt[] {
  const mid: Pt = { x: p2.x, y: p1.y };
  return [p1, mid, p2];
}

function strokePolylinePartial(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  progress: number
) {
  if (pts.length < 2 || progress <= 0) return;

  let total = 0;
  const segs: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    segs.push(d);
    total += d;
  }

  const target = total * Math.min(1, progress);
  let drawn = 0;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 0; i < segs.length; i++) {
    const remaining = target - drawn;
    if (remaining <= 0) break;
    if (remaining >= segs[i]) {
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      drawn += segs[i];
    } else {
      const t = remaining / segs[i];
      ctx.lineTo(
        lerp(pts[i].x, pts[i + 1].x, t),
        lerp(pts[i].y, pts[i + 1].y, t)
      );
      break;
    }
  }
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function TechCircuit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let progress = 0;
    let time = 0;
    let animId = 0;

    let blockPx: Pt[] = [];       // center of each block in px
    let traces: TraceSegment[] = [];

    const build = () => {
      blockPx = BLOCKS.map((b) => ({ x: b.rx * W, y: b.ry * H }));

      traces = TRACE_DEFS.map((td) => ({
        pts: buildTrace(blockPx[td.from], blockPx[td.to]),
        startAt: td.startAt,
        endAt: td.endAt,
      }));
    };

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      build();
    };
    resize();
    window.addEventListener("resize", resize);

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => { progress = s.progress; },
    });

    const pulseOffsets = TRACE_DEFS.map((_, i) => i * 0.13);

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, W, H);

      const gridAlpha = Math.min(1, progress / 0.05) * 0.04;
      if (gridAlpha > 0) {
        ctx.strokeStyle = `rgba(240,160,0,${gridAlpha})`;
        ctx.lineWidth = 1;
        const spacing = 48;
        for (let x = 0; x < W; x += spacing) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += spacing) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
      }

      traces.forEach((trace) => {
        if (progress < trace.startAt) return;

        const tp = Math.min(1, (progress - trace.startAt) / (trace.endAt - trace.startAt));

        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(240,160,0,0.5)";
        ctx.strokeStyle = "rgba(240,160,0,0.55)";
        ctx.lineWidth = 1.5;
        strokePolylinePartial(ctx, trace.pts, tp);

        ctx.shadowBlur = 4;
        ctx.strokeStyle = "rgba(240,160,0,0.9)";
        ctx.lineWidth = 0.8;
        strokePolylinePartial(ctx, trace.pts, tp);
        ctx.shadowBlur = 0;

        [trace.pts[0], trace.pts[trace.pts.length - 1]].forEach((pt, ni) => {
          if (ni === 1 && tp < 1) return;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#f0a000";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#f0a000";
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      if (progress > 0.50) {
        const pulseAlpha = Math.min(1, (progress - 0.50) / 0.12);

        traces.forEach((trace, ti) => {
          if (progress < trace.endAt) return; // only on completed traces

          let total = 0;
          for (let i = 1; i < trace.pts.length; i++) {
            total += Math.hypot(
              trace.pts[i].x - trace.pts[i - 1].x,
              trace.pts[i].y - trace.pts[i - 1].y
            );
          }

          const t = ((time * 0.4 + pulseOffsets[ti]) % 1);
          const target = total * t;
          let drawn = 0;
          let px = trace.pts[0].x, py = trace.pts[0].y;

          for (let i = 1; i < trace.pts.length; i++) {
            const segLen = Math.hypot(
              trace.pts[i].x - trace.pts[i - 1].x,
              trace.pts[i].y - trace.pts[i - 1].y
            );
            if (drawn + segLen >= target) {
              const frac = (target - drawn) / segLen;
              px = lerp(trace.pts[i - 1].x, trace.pts[i].x, frac);
              py = lerp(trace.pts[i - 1].y, trace.pts[i].y, frac);
              break;
            }
            drawn += segLen;
          }

          const grad = ctx.createRadialGradient(px, py, 0, px, py, 8);
          grad.addColorStop(0, `rgba(240,160,0,${0.9 * pulseAlpha})`);
          grad.addColorStop(1, `rgba(240,160,0,0)`);
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.95 * pulseAlpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = "#f0a000";
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      BLOCKS.forEach((blk, bi) => {
        if (progress < blk.appearAt) return;

        const fadeT = Math.min(1, (progress - blk.appearAt) / 0.06);
        const cx = blockPx[bi].x, cy = blockPx[bi].y;
        const x = cx - blk.w / 2, y = cy - blk.h / 2;

        ctx.globalAlpha = fadeT;

        const bSize = 10, bGap = 0;
        const x0 = x - bGap, y0 = y - bGap;
        const x1 = x + blk.w + bGap, y1 = y + blk.h + bGap;

        ctx.strokeStyle = "rgba(240,160,0,0.8)";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(240,160,0,0.5)";

        ctx.beginPath(); ctx.moveTo(x0 + bSize, y0); ctx.lineTo(x0, y0); ctx.lineTo(x0, y0 + bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1 - bSize, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0 + bSize, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1 - bSize, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 - bSize); ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(13,17,23,0.75)";
        roundRect(ctx, x, y, blk.w, blk.h, 3);
        ctx.fill();

        ctx.fillStyle = `rgba(240,160,0,${0.95 * fadeT})`;
        ctx.font = `bold 10px 'IBM Plex Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(blk.label, cx, cy - 8);

        ctx.fillStyle = `rgba(139,148,158,${0.8 * fadeT})`;
        ctx.font = `9px 'IBM Plex Mono', monospace`;
        ctx.fillText(blk.sub, cx, cy + 8);

        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      st.kill();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.18 }}
      aria-hidden="true"
    />
  );
}
