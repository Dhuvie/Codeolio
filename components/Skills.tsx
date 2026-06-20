"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";
import SpotlightCard from "./SpotlightCard";
import SplitTextReveal from "./SplitTextReveal";

const SKILL_GROUPS = [
  {
    category: "Languages",
    items: ["C++", "Python", "TypeScript", "Java", "JavaScript", "C", "SQL"],
  },
  {
    category: "AI/ML",
    items: [
      "XGBoost",
      "LightGBM",
      "PyTorch",
      "TensorFlow",
      "Scikit-learn",
      "Google Gemini API",
      "Genkit",
      "Hugging Face",
    ],
  },
  {
    category: "Web & Backend",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "Express.js",
      "Flask",
      "REST APIs",
      "Socket.IO",
      "Framer Motion",
      "Tailwind CSS",
      "JWT",
      "RBAC",
    ],
  },
  {
    category: "Databases",
    items: [
      "PostgreSQL",
      "Prisma ORM",
      "MongoDB",
      "MySQL",
      "Firebase Firestore",
      "Redis",
    ],
  },
  {
    category: "Graphics & DIP",
    items: [
      "OpenGL",
      "GLSL",
      "GLFW",
      "Canvas 2D API",
      "Digital Image Processing",
      "Three.js",
      "anime.js",
    ],
  },
  {
    category: "DevOps & Tools",
    items: [
      "Docker",
      "Git",
      "GitHub Actions",
      "Vercel",
      "Firebase",
      "Vite",
      "Turbopack",
      "Linux",
      "CMake",
      "Agile",
    ],
  },
];

import { useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*&%";

function ScrambleText({ text, trigger }: { text: string; trigger: any }) {
  const [displayText, setDisplayText] = useState(text);
  
  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;
    
    interval = setInterval(() => {
      setDisplayText((prev) => 
        text.split("").map((letter, index) => {
          if (letter === " ") return " ";
          if (index < iteration) {
            return text[index];
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      
      if(iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 30);
    
    return () => clearInterval(interval);
  }, [text, trigger]);
  
  return <>{displayText}</>;
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;

    gsap.from(".cyber-window-skills", {
      opacity: 0,
      y: 50,
      scale: 0.95,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".cyber-window-skills",
        start: "top 85%",
      },
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((t) => sectionRef.current?.contains(t.trigger as Element))
        .forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="relative py-12 overflow-hidden">
      <div className="absolute inset-0 grid-dots opacity-20 pointer-events-none" />

      <div className="section-container relative z-10">
        <p className="section-label" data-cursor-magnetic>Skills</p>
        <SplitTextReveal text="Technical toolkit." className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl mb-16" />

        <div className="flex flex-col gap-6 lg:hidden mt-8">
          {SKILL_GROUPS.map((group, i) => (
            <div key={i} className="border-l-2 border-signal/20 pl-4 py-1 relative">
              <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]" />
              <h3 className="font-mono text-signal text-xs md:text-sm uppercase tracking-widest mb-3">[{group.category}]</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item, j) => (
                  <span key={j} className="font-mono text-[10px] md:text-xs text-white bg-signal/10 border border-signal/20 px-2 py-1 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block cyber-window-skills relative w-full border border-signal/20 bg-[#050505] rounded-lg overflow-hidden shadow-[0_0_50px_rgba(240,160,0,0.05)]">
          
          <div className="h-10 bg-signal/10 border-b border-signal/20 flex items-center justify-between px-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="font-mono text-xs text-signal/70 uppercase tracking-widest">
              SYS:\\ROOT\\SKILLS_DB.exe
            </span>
            <div className="w-16" /> 
          </div>

          <div className="flex flex-col md:grid md:grid-cols-12 min-h-[450px]">
            
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-signal/20 bg-[#080808] p-4 flex flex-row flex-wrap md:flex-col gap-2 items-center md:items-stretch">
              <span className="w-full md:w-auto font-mono text-[10px] md:text-xs text-muted mb-2 md:mb-4 uppercase tracking-widest">Directory Listing</span>
              {SKILL_GROUPS.map((group, i) => {
                const isActive = activeIdx === i;
                const dirName = group.category.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
                return (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveIdx(i)}
                    onTouchStart={() => setActiveIdx(i)}
                    className={`cursor-pointer select-none text-left font-mono text-[11px] md:text-sm px-3 py-2 transition-all duration-200 border border-signal/10 md:border-t-0 md:border-r-0 md:border-b-0 md:border-l-2 md:border-signal/transparent rounded-full md:rounded-none whitespace-nowrap flex-shrink-0
                      ${isActive 
                        ? "border-signal bg-signal/10 text-signal shadow-[inset_0_0_10px_rgba(240,160,0,0.2)] md:border-l-signal" 
                        : "text-muted bg-surface/40 md:bg-transparent md:hover:border-l-signal/50 md:hover:text-signal md:hover:bg-signal/5"}
                    `}
                  >
                    <span className="mr-2 opacity-50">{isActive ? "[►]" : "[+]"}</span>
                    DIR_{dirName}
                  </div>
                );
              })}
            </div>

            <div className="md:col-span-8 bg-[#030303] p-4 md:p-10 relative overflow-hidden group flex-1">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none z-20" />
              
              {activeIdx === null ? (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center opacity-50 relative z-10 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--signal)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <span className="font-mono text-xs md:text-sm text-signal animate-pulse tracking-widest">
                    AWAITING DIRECTORY SELECTION...
                  </span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-6 md:mb-8 border-b border-signal/20 pb-4">
                    <div>
                      <h3 className="font-mono text-xl md:text-2xl font-bold text-signal drop-shadow-[0_0_8px_rgba(240,160,0,0.8)] uppercase tracking-widest break-all">
                        <ScrambleText text={`/SKILLS/${SKILL_GROUPS[activeIdx].category.toUpperCase()}`} trigger={activeIdx} />
                      </h3>
                      <p className="font-mono text-[10px] md:text-xs text-white/50 mt-2 uppercase tracking-widest">
                        STATUS: DECRYPTED | ITEMS: {SKILL_GROUPS[activeIdx].items.length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {SKILL_GROUPS[activeIdx].items.map((item, idx) => (
                      <div 
                        key={`${activeIdx}-${idx}`}
                        className="font-mono text-xs md:text-sm border border-signal/20 bg-signal/5 px-2 py-2 flex items-center justify-between group-hover:border-signal/50 transition-colors"
                      >
                        <span className="text-white truncate pr-2">
                          <ScrambleText text={item} trigger={`${activeIdx}-${item}`} />
                        </span>
                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-signal/50 shadow-[0_0_5px_var(--signal)] flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 flex items-center gap-2 text-[10px] md:text-xs font-mono text-signal/40">
                    <span className="w-2 h-2 bg-signal animate-pulse" />
                    DATA_STREAM_ACTIVE
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
