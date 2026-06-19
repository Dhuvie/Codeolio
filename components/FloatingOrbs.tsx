"use client";

import { useEffect, useRef, useState } from "react";

interface Orb {
  x: string;
  y: string;
  size: string;
  delay: string;
  duration: string;
  opacity: number;
}

export default function FloatingOrbs({ count = 5 }: { count?: number }) {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    setOrbs(
      Array.from({ length: count }, (_, i) => ({
        x: `${10 + Math.random() * 80}%`,
        y: `${10 + Math.random() * 80}%`,
        size: `${200 + Math.random() * 400}px`,
        delay: `${(i * 1.3).toFixed(1)}s`,
        duration: `${8 + Math.random() * 8}s`,
        opacity: 0.04 + Math.random() * 0.06,
      }))
    );
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="orb-float absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, rgba(240,160,0,${orb.opacity}) 0%, transparent 70%)`,
            animationDelay: orb.delay,
            animationDuration: orb.duration,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
