"use client";
import { useRef, useEffect } from "react";
import { prefersReducedMotion } from "@/lib/animations";

// ── Rotating 3D wireframe globe ──────────────────────────────────────────────
// Inspired by the central spinning world of messenger.abeto.co.
// Pure Canvas 2D — latitude/longitude lines with depth-based alpha fade.
// ─────────────────────────────────────────────────────────────────────────────

const SIG: [number, number, number] = [57, 255, 136];
const LAT = 14;
const LON = 20;

type V3 = [number, number, number];

export default function WireframeSphere({ size = 500 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const R = size * 0.42;
    const cx = size / 2;
    const cy = size / 2;
    let angleY = 0;
    let raf = 0;

    function spherePt(phi: number, theta: number): V3 {
      return [
        R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta),
      ];
    }

    function project(x: number, y: number, z: number): V3 {
      // Y-axis rotation
      const ca = Math.cos(angleY);
      const sa = Math.sin(angleY);
      const rx = x * ca - z * sa;
      const rz = x * sa + z * ca;
      // Slight X-axis tilt
      const tilt = 0.28;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const ry2 = y * ct - rz * st;
      const rz2 = y * st + rz * ct;
      // Near-orthographic (long focal length = minimal distortion)
      const fov = size * 3;
      const s = fov / (fov + rz2 * 0.5);
      return [cx + rx * s, cy - ry2 * s, rz2];
    }

    function drawLine(p1: V3, p2: V3, baseA: number) {
      const depth = ((p1[2] + p2[2]) / 2 + R) / (2 * R);
      const alpha = Math.max(0, depth) * baseA;
      ctx.strokeStyle = `rgba(${SIG[0]},${SIG[1]},${SIG[2]},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, size, size);
      ctx.lineWidth = 0.8;

      // Latitude circles
      for (let i = 1; i < LAT; i++) {
        const phi = (i / LAT) * Math.PI;
        const pts: V3[] = [];
        for (let j = 0; j <= LON * 2; j++) {
          const [x, y, z] = spherePt(phi, (j / (LON * 2)) * Math.PI * 2);
          pts.push(project(x, y, z));
        }
        for (let j = 0; j < pts.length - 1; j++) {
          drawLine(pts[j], pts[j + 1], 0.55);
        }
      }

      // Longitude lines
      for (let j = 0; j < LON; j++) {
        const theta = (j / LON) * Math.PI * 2;
        const pts: V3[] = [];
        for (let i = 0; i <= LAT * 2; i++) {
          const [x, y, z] = spherePt((i / (LAT * 2)) * Math.PI, theta);
          pts.push(project(x, y, z));
        }
        for (let i = 0; i < pts.length - 1; i++) {
          drawLine(pts[i], pts[i + 1], 0.42);
        }
      }

      // Glowing intersection dots on the equator
      for (let j = 0; j < LON; j++) {
        const theta = (j / LON) * Math.PI * 2;
        const [px, py, pz] = project(R * Math.cos(theta), 0, R * Math.sin(theta));
        const depth = (pz + R) / (2 * R);
        if (depth > 0.25) {
          ctx.fillStyle = `rgba(${SIG[0]},${SIG[1]},${SIG[2]},${(depth * 0.9).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      angleY += 0.0025;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ imageRendering: "crisp-edges" }}
    />
  );
}
