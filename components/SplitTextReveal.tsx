"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";

interface SplitTextRevealProps {
  text: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
}

export default function SplitTextReveal({
  text,
  className = "",
  as,
  delay = 0,
}: SplitTextRevealProps) {
  const Tag: any = as ?? "div";
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const chars = containerRef.current.querySelectorAll(".reveal-char");

    gsap.fromTo(
      chars,
      {
        y: "100%",
        opacity: 0,
        rotateX: -90,
        filter: "blur(10px)",
      },
      {
        y: "0%",
        opacity: 1,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 1.2, // Slightly longer for the blur to settle
        stagger: 0.03,
        ease: "power3.out", // Smoother ease for blur
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
        delay,
      }
    );
  }, [delay]);

  const splitText = text.split("").map((char, i) => (
    <span
      key={i}
      className="reveal-char inline-block"
      style={{
        display: char === " " ? "inline" : "inline-block",
        transformOrigin: "bottom center",
      }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));

  return (
    <Tag ref={containerRef} className={`${className} perspective-[1000px]`}>
      <span className="block overflow-hidden pb-2">{splitText}</span>
    </Tag>
  );
}
