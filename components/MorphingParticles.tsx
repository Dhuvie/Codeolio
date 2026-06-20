"use client";

import { useRef, useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";

const N          = 2400;   // particle count
const SPRING     = 0.055;  // attraction strength
const DAMPING    = 0.80;   // velocity decay
const MAX_SPEED  = 14;     // cap to prevent explosion

const GLYPHS: Record<string, number[][]> = {
  D: [[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0]],
  N: [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  B: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
};

type Pt = [number, number];


function rng() { return Math.random(); }
function jitter(v: number, r = 3) { return v + (rng() - 0.5) * r; }

function shapeScatter(n: number, W: number, H: number): Pt[] {
  return Array.from({ length: n }, () => [rng() * W, rng() * H]);
}

function shapeDNB(n: number, W: number, H: number): Pt[] {
  const scale = Math.min(W, H) * 0.065;
  const cx = W / 2, cy = H / 2;
  const gap = scale * 1.8;
  const letters = ["D", "N", "B"];
  const totalW = letters.length * 5 * scale + (letters.length - 1) * gap;
  const ox0 = cx - totalW / 2;
  const oy0 = cy - 7 * scale / 2;

  const slots: Pt[] = [];
  letters.forEach((ch, li) => {
    GLYPHS[ch].forEach((row, ri) =>
      row.forEach((cell, ci) => {
        if (cell)
          slots.push([ox0 + li * (5 * scale + gap) + ci * scale + scale / 2,
                      oy0 + ri * scale + scale / 2]);
      })
    );
  });

  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const s = slots[i % slots.length];
    pts.push([jitter(s[0], scale * 0.35), jitter(s[1], scale * 0.35)]);
  }
  return pts;
}

function shapeNeural(n: number, W: number, H: number): Pt[] {
  const layers = [4, 8, 8, 4];
  const cx = W / 2, cy = H / 2;
  const spacingX = W * 0.16;
  const spacingY = H * 0.12;
  const startX = cx - (layers.length - 1) * spacingX / 2;
  const nodes: Pt[] = [];

  layers.forEach((count, li) => {
    const x = startX + li * spacingX;
    const sy = cy - (count - 1) * spacingY / 2;
    for (let ni = 0; ni < count; ni++)
      nodes.push([x, sy + ni * spacingY]);
  });

  const perNode = Math.floor(n / nodes.length);
  const pts: Pt[] = [];
  nodes.forEach(([nx, ny]) => {
    for (let k = 0; k < perNode; k++)
      pts.push([jitter(nx, 10), jitter(ny, 10)]);
  });
  while (pts.length < n) {
    const nd = nodes[Math.floor(rng() * nodes.length)];
    pts.push([jitter(nd[0], 8), jitter(nd[1], 8)]);
  }
  return pts.slice(0, n);
}

function shapeHelix(n: number, W: number, H: number): Pt[] {
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(W, H) * 0.22;
  const half = Math.floor(n / 2);
  const pts: Pt[] = [];

  for (let i = 0; i < half; i++) {
    const t = (i / half) * Math.PI * 5;
    pts.push([jitter(cx + Math.cos(t) * R * 0.38, 3),
              jitter(cy - R + (i / half) * R * 2, 3)]);
  }
  for (let i = 0; i < n - half; i++) {
    const t = (i / (n - half)) * Math.PI * 5 + Math.PI;
    pts.push([jitter(cx + Math.cos(t) * R * 0.38, 3),
              jitter(cy - R + (i / (n - half)) * R * 2, 3)]);
  }
  return pts;
}

function shapeGlobe(n: number, W: number, H: number): Pt[] {
  const cx = W / 2, cy = H / 2;
  const R  = Math.min(W, H) * 0.28;
  const rings = 10, meridians = 14;
  const ppR  = Math.floor(n / (rings + meridians)) + 2;
  const pts: Pt[] = [];

  for (let ri = 0; ri < rings; ri++) {
    const lat   = (ri / (rings - 1)) * Math.PI;
    const ringR = R * Math.sin(lat);
    const y     = cy - R * Math.cos(lat);
    for (let k = 0; k < ppR; k++) {
      const lon = (k / ppR) * Math.PI * 2;
      pts.push([jitter(cx + ringR * Math.cos(lon), 2), jitter(y, 2)]);
    }
  }
  for (let mi = 0; mi < meridians; mi++) {
    const lon = (mi / meridians) * Math.PI * 2;
    for (let k = 0; k < ppR; k++) {
      const lat   = (k / ppR) * Math.PI;
      const ringR = R * Math.sin(lat);
      const y     = cy - R * Math.cos(lat);
      pts.push([jitter(cx + ringR * Math.cos(lon), 2), jitter(y, 2)]);
    }
  }
  while (pts.length < n) {
    const lat = rng() * Math.PI, lon = rng() * Math.PI * 2;
    pts.push([cx + R * Math.sin(lat) * Math.cos(lon), cy - R * Math.cos(lat)]);
  }
  return pts.slice(0, n);
}

function shapeLemniscate(n: number, W: number, H: number): Pt[] {
  const cx = W / 2, cy = H / 2;
  const a  = Math.min(W, H) * 0.30;
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const d = 1 + Math.sin(t) * Math.sin(t);
    return [jitter(cx + (a * Math.cos(t)) / d, 4),
            jitter(cy + (a * Math.sin(t) * Math.cos(t)) / d, 4)];
  });
}

function shapeStarburst(n: number, W: number, H: number): Pt[] {
  const cx = W / 2, cy = H / 2;
  const spokes = 24;
  const pts: Pt[] = [];
  const ppSpoke = Math.floor(n / spokes);

  for (let si = 0; si < spokes; si++) {
    const angle = (si / spokes) * Math.PI * 2;
    const maxR  = Math.min(W, H) * 0.38;
    for (let k = 0; k < ppSpoke; k++) {
      const r = (k / ppSpoke) * maxR;
      pts.push([jitter(cx + Math.cos(angle) * r, 3),
                jitter(cy + Math.sin(angle) * r, 3)]);
    }
  }
  while (pts.length < n) pts.push([jitter(cx, 5), jitter(cy, 5)]);
  return pts.slice(0, n);
}

const STAGES: {
  label: string;
  at: number;                                    // scroll progress
  gen: (n: number, W: number, H: number) => Pt[];
}[] = [
  { label: "",                at: 0.00, gen: shapeScatter     },
  { label: "IDENTITY",        at: 0.08, gen: shapeDNB          },
  { label: "AI / ML",         at: 0.26, gen: shapeNeural       },
  { label: "SYSTEMS DEPTH",   at: 0.44, gen: shapeHelix        },
  { label: "GLOBAL REACH",    at: 0.60, gen: shapeGlobe        },
  { label: "INFINITE GROWTH", at: 0.76, gen: shapeLemniscate   },
  { label: "IN MOTION",       at: 0.90, gen: shapeStarburst    },
];

export default function MorphingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    const labelEl = labelRef.current;
    if (!canvas || !labelEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let animId = 0;
    let scrollProg = 0;
    let currentStage = -1;
    let labelOpacity = 0;
    let labelTarget  = 0;
    let labelText    = "";

    const px  = new Float32Array(N);
    const py  = new Float32Array(N);
    const pvx = new Float32Array(N);
    const pvy = new Float32Array(N);
    const tx  = new Float32Array(N);
    const ty  = new Float32Array(N);
    const ps  = new Float32Array(N); // size per particle

    const initParticles = () => {
      for (let i = 0; i < N; i++) {
        px[i]  = rng() * W;
        py[i]  = rng() * H;
        pvx[i] = 0; pvy[i] = 0;
        tx[i]  = px[i]; ty[i] = py[i];
        ps[i]  = 0.8 + rng() * 1.4;
      }
    };

    const setTargets = (pts: Pt[]) => {
      const idx = Array.from({ length: N }, (_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      for (let i = 0; i < N; i++) {
        tx[idx[i]] = pts[i][0];
        ty[idx[i]] = pts[i][1];
      }
    };

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      if (px[0] === 0 && py[0] === 0) initParticles();
    };
    resize();
    window.addEventListener("resize", resize);

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end:   "bottom bottom",
      onUpdate: (s) => { scrollProg = s.progress; },
    });

    const render = () => {
      let stage = 0;
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (scrollProg >= STAGES[i].at) { stage = i; break; }
      }

      if (stage !== currentStage) {
        currentStage = stage;
        const pts = STAGES[stage].gen(N, W, H);
        setTargets(pts);

        labelText   = STAGES[stage].label;
        labelTarget = labelText ? 1 : 0;
      }

      labelOpacity += (labelTarget - labelOpacity) * 0.06;
      if (labelEl) {
        labelEl.textContent = labelText;
        labelEl.style.opacity = String(Math.max(0, labelOpacity));
      }

      ctx.fillStyle = "rgba(13,17,23,0.18)";
      ctx.fillRect(0, 0, W, H);

      ctx.shadowBlur = 0;

      for (let i = 0; i < N; i++) {
        const dx = tx[i] - px[i];
        const dy = ty[i] - py[i];
        pvx[i] += dx * SPRING;
        pvy[i] += dy * SPRING;
        pvx[i] *= DAMPING;
        pvy[i] *= DAMPING;

        const spd = Math.hypot(pvx[i], pvy[i]);
        if (spd > MAX_SPEED) {
          pvx[i] = (pvx[i] / spd) * MAX_SPEED;
          pvy[i] = (pvy[i] / spd) * MAX_SPEED;
        }

        px[i] += pvx[i];
        py[i] += pvy[i];

        const brightness = Math.min(1, spd / 6);
        const r = Math.round(57  + brightness * 198);
        const g = Math.round(255);
        const b = Math.round(136 + brightness * 100);
        const a = 0.55 + brightness * 0.4;

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;

        const size = ps[i] * (1 + brightness * 0.8);
        ctx.beginPath();
        ctx.arc(px[i], py[i], size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (stage > 0) {
        const maxDist = 28;
        const step    = Math.ceil(N / 300); // sample subset for perf
        ctx.lineWidth = 0.4;

        for (let i = 0; i < N; i += step) {
          for (let j = i + step; j < N; j += step) {
            const d = Math.hypot(px[i] - px[j], py[i] - py[j]);
            if (d < maxDist) {
              const a = (1 - d / maxDist) * 0.18;
              ctx.strokeStyle = `rgba(240,160,0,${a})`;
              ctx.beginPath();
              ctx.moveTo(px[i], py[i]);
              ctx.lineTo(px[j], py[j]);
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    initParticles();
    render();

    return () => {
      cancelAnimationFrame(animId);
      st.kill();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      <div
        ref={labelRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none font-util text-xs tracking-[0.3em] uppercase text-signal"
        style={{
          zIndex: 1,
          opacity: 0,
          textShadow: "0 0 16px rgba(240,160,0,0.7)",
          transition: "none",
        }}
        aria-hidden="true"
      />
    </>
  );
}
