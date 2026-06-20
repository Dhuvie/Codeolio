"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { createStaggerEntrance, animateCounter, prefersReducedMotion, createMagneticEffect } from "@/lib/animations";
import FloatingOrbs from "./FloatingOrbs";

const STATS = [
  { value: 887, display: "8.87", suffix: "", label: "CGPA / 10.0", sub: "B.Tech CSE (AI/ML)", decimals: true },
  { value: 500, display: "500", suffix: "+", label: "ROCS Attendees", sub: "ACM India Event", decimals: false },
  { value: 180, display: "180", suffix: "+", label: "Students Mentored", sub: "DSA & Full-Stack", decimals: false },
  { value: 40,  display: "40",  suffix: "%", label: "YoY Growth",       sub: "ACM Chapter Chair", decimals: false },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;

    const items = sectionRef.current.querySelectorAll(".about-item");
    const st = createStaggerEntrance(sectionRef.current, items, { stagger: 0.1 });

    const statsElements = sectionRef.current.querySelectorAll(".stat-card-pulse");
    const magneticCleanups: (() => void)[] = [];
    statsElements.forEach(el => {
      magneticCleanups.push(createMagneticEffect(el as HTMLElement, 0.2));
    });

    const kineticText = sectionRef.current.querySelector(".kinetic-text-about");
    let kineticST: ScrollTrigger | undefined;
    if (kineticText) {
      kineticST = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        animation: gsap.fromTo(kineticText, { x: "0%" }, { x: "-20%", ease: "none" })
      });
    }

    const counterST = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 70%",
      once: true,
      onEnter: () => {
        setTriggered(true);
        STATS.forEach((stat, i) => {
          const el = statRefs.current[i];
          if (!el) return;
          if (stat.decimals) {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: 8.87,
              duration: 2,
              ease: "expo.out",
              onUpdate: () => { el.textContent = obj.val.toFixed(2); },
              onComplete: () => { el.textContent = "8.87"; },
            });
          } else {
            animateCounter(el, stat.value, stat.suffix, "", 1.8);
          }
        });
      },
    });

    return () => {
      st.kill();
      counterST.kill();
      kineticST?.kill();
      magneticCleanups.forEach(cleanup => cleanup());
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative overflow-hidden">
      <FloatingOrbs count={3} />

      <div 
        className="absolute top-1/3 left-0 w-full whitespace-nowrap opacity-[0.02] pointer-events-none z-0 overflow-hidden font-display font-black uppercase tracking-tighter select-none"
        style={{ fontSize: "20vw", lineHeight: 0.8, color: "transparent", WebkitTextStroke: "2px var(--signal)" }}
      >
        <div className="kinetic-text-about flex gap-8">
          <span>ABOUT</span><span>ABOUT</span><span>ABOUT</span><span>ABOUT</span><span>ABOUT</span>
        </div>
      </div>

      <div className="section-container relative z-10">
        <p className="section-label">About</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-7">
            <h2
              className="about-item font-display font-black mb-8 leading-[1.1] tracking-tighter"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              Building at the intersection of{" "}
              <span className="signal-text glow-breathe mix-blend-screen">systems</span> and{" "}
              <span className="signal-text glow-breathe mix-blend-screen" style={{ animationDelay: "1.5s" }}>intelligence</span>
            </h2>
            <p className="about-item text-glow-ambient leading-relaxed mb-4">
              I&#39;m a Computer Science Engineering student specializing in AI/ML at
              SRM University–AP, on track to graduate in 2027. My work spans the
              full stack - from writing pixel-level image processing kernels and
              OpenGL renderers to building production web platforms with Next.js
              and deploying ML models as real-time APIs.
            </p>
            <p className="about-item text-glow-ambient leading-relaxed">
              What drives me is the challenge of making complex systems work
              reliably at scale - whether that&#39;s optimizing a neural network to
              run on a 512KB microcontroller, or engineering a CDN caching layer
              that halves page-load times on 3G connections.
            </p>

            <div className="about-item mt-8 space-y-3">
              {[
                { label: "Systems / Low-Level", blocks: 15, level: "Advanced" },
                { label: "AI / ML Engineering", blocks: 13, level: "Proficient" },
                { label: "Full-Stack Web", blocks: 17, level: "Advanced" },
              ].map((bar, i) => (
                <div key={bar.label} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="font-util text-xs text-muted tracking-wider">{bar.label}</span>
                    <span className="font-util text-[10px] text-signal/50 tracking-widest uppercase">{bar.level}</span>
                  </div>
                  <div className="flex gap-[2px]">
                    {[...Array(20)].map((_, j) => (
                      <div
                        key={j}
                        className="h-[3px] flex-1 rounded-[1px]"
                        style={{
                          background: triggered && j < bar.blocks ? "var(--signal)" : "rgba(255,255,255,0.05)",
                          boxShadow: triggered && j < bar.blocks ? "0 0 5px rgba(240,160,0,0.3)" : "none",
                          opacity: triggered && j < bar.blocks ? 1 - (j * 0.02) : 1, // Slight fade towards the end
                          transition: `background 0.1s ease-out ${0.2 + i * 0.15 + j * 0.03}s, box-shadow 0.1s ease-out ${0.2 + i * 0.15 + j * 0.03}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="about-item card-glass-ultra noise-overlay shimmer-container stat-card-pulse flex flex-col relative group cursor-default p-6"
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: "radial-gradient(circle at top right, rgba(240,160,0,0.25), transparent 70%)" }} />

                <span
                  ref={(el) => { statRefs.current[i] = el; }}
                  className="font-util text-3xl font-bold text-signal"
                  style={{ textShadow: "0 0 16px rgba(240,160,0,0.5)" }}
                >
                  {stat.display}{stat.suffix}
                </span>
                <span className="font-util text-xs text-muted mt-1">
                  {stat.label}
                </span>
                <span className="text-sm text-muted mt-2">
                  {stat.sub}
                </span>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 ease-out"
                  style={{ background: "linear-gradient(to right, #f0a000, transparent)" }} />
              </div>
            ))}
          </div>
        </div>

        <div className="about-item mt-12 flex flex-wrap items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L1 5l7 4 7-4-7-4zM1 11l7 4 7-4M1 8l7 4 7-4"
                stroke="var(--signal)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>SRM University–AP</span>
          </div>
          <span className="text-ink/20">|</span>
          <span className="font-util text-xs">2023–2027</span>
          <span className="text-ink/20">|</span>
          <span>Chair, ACM Student Chapter</span>
          <span className="font-util text-xs text-signal">(Jan 2025–Apr 2026)</span>
        </div>
      </div>

      <div className="section-wave" />
    </section>
  );
}
