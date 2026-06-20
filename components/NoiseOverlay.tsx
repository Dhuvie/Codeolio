"use client";

import { useEffect, useRef } from "react";

export default function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    resize();

    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 128;
    patternCanvas.height = 128;
    const pCtx = patternCanvas.getContext("2d");

    const render = () => {
      if (!pCtx) return;

      const imgData = pCtx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const color = Math.floor(Math.random() * 255);
        data[i] = color;
        data[i + 1] = color;
        data[i + 2] = color;
        data[i + 3] = 22; // Film grain opacity -- persepolis.getty.edu level
      }
      pCtx.putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat") as CanvasPattern;
      
      ctx.save();
      ctx.translate(Math.random() * 128, Math.random() * 128);
      ctx.fillRect(-128, -128, width + 256, height + 256);
      ctx.restore();

      setTimeout(() => {
        animationFrameId = requestAnimationFrame(render);
      }, 50);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none mix-blend-overlay opacity-50"
      style={{ isolation: "isolate" }}
    />
  );
}
