"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";
import SplitTextReveal from "./SplitTextReveal";
import SpotlightCard from "./SpotlightCard";

const PROJECTS = [
  {
    title: "EdgeVision",
    subtitle: "AI Image Analysis & DIP Engine",
    description: "Browser-based image editor using Gemini 2.5 Flash for semantic scene analysis. Custom client-side digital image processing engine via the Canvas 2D API.",
    tech: ["Next.js", "Genkit", "Canvas 2D"],
    github: "https://github.com/Dhuvie/EdgeVision",
    size: "large" as const,
  },
  {
    title: "UPI ML Fraud Detection",
    subtitle: "Real-Time FinTech Security",
    description: "Trained 5 ML models on 6M+ UPI transactions. Deployed as a Flask REST API with batch prediction, velocity checks, and transaction sequence analysis.",
    tech: ["Python", "XGBoost", "Flask"],
    github: "https://github.com/Dhuvie/UPI-ML-Fraud-Detection",
    size: "large" as const,
  },
  {
    title: "AgriVision AI",
    subtitle: "Agricultural Intelligence",
    description: "End-to-end AI platform for crop yield prediction, pest/disease detection, and soil analysis using the Google Gemini API.",
    tech: ["Next.js", "Gemini API", "Edge Functions"],
    github: "https://github.com/Dhuvie/agrivision-ai",
    size: "medium" as const,
  },
  {
    title: "Adaptive Quantization",
    subtitle: "TinyML Research",
    description: "Runtime-aware adaptive quantization for ARM Cortex-M devices; achieved 3–5× energy reduction while retaining 82.8% accuracy.",
    tech: ["PyTorch", "TF Lite Micro", "C"],
    github: "https://github.com/Dhuvie/Adaptive-Quantization",
    size: "medium" as const,
  },
  {
    title: "Pac-Man",
    subtitle: "C++ / OpenGL Game AI",
    description: "Modern C++17 implementation of Pac-Man with advanced AI pathfinding (Dijkstra, A*), and real-time OpenGL graphics.",
    tech: ["C++17", "OpenGL", "CMake"],
    github: "https://github.com/Dhuvie/Pac-man",
    size: "small" as const,
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !panelContainerRef.current) return;
    if (prefersReducedMotion() || window.innerWidth < 1024) return;

    const panels = panelContainerRef.current;
    
    // Create GSAP context for safe cleanup
    const ctx = gsap.context(() => {
      // Small timeout to ensure DOM layout is complete before calculating width
      setTimeout(() => {
        const totalWidth = panels.scrollWidth - window.innerWidth;
        if (totalWidth > 0) {
          gsap.to(panels, {
            x: () => -totalWidth,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              pin: true,
              scrub: 1.5,
              start: "top top",
              end: () => `+=${totalWidth}`,
              invalidateOnRefresh: true,
            },
          });
        }
      }, 100);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="relative overflow-hidden py-24 border-y border-signal/10 z-10">
      
      {/* Section header */}
      <div className="section-container pb-12 relative z-20">
        <p className="font-mono text-sm text-signal tracking-[0.5em] uppercase mb-4" data-cursor-magnetic>
          {"// Featured Projects"}
        </p>
        <SplitTextReveal text="Things I've built." className="font-display font-semibold text-5xl md:text-7xl text-white" />
        <p className="text-white/40 mt-6 text-sm font-mono tracking-widest uppercase lg:hidden">
          Scroll horizontally to explore →
        </p>
      </div>

      {/* Horizontal scrolling panel (desktop GSAP) / Flex scroll (mobile) */}
      <div className="w-full relative z-20">
        <div 
          ref={panelContainerRef}
          className="flex lg:w-max gap-8 px-6 md:px-12 lg:px-24 overflow-x-auto lg:overflow-visible pb-12 snap-x snap-mandatory lg:snap-none hide-scrollbar lg:will-change-transform"
        >
          {PROJECTS.map((project) => (
            <a
              key={project.title}
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block shrink-0 snap-center transition-transform duration-500 hover:-translate-y-4 ${
                project.size === "large"
                  ? "w-[85vw] md:w-[600px] min-h-[450px]"
                  : project.size === "medium"
                  ? "w-[85vw] md:w-[450px] min-h-[400px]"
                  : "w-[85vw] md:w-[350px] min-h-[350px]"
              }`}
              data-cursor-text="VIEW"
            >
              <SpotlightCard className="h-full p-8 md:p-10 flex flex-col bg-[#111] border border-white/10 rounded-2xl">
                {/* Gradient accent top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-500 opacity-50 group-hover:opacity-100"
                  style={{ background: "linear-gradient(to right, rgba(240,160,0,0.8), transparent)" }}
                />

                {/* Number tag */}
                <span className="font-mono text-sm text-white/20 mb-6 block tracking-[0.3em]">
                  {String(PROJECTS.indexOf(project) + 1).padStart(2, "0")} /
                </span>

                {/* Title row */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="font-display font-black text-3xl lg:text-5xl text-white group-hover:text-signal transition-colors duration-300 tracking-tighter">
                      {project.title}
                    </h3>
                    <span className="font-mono text-sm text-signal tracking-[0.2em] uppercase mt-3 block">
                      {project.subtitle}
                    </span>
                  </div>
                  <div className="text-white/30 group-hover:text-signal transition-all duration-300 mt-2 group-hover:translate-x-2 group-hover:-translate-y-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/60 text-lg leading-relaxed flex-grow mb-8 font-sans">
                  {project.description}
                </p>

                {/* Tech pills */}
                <div className="flex flex-wrap gap-3 mt-auto pt-6 border-t border-white/10">
                  {project.tech.map((t) => (
                    <span key={t} className="font-mono text-[11px] uppercase text-signal/80 tracking-widest border border-signal/20 rounded-full px-4 py-2 bg-signal/5">
                      {t}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </a>
          ))}
          
          <div className="shrink-0 w-[5vw] md:w-[10vw]" />
        </div>
      </div>
    </section>
  );
}
