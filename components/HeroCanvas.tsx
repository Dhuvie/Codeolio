"use client";

import { useRef, useEffect } from "react";
import { prefersReducedMotion } from "@/lib/animations";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollVelocityRef = useRef(0);
  const lastScrollRef = useRef(0);
  const animFrameRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (prefersReducedMotion()) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawStaticWaveform(ctx, canvas.width, canvas.height);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      scrollVelocityRef.current = Math.abs(currentScroll - lastScrollRef.current);
      lastScrollRef.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const animate = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const velocity = Math.min(scrollVelocityRef.current, 50);

      scrollVelocityRef.current *= 0.92;

      ctx.fillStyle = "rgba(13, 17, 23, 0.15)";
      ctx.fillRect(0, 0, w, h);

      const channels = [
        { y: h * 0.3, freq: 1.2, amp: 40, color: "57, 255, 136", opacity: 0.15 },
        { y: h * 0.45, freq: 0.8, amp: 60, color: "57, 255, 136", opacity: 0.08 },
        { y: h * 0.6, freq: 2.0, amp: 25, color: "57, 255, 136", opacity: 0.12 },
        { y: h * 0.75, freq: 0.5, amp: 80, color: "57, 255, 136", opacity: 0.06 },
      ];

      channels.forEach((ch) => {
        const velocityBoost = 1 + velocity * 0.08;
        drawWaveform(ctx, w, ch.y, ch.freq * velocityBoost, ch.amp * velocityBoost, t, ch.color, ch.opacity);
      });

      drawScanlines(ctx, w, h, t);

      drawReadoutLine(ctx, w, h * 0.5, t, velocity);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  frequency: number,
  amplitude: number,
  time: number,
  color: string,
  opacity: number
) {
  ctx.beginPath();
  ctx.strokeStyle = `rgba(${color}, ${opacity})`;
  ctx.lineWidth = 1.5;

  for (let x = 0; x < width; x += 2) {
    const progress = x / width;
    const y =
      baseY +
      Math.sin(progress * Math.PI * 2 * frequency + time * 2) * amplitude +
      Math.sin(progress * Math.PI * 4 * frequency + time * 3) * (amplitude * 0.3) +
      Math.sin(progress * Math.PI * 8 + time * 1.5) * (amplitude * 0.1);

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  ctx.shadowColor = `rgba(${color}, ${opacity * 2})`;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  ctx.strokeStyle = "rgba(57, 255, 136, 0.015)";
  ctx.lineWidth = 0.5;

  for (let y = 0; y < height; y += 60) {
    const offset = Math.sin(y * 0.01 + time) * 2;
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(width, y + offset);
    ctx.stroke();
  }

  for (let x = 0; x < width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawReadoutLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  time: number,
  velocity: number
) {
  ctx.beginPath();
  ctx.strokeStyle = `rgba(57, 255, 136, ${0.03 + velocity * 0.002})`;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 8]);
  ctx.moveTo(0, baseY);
  ctx.lineTo(width, baseY);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawStaticWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "rgba(13, 17, 23, 1)";
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(57, 255, 136, 0.1)";
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 2) {
    const progress = x / width;
    const y = height * 0.5 + Math.sin(progress * Math.PI * 2) * 40;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}
