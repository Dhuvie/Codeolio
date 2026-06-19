"use client";
import { useRef, useEffect } from "react";

// -- GameGlobe ----------------------------------------------------------------
// A 3D rotating planet rendered in Canvas 2D.
// Cell-shaded surface (amber continents / deep teal oceans / ice poles),
// diffuse lighting, atmosphere halo, orbit ring, tiny surface structures.
// Directly inspired by the game-world globe of messenger.abeto.co.
// -----------------------------------------------------------------------------

const LAT_SEGS = 20;
const LON_SEGS = 32;

type V3 = [number, number, number];
type V2 = [number, number];

// ── Surface color based on lat/lon (procedural continent map) ─────────────────
function surfaceRGB(lat: number, lon: number): V3 {
  const absLat = Math.abs(lat);

  // Polar ice caps
  if (absLat > 1.25) return [242, 238, 222];

  // Pseudo-noise: creates blob-shaped continents
  const n =
    Math.sin(lat * 3.8 + 0.4) * Math.cos(lon * 2.7 - 0.9) * 0.50 +
    Math.sin(lat * 2.0 - lon * 3.2 + 1.1) * 0.30 +
    Math.cos(lat * 5.5 + lon * 1.8 - 0.7) * 0.20;

  if (n > 0.08) {
    // Land: warm amber / desert
    const h = Math.min(1, (n - 0.08) / 0.60);
    return [
      Math.floor(148 + h * 92),   // r: 148-240
      Math.floor(72  + h * 68),   // g: 72-140
      Math.floor(h * 12),          // b: 0-12
    ];
  } else if (n > -0.45) {
    // Ocean: deep blue-teal (game-sea color)
    return [14, 44, 68];
  } else {
    // Deep trench
    return [7, 24, 40];
  }
}

// ── Diffuse lighting (sun at upper-right) ─────────────────────────────────────
const LIGHT: V3 = [0.50, 0.35, 0.80]; // pre-normalized
function shade(n: V3): number {
  return Math.max(0.22, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
}

// ── Rotate around Y ───────────────────────────────────────────────────────────
function rotY(p: V3, a: number): V3 {
  const ca = Math.cos(a), sa = Math.sin(a);
  return [p[0] * ca - p[2] * sa, p[1], p[0] * sa + p[2] * ca];
}

// ── Sphere point ──────────────────────────────────────────────────────────────
function sph(lat: number, lon: number): V3 {
  return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
}

// ── Near-orthographic project ──────────────────────────────────────────────────
function proj(p: V3, R: number, cx: number, cy: number): V2 {
  const fov = R * 5;
  const s = fov / (fov + p[2] * R * 0.12);
  return [cx + p[0] * R * s, cy - p[1] * R * s];
}

// ── Building positions (lat, lon) at likely "land" tiles ──────────────────────
const STRUCTS: [number, number][] = [
  [ 0.32,  0.78], [-0.18,  2.10], [ 0.51,  3.48], [ 0.08,  5.20],
  [ 0.70,  1.30], [-0.40,  4.02], [ 0.22,  0.20], [-0.28,  2.82],
  [ 0.44,  4.90], [-0.55,  1.60], [ 0.15,  5.80], [ 0.62,  3.10],
];

// ── Stable star field (generated once at module level) ────────────────────────
const STARS = Array.from({ length: 220 }, () => ({
  x: Math.random(), y: Math.random(),
  r: 0.25 + Math.random() * 1.1,
  a: 0.25 + Math.random() * 0.65,
}));

export default function GameGlobe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    let W = 0, H = 0, raf = 0;
    let angle = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      W = canvas!.width  = Math.round(rect.width);
      H = canvas!.height = Math.round(rect.height);
    }

    function draw() {
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);

      const R  = Math.min(W, H) * 0.40;
      const cx = W * 0.52;   // slightly right of center
      const cy = H * 0.50;

      // ── Stars ───────────────────────────────────────────────────────────────
      for (const s of STARS) {
        ctx.fillStyle = `rgba(255,235,195,${s.a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Build and sort surface quads ─────────────────────────────────────────
      type Quad = { pts: V2[]; z: number; r: number; g: number; b: number };
      const quads: Quad[] = [];

      for (let i = 0; i < LAT_SEGS; i++) {
        const lat1 = (i / LAT_SEGS) * Math.PI - Math.PI / 2;
        const lat2 = ((i + 1) / LAT_SEGS) * Math.PI - Math.PI / 2;
        const midLat = (lat1 + lat2) / 2;

        for (let j = 0; j < LON_SEGS; j++) {
          const lon1 = (j / LON_SEGS) * Math.PI * 2;
          const lon2 = ((j + 1) / LON_SEGS) * Math.PI * 2;
          const midLon = (lon1 + lon2) / 2;

          const mid3 = rotY(sph(midLat, midLon), angle);
          if (mid3[2] < -0.05) continue;   // cull back-face

          const light = shade(mid3);
          const [br, bg, bb] = surfaceRGB(midLat, midLon);

          const corners: V3[] = [
            sph(lat1, lon1), sph(lat1, lon2),
            sph(lat2, lon2), sph(lat2, lon1),
          ].map(p => rotY(p, angle)) as V3[];

          quads.push({
            pts: corners.map(p => proj(p, R, cx, cy)),
            z: mid3[2],
            r: Math.round(br * light),
            g: Math.round(bg * light),
            b: Math.round(bb * light),
          });
        }
      }

      quads.sort((a, b) => a.z - b.z);

      for (const q of quads) {
        ctx.fillStyle = `rgb(${q.r},${q.g},${q.b})`;
        ctx.beginPath();
        ctx.moveTo(q.pts[0][0], q.pts[0][1]);
        for (let k = 1; k < 4; k++) ctx.lineTo(q.pts[k][0], q.pts[k][1]);
        ctx.closePath();
        ctx.fill();
      }

      // ── Surface grid lines (very subtle) ─────────────────────────────────────
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.4;
      for (const q of quads) {
        ctx.beginPath();
        ctx.moveTo(q.pts[0][0], q.pts[0][1]);
        for (let k = 1; k < 4; k++) ctx.lineTo(q.pts[k][0], q.pts[k][1]);
        ctx.closePath();
        ctx.stroke();
      }

      // ── Structures (tiny buildings on land tiles) ────────────────────────────
      for (const [lat, lon] of STRUCTS) {
        const p = rotY(sph(lat, lon), angle);
        if (p[2] < 0.1) continue;

        const [bx, by] = proj(p, R, cx, cy);
        const depth   = (p[2] + 1) / 2;          // 0-1
        const sz      = R * 0.022 * depth;
        const bright  = Math.floor(200 + depth * 55);

        // Tower body
        ctx.fillStyle = `rgb(${bright},${Math.floor(bright * 0.55)},0)`;
        ctx.fillRect(bx - sz * 0.7, by - sz * 2.4, sz * 1.4, sz * 2.4);
        // Roof / top accent (bright signal)
        ctx.fillStyle = `rgb(255,${Math.floor(bright * 0.85)},80)`;
        ctx.fillRect(bx - sz * 0.9, by - sz * 2.8, sz * 1.8, sz * 0.5);
        // Antenna
        ctx.strokeStyle = `rgba(255,200,80,${(depth * 0.9).toFixed(2)})`;
        ctx.lineWidth = sz * 0.25;
        ctx.beginPath();
        ctx.moveTo(bx, by - sz * 2.8);
        ctx.lineTo(bx, by - sz * 4.0);
        ctx.stroke();
      }

      // ── Orbit ring ───────────────────────────────────────────────────────────
      ctx.save();
      ctx.strokeStyle = "rgba(240,160,0,0.40)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.52, R * 0.30, 0.08, 0, Math.PI * 2);
      ctx.stroke();
      // Orbit dot
      const dotAngle = angle * 0.6;
      const dotX = cx + Math.cos(dotAngle) * R * 1.52;
      const dotY = cy + Math.sin(dotAngle) * R * 0.30 * Math.cos(0.08) + Math.cos(dotAngle) * R * 0.30 * Math.sin(0.08);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,200,80,0.85)";
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── Atmosphere halo ───────────────────────────────────────────────────────
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.94, cx, cy, R * 1.22);
      atmo.addColorStop(0,   "rgba(240,130,20,0.22)");
      atmo.addColorStop(0.5, "rgba(220,80,10,0.09)");
      atmo.addColorStop(1,   "rgba(180,40,0,0)");
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // ── Specular glint (sun catch on upper-right edge) ────────────────────────
      const gx = cx + R * 0.30;
      const gy = cy - R * 0.28;
      const spec = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * 0.45);
      spec.addColorStop(0, "rgba(255,230,160,0.18)");
      spec.addColorStop(1, "rgba(255,180,60,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      angle += 0.0018;
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}