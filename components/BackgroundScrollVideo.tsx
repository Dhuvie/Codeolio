"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";


interface BackgroundScrollVideoProps {
  src?: string;
  frameSequenceUrlTemplate?: string;
  frameCount?: number;
  opacity?: number;
  playbackRate?: number;
}

export default function BackgroundScrollVideo({
  src,
  frameSequenceUrlTemplate,
  frameCount,
  opacity = 0.3,
  playbackRate = 1,
}: BackgroundScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!src || !videoRef.current || frameSequenceUrlTemplate) return;
    if (prefersReducedMotion()) return;

    const video = videoRef.current;

    const onLoaded = () => {
      setVideoReady(true);
      video.pause();

      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        onUpdate: (self) => {
          if (video.duration) {
            video.currentTime = self.progress * video.duration * playbackRate;
          }
        },
      });

      return () => st.kill();
    };

    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [src, playbackRate, frameSequenceUrlTemplate]);

  useEffect(() => {
    if (!frameSequenceUrlTemplate || !frameCount || !canvasRef.current) return;
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: HTMLImageElement[] = [];
    const loadedImages = new Set<number>();
    
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const paddedIndex = (i + 1).toString().padStart(4, "0");
      img.src = frameSequenceUrlTemplate.replace("{index}", paddedIndex);
      img.onload = () => {
        loadedImages.add(i);
        if (i === 0) render(0);
      };
      images.push(img);
    }

    let currentIndex = 0;

    let drawWidth = 0, drawHeight = 0, offsetX = 0, offsetY = 0;
    let canvasRatio = 1;

    const calculateDimensions = () => {
      const sampleImg = images.find(img => img.width > 0);
      if (!sampleImg) return;
      
      canvasRatio = canvas.width / canvas.height;
      const imgRatio = sampleImg.width / sampleImg.height;
      
      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
    };

    const render = (index: number) => {
      if (images[index] && loadedImages.has(index)) {
        if (drawWidth === 0) {
          calculateDimensions();
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (drawWidth > 0) {
          ctx.drawImage(images[index], offsetX, offsetY, drawWidth, drawHeight);
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      calculateDimensions();
      render(currentIndex); 
    };
    
    resize();
    window.addEventListener("resize", resize);

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 2.5, // Increased from 1.5 for ultra-smooth fluid scrolling
      onUpdate: (self) => {
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(self.progress * frameCount)
        );
        
        if (currentIndex !== frameIndex) {
          currentIndex = frameIndex;
          requestAnimationFrame(() => render(frameIndex));
        }
      },
    });

    return () => {
      window.removeEventListener("resize", resize);
      st.kill();
    };
  }, [frameSequenceUrlTemplate, frameCount]);

  useEffect(() => {
    if (src || frameSequenceUrlTemplate) return; 
    if (!canvasRef.current) return;
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let scrollProgress = 0;
    let scrollVelocity = 0;
    let animFrame = 0;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.1,
      onUpdate: (self) => {
        scrollVelocity = Math.abs(self.progress - scrollProgress) * 50;
        scrollProgress = self.progress;
      },
    });

    const animate = () => {
      time += 0.005;
      const w = canvas.width;
      const h = canvas.height;
      const vel = Math.min(scrollVelocity, 3);

      ctx.fillStyle = `rgba(13, 17, 23, ${0.06 + vel * 0.02})`;
      ctx.fillRect(0, 0, w, h);

      const phase = scrollProgress;

      const streamCount = 30 + Math.floor(phase * 20);
      ctx.font = "10px 'IBM Plex Mono', monospace";
      for (let i = 0; i < streamCount; i++) {
        const x = (i / streamCount) * w + Math.sin(time + i * 0.5) * 20;
        const streamLength = 5 + Math.floor(phase * 15);
        const baseOpacity = 0.02 + vel * 0.015;

        for (let j = 0; j < streamLength; j++) {
          const y = ((time * 80 + j * 25 + i * 47) % (h + 200)) - 100;
          const charOpacity = baseOpacity * (1 - j / streamLength);

          if (charOpacity > 0.005) {
            const isSignal = Math.random() > 0.85;
            ctx.fillStyle = isSignal
              ? `rgba(57, 255, 136, ${charOpacity * 2})`
              : `rgba(139, 148, 158, ${charOpacity})`;
            const chars = "01{}[]<>=+-*/|&^~:;.?!#@$%ABCDEFabcdef";
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, x, y);
          }
        }
      }

      const waveCount = 3 + Math.floor(phase * 4);
      for (let w_i = 0; w_i < waveCount; w_i++) {
        const baseY = (w_i + 1) / (waveCount + 1) * h;
        const freq = 0.5 + phase * 2 + w_i * 0.3;
        const amp = 20 + vel * 30 + Math.sin(time + w_i) * 10;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(57, 255, 136, ${0.03 + vel * 0.02})`;
        ctx.lineWidth = 0.8;

        for (let x = 0; x < w; x += 3) {
          const progress = x / w;
          const y =
            baseY +
            Math.sin(progress * Math.PI * 2 * freq + time * 2 + w_i) * amp +
            Math.sin(progress * Math.PI * 6 + time * 3) * (amp * 0.2);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const gridOpacity = 0.008 + phase * 0.012;
      ctx.strokeStyle = `rgba(57, 255, 136, ${gridOpacity})`;
      ctx.lineWidth = 0.5;

      const gridSpacingH = 80 - phase * 30;
      for (let y = 0; y < h; y += Math.max(gridSpacingH, 30)) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const gridSpacingV = 120 - phase * 40;
      for (let x = 0; x < w; x += Math.max(gridSpacingV, 40)) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      scrollVelocity *= 0.95;
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      st.kill();
    };
  }, [src, frameSequenceUrlTemplate]);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
    >
      {src && !frameSequenceUrlTemplate ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={src}
          muted
          playsInline
          preload="auto"
          style={{ display: videoReady ? "block" : "none" }}
        />
      ) : (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}
    </div>
  );
}
