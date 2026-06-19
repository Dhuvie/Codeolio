"use client";
import { useRef, useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";

// -- Warm Metaball Nebula -------------------------------------------------------
// Six large amber blobs drift imperceptibly slowly across the dark canvas.
// globalCompositeOperation="lighter" makes overlapping areas glow brighter --
// creating a nebula / lava-lamp / warm-light effect. Completely cinematic.
// Now reactive to scroll velocity — faster scrolling = brighter, faster drift.
// ------------------------------------------------------------------------------

const AMB_R = 240, AMB_G = 150, AMB_B = 0;

interface Blob { px: number; py: number; vx: number; vy: number; r: number; }

// r is fraction of Math.min(W,H). vx/vy are units/sec (screen-fraction).
const BLOBS: Blob[] = [
  { px: 0.18, py: 0.28, vx:  0.011, vy:  0.007, r: 0.42 },
  { px: 0.78, py: 0.58, vx: -0.009, vy:  0.013, r: 0.34 },
  { px: 0.52, py: 0.82, vx:  0.007, vy: -0.012, r: 0.30 },
  { px: 0.08, py: 0.70, vx:  0.013, vy: -0.009, r: 0.26 },
  { px: 0.88, py: 0.18, vx: -0.010, vy:  0.011, r: 0.36 },
  { px: 0.42, py: 0.42, vx: -0.008, vy:  0.015, r: 0.24 },
];

export default function FlowField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    let W = 0, H = 0, raf = 0, last = 0;
    let scrollVelocity = 0;

    // Avoid mutating the module-level array
    const blobs = BLOBS.map(b => ({ ...b }));

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }

    // Track scroll velocity for reactive brightness
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.1,
      onUpdate: (self) => {
        // Capture velocity as absolute change per update
        scrollVelocity = Math.min(Math.abs(self.getVelocity()) / 2000, 2);
      },
    });

    function draw(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // Scroll velocity affects brightness and speed
      const velocityMult = 1 + scrollVelocity * 0.6; // Speed boost 
      const brightnessBoost = scrollVelocity * 0.04;  // Brightness boost

      for (const b of blobs) {
        const x = b.px * W;
        const y = b.py * H;
        const r = b.r * Math.min(W, H);

        const baseAlpha = 0.11 + brightnessBoost;
        const midAlpha = 0.06 + brightnessBoost * 0.5;
        const outerAlpha = 0.02 + brightnessBoost * 0.2;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0,    `rgba(${AMB_R},${AMB_G},${AMB_B},${baseAlpha.toFixed(3)})`);
        grad.addColorStop(0.30, `rgba(${AMB_R},${AMB_G - 40},0,${midAlpha.toFixed(3)})`);
        grad.addColorStop(0.65, `rgba(${AMB_R - 40},40,0,${outerAlpha.toFixed(3)})`);
        grad.addColorStop(1,    `rgba(60,10,0,0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Drift — faster when scrolling
        b.px += b.vx * dt * velocityMult;
        b.py += b.vy * dt * velocityMult;
        // Bounce
        if (b.px < 0 || b.px > 1) { b.vx = -b.vx; b.px = Math.max(0, Math.min(1, b.px)); }
        if (b.py < 0 || b.py > 1) { b.vy = -b.vy; b.py = Math.max(0, Math.min(1, b.py)); }
      }

      ctx.globalCompositeOperation = "source-over";

      // Decay scroll velocity
      scrollVelocity *= 0.92;

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(n => { last = n; draw(n); });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      st.kill();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}