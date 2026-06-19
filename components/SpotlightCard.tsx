"use client";

import { useRef, useState } from "react";
import TiltCard from "./TiltCard";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  maxDeg?: number;
  style?: React.CSSProperties;
}

export default function SpotlightCard({ children, className = "", maxDeg = 5, style }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <TiltCard maxDeg={maxDeg} className="h-full">
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative rounded-xl h-full card-glass-ultra noise-overlay ${className}`}
        style={style}
      >
        {/* Warm amber spotlight — matches signal palette */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(240, 160, 0, 0.08), rgba(240, 120, 0, 0.03) 40%, transparent 70%)`,
          }}
        />
        <div className="relative h-full z-10">{children}</div>
      </div>
    </TiltCard>
  );
}
