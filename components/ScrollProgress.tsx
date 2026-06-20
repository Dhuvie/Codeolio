"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";


const SECTION_NAMES = ["Hero", "About", "Experience", "Projects", "Achievements", "Skills", "Contact"];

export default function ScrollProgress() {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGCircleElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
      onUpdate: (self) => {
        const progress = Math.round(self.progress * 100);
        if (fillRef.current) {
          const offset = 176 - (self.progress * 176);
          fillRef.current.style.strokeDashoffset = `${offset}`;
        }
        if (counterRef.current) {
          counterRef.current.textContent = `${progress}`;
        }
      },
    });

    const sections = ["hero", "about", "experience", "projects", "achievements", "skills", "contact"];
    const sectionTriggers = sections.map((id, index) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onEnter: () => setCurrentSection(index),
        onEnterBack: () => setCurrentSection(index),
      });
    });

    return () => {
      st.kill();
      sectionTriggers.forEach((t) => t?.kill());
    };
  }, []);

  return (
    <div
      ref={railRef}
      className="fixed right-6 bottom-6 z-50 hidden lg:flex flex-col items-center gap-2 group"
    >
      <div className="absolute right-16 top-1/2 -translate-y-1/2 font-util text-[10px] text-signal/0 group-hover:text-signal/80 tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 translate-x-4 group-hover:translate-x-0">
        {SECTION_NAMES[currentSection]}
      </div>

      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="var(--signal)"
            strokeWidth="1"
            className="opacity-10"
          />
        </svg>

        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            ref={fillRef}
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="var(--signal)"
            strokeWidth="1.5"
            strokeDasharray="176" // 2 * PI * 28 = ~175.9
            strokeDashoffset="176"
            className="transition-all duration-100 ease-linear"
            style={{ filter: "drop-shadow(0 0 6px var(--signal))" }}
          />
        </svg>

        <div className="font-mono text-[10px] text-signal/80 tabular-nums font-bold tracking-widest">
          <span ref={counterRef}>0</span>
        </div>
      </div>
    </div>
  );
}
