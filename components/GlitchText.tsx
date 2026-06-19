"use client";

import { useEffect, useRef, useState } from "react";

import React from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  trigger?: "hover" | "always" | "mount";
  speed?: number;
}

export default function GlitchText({
  text,
  className = "",
  as,
  trigger = "hover",
  speed = 40,
}: GlitchTextProps) {
  const [displayed, setDisplayed] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGlitch = () => {
    if (intervalRef.current) return;
    let frame = 0;
    const totalFrames = text.length * 2;

    intervalRef.current = setInterval(() => {
      frame++;
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      setDisplayed(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealCount) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (frame >= totalFrames) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setDisplayed(text);
        if (trigger === "always") {
          setTimeout(startGlitch, 2000 + Math.random() * 3000);
        }
      }
    }, speed);
  };

  useEffect(() => {
    if (trigger === "mount" || trigger === "always") {
      const timer = setTimeout(startGlitch, 300);
      return () => {
        clearTimeout(timer);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const handlers =
    trigger === "hover"
      ? {
          onMouseEnter: startGlitch,
        }
      : {};

  const Tag: any = as ?? "span";

  return (
    <Tag
      className={`font-mono glitch-text select-none ${className}`}
      data-text={text}
      {...handlers}
    >
      {displayed}
    </Tag>
  );
}
