"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";
import SplitTextReveal from "./SplitTextReveal";

const BOOKS_DATA = [
  {
    title: "Handbook of Languages",
    spineTitle: "SYNTAX & PARADIGMS",
    volume: "VOL. I",
    coverColor: "bg-[#5c1d1d] hover:bg-[#6e2222]", // crimson leather
    textColor: "text-[#fef3c7]",
    spineColor: "border-[#3b1212]",
    ribbonColor: "bg-amber-400",
    fileName: "LANGUAGES",
    height: "h-[92%]",
    width: "w-12 md:w-14",
    tilt: "rotate-0",
    items: [
      { name: "C++ Systems", level: 5, note: "Low-latency scheduling & hardware interfaces." },
      { name: "Python Scripting", level: 5, note: "Scientific computing, model tooling & fast prototyping." },
      { name: "TypeScript / JS", level: 5, note: "Full-stack client architectures & responsive designs." },
      { name: "Java Core", level: 4, note: "Distributed applications & data streams processing." },
      { name: "SQL Languages", level: 4, note: "Transactional queries, indexing & partitions." }
    ],
    svgIllustration: (
      <svg className="w-full h-full text-[#5c1d1d]/15" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" />
        <line x1="50" y1="15" x2="50" y2="95" />
        <line x1="15" y1="35" x2="85" y2="35" />
        <line x1="15" y1="75" x2="85" y2="75" />
        <circle cx="50" cy="55" r="15" strokeWidth="2" />
      </svg>
    )
  },
  {
    title: "Principles of Intelligence",
    spineTitle: "COGNITIVE MACHINES",
    volume: "VOL. II",
    coverColor: "bg-[#0f4c3a] hover:bg-[#135d47]", // deep forest green
    textColor: "text-[#d1fae5]",
    spineColor: "border-[#0a3327]",
    ribbonColor: "bg-emerald-400",
    fileName: "INTELLIGENCE",
    height: "h-[87%]",
    width: "w-13 md:w-15",
    tilt: "-rotate-[1.5deg]",
    items: [
      { name: "PyTorch Framework", level: 5, note: "Training deep networks, tensors manipulation & backprop." },
      { name: "TensorFlow Engine", level: 4, note: "Graph optimizations, model frozen models & production serving." },
      { name: "Machine Learning Math", level: 5, note: "Linear algebra, tree classification & gradient sweeps." },
      { name: "Generative AI Architectures", level: 5, note: "Custom Genkit pipelines, Gemini API & transformer vectors." }
    ],
    svgIllustration: (
      <svg className="w-full h-full text-[#0f4c3a]/15" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="50" cy="25" r="8"/>
        <circle cx="25" cy="55" r="8"/>
        <circle cx="75" cy="55" r="8"/>
        <circle cx="50" cy="85" r="8"/>
        <line x1="50" y1="33" x2="25" y2="47"/>
        <line x1="50" y1="33" x2="75" y2="47"/>
        <line x1="25" y1="63" x2="50" y2="77"/>
        <line x1="75" y1="63" x2="50" y2="77"/>
        <circle cx="50" cy="55" r="5" fill="currentColor"/>
      </svg>
    )
  },
  {
    title: "Architectures of the Web",
    spineTitle: "DISTRIBUTED WEBS",
    volume: "VOL. III",
    coverColor: "bg-[#78350f] hover:bg-[#92400e]", // rich amber/brown
    textColor: "text-[#fef3c7]",
    spineColor: "border-[#451e06]",
    ribbonColor: "bg-yellow-500",
    fileName: "WEB_ARCHITECTURE",
    height: "h-[95%]",
    width: "w-12 md:w-14",
    tilt: "rotate-0",
    items: [
      { name: "React / Next.js Frameworks", level: 5, note: "Server Actions, Turbopack compiling & state models." },
      { name: "Node.js Core Systems", level: 5, note: "Asynchronous runtime loops & thread pooling." },
      { name: "Socket.IO Protocols", level: 4, note: "Real-time bi-directional sockets & event streams." },
      { name: "Aesthetics (CSS/Framer)", level: 5, note: "Micro-animations, UI transitions & layout metrics." }
    ],
    svgIllustration: (
      <svg className="w-full h-full text-[#78350f]/15" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="15" y="20" width="70" height="60" rx="4" />
        <line x1="15" y1="35" x2="85" y2="35" />
        <circle cx="25" cy="27.5" r="2" fill="currentColor" />
        <circle cx="35" cy="27.5" r="2" fill="currentColor" />
        <circle cx="45" cy="27.5" r="2" fill="currentColor" />
        <line x1="30" y1="50" x2="70" y2="50" />
        <line x1="30" y1="65" x2="60" y2="65" />
      </svg>
    )
  },
  {
    title: "Storage Engine Internals",
    spineTitle: "STORAGE INTERNALS",
    volume: "VOL. IV",
    coverColor: "bg-[#1e3a8a] hover:bg-[#1e40af]", // cobalt blue leather
    textColor: "text-[#dbeafe]",
    spineColor: "border-[#172554]",
    ribbonColor: "bg-blue-400",
    fileName: "STORAGE",
    height: "h-[89%]",
    width: "w-13 md:w-15",
    tilt: "rotate-[1deg]",
    items: [
      { name: "PostgreSQL Config", level: 5, note: "Query optimization, indexing depth, vacuum & connection pools." },
      { name: "MongoDB Schema", level: 4, note: "Document aggregation Pipelines, index optimizations & replication shards." },
      { name: "AWS S3 / DynamoDB", level: 4, note: "Partition keys structure, file storage & throughput provisions." },
      { name: "Redis Caching Layers", level: 5, note: "Key-value pipelines, eviction structures & pub-sub streams." }
    ],
    svgIllustration: (
      <svg className="w-full h-full text-[#1e3a8a]/15" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="20" y="15" width="60" height="20" rx="2" />
        <rect x="20" y="40" width="60" height="20" rx="2" />
        <rect x="20" y="65" width="60" height="20" rx="2" />
        <circle cx="30" cy="25" r="2.5" fill="currentColor" />
        <circle cx="30" cy="50" r="2.5" fill="currentColor" />
        <circle cx="30" cy="75" r="2.5" fill="currentColor" />
        <line x1="45" y1="25" x2="70" y2="25" />
        <line x1="45" y1="50" x2="70" y2="50" />
        <line x1="45" y1="75" x2="70" y2="75" />
      </svg>
    )
  },
  {
    title: "System Pipelines & MLOps",
    spineTitle: "SYSTEMS & PIPELINES",
    volume: "VOL. V",
    coverColor: "bg-[#374151] hover:bg-[#4b5563]", // charcoal grey
    textColor: "text-[#f3f4f6]",
    spineColor: "border-[#1f2937]",
    ribbonColor: "bg-gray-400",
    fileName: "SYSTEMS",
    height: "h-[94%]",
    width: "w-12 md:w-14",
    tilt: "-rotate-[0.5deg]",
    items: [
      { name: "Docker Containerization", level: 5, note: "Multi-stage builds, image layers caching & system overlays." },
      { name: "CI / CD Pipelines", level: 4, note: "GitHub Actions workflow scripting & deployment triggers." },
      { name: "Cloud Architecture", level: 4, note: "AWS, Vercel edge configs, and serverless runtime systems." },
      { name: "Linux Bash Scripting", level: 5, note: "Process telemetry, background daemons & logs filtration." }
    ],
    svgIllustration: (
      <svg className="w-full h-full text-[#374151]/15" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="15" y="30" width="25" height="40" rx="2" />
        <rect x="60" y="30" width="25" height="40" rx="2" />
        <path d="M40,50 L60,50" />
        <polyline points="53,44 60,50 53,56" />
        <polyline points="30,26 50,37 70,26" />
      </svg>
    )
  }
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mobileOpenIdx, setMobileOpenIdx] = useState<number | null>(0);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLightMode(document.documentElement.classList.contains("light"));
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            setIsLightMode(document.documentElement.classList.contains("light"));
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  // GSAP Entrance
  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;

    gsap.from(".cyber-window-skills", {
      opacity: 0,
      y: 50,
      scale: 0.96,
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

  const getCategoryIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      case 1:
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
          </svg>
        );
      case 2:
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        );
      case 3:
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
          </svg>
        );
      case 4:
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getExperienceLabel = (level: number) => {
    if (level >= 5) return "SENIOR";
    if (level === 4) return "PRO";
    return "CORE";
  };

  return (
    <section ref={sectionRef} id="skills" className="relative py-12 overflow-hidden border-b border-signal/15">
      <div className="absolute inset-0 grid-dots opacity-20 pointer-events-none" />

      <div className="section-container relative z-10">
        <p className="section-label" data-cursor-magnetic>Skills</p>
        <SplitTextReveal text="Knowledge Library." className="font-display font-semibold text-5xl md:text-6xl mb-16" />

        {/* WORKSPACE CASE CONSOLE */}
        <div className={`cyber-window cyber-window-skills w-full border border-subtle transition-colors duration-300 relative backdrop-blur-xl rounded-2xl
          ${isLightMode 
            ? "bg-[#fafafa]/35 shadow-[0_30px_60px_rgba(0,0,0,0.06)]" 
            : "bg-[#09090b]/35 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          }
        `}>
          {/* Decorative Terminal Header */}
          <div className="window-header flex items-center justify-between px-6 py-4 border-b border-subtle">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-signal/80 animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-ink/60">
                LIBRARIAN_CONSOL_V1.9 // KNOWLEDGE_BASE
              </span>
            </div>
            <div className="font-mono text-[8px] text-ink/40 tracking-wider">
              VOL_SELECTED // READ_ACTIVE
            </div>
          </div>

          {/* DUAL VIEWPORTS LAYOUT RENDERER */}
          
          {/* 1. DESKTOP WORKSPACE LAYOUT (Visible on md and up) */}
          <div className="hidden md:flex w-full p-6 bg-surface/5 flex-row gap-6">
            
            {/* LEFT SIDEBAR: CATEGORY NAVIGATION */}
            <div className="w-1/4 flex flex-col gap-2 border-r border-subtle pr-4">
              {BOOKS_DATA.map((book, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`w-full text-left font-mono text-xs px-3.5 py-2.5 rounded-lg border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none
                    ${activeIdx === i
                      ? (isLightMode 
                          ? "bg-[#0033aa] border-[#0033aa] text-white font-extrabold shadow-md shadow-[#0033aa]/10" 
                          : "bg-signal border-signal text-[#000000] font-black shadow-lg shadow-signal/15"
                        )
                      : (isLightMode 
                          ? "bg-white/80 border-black/5 hover:bg-zinc-100/80 text-zinc-600" 
                          : "bg-zinc-950/20 border-zinc-800 hover:bg-zinc-900/30 text-zinc-400"
                        )
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="opacity-75">{getCategoryIcon(i)}</span>
                    <span className="tracking-wider">{book.spineTitle}</span>
                  </div>
                  <span className="text-[8px] opacity-50">{book.volume}</span>
                </button>
              ))}
            </div>

            {/* RIGHT PANEL: SELECTED CATEGORY READOUT */}
            <div className="flex-grow text-left select-none">
              <div 
                className={`border rounded-lg p-5 font-mono transition-colors duration-300 min-h-[300px] flex flex-col justify-between
                  ${isLightMode 
                    ? "bg-white/40 border-black/5 shadow-sm text-zinc-900" 
                    : "bg-[#0c0c0e]/30 border-zinc-800 shadow-md text-white"
                  }
                `}
              >
                <div>
                  <div className={`text-[10px] font-bold uppercase mb-4 pb-2 border-b tracking-wider flex justify-between items-center
                    ${isLightMode ? "text-[#0033aa] border-black/5" : "text-signal border-white/5"}
                  `}>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isLightMode ? "bg-[#0033aa]" : "bg-signal"} animate-pulse`} />
                      <span>[ SYSTEM MODULE_0{activeIdx + 1} // {BOOKS_DATA[activeIdx].title} ]</span>
                    </div>
                    <span className={`text-[8px] font-bold ${isLightMode ? "text-zinc-400" : "text-white/30"}`}>{BOOKS_DATA[activeIdx].volume}</span>
                  </div>

                  <p className={`text-[10px] leading-relaxed mb-5 ${isLightMode ? "text-zinc-500" : "text-white/50"}`}>
                    Technical registry of {BOOKS_DATA[activeIdx].title.toLowerCase()} and operational runtime architectures compiled during production.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {BOOKS_DATA[activeIdx].items.map((skill, idx) => (
                      <div key={idx} className="space-y-1.5 border border-dashed rounded p-3 border-subtle transition-all duration-300 hover:border-signal/30 dark:hover:border-signal/45">
                        <div className="flex items-center justify-between text-xs font-bold text-ink">
                          <span className="tracking-tight">{skill.name}</span>
                          <span className={`text-[8.5px] font-mono tracking-wider
                            ${isLightMode ? "text-[#0033aa]/90" : "text-signal/90"}
                          `}>
                            {getExperienceLabel(skill.level)} // {skill.level * 20}%
                          </span>
                        </div>
                        
                        {/* Visual Segmented LED Progress Indicator */}
                        <div className="flex gap-[3.5px] py-1">
                          {[...Array(10)].map((_, step) => {
                            const isLit = step < skill.level * 2;
                            return (
                              <div 
                                key={step} 
                                className={`h-1.5 flex-1 rounded-[1px] transition-all duration-500
                                  ${isLit 
                                    ? (isLightMode 
                                        ? "bg-[#0033aa]" 
                                        : "bg-signal shadow-[0_0_5px_rgba(240,160,0,0.5)]"
                                      ) 
                                    : (isLightMode 
                                        ? "bg-black/10" 
                                        : "bg-zinc-800"
                                      )
                                  }
                                `}
                              />
                            );
                          })}
                        </div>

                        <p className="text-[9px] text-ink/50 pl-1 leading-relaxed">
                          - {skill.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plaque under panel */}
                <div className={`border-t pt-4 mt-6 flex items-center justify-between text-[8.5px] font-bold uppercase ${isLightMode ? "border-black/5 text-zinc-400" : "border-white/5 text-white/30"}`}>
                  <span>VERIFIED_OK // CHECKSUM_VALID</span>
                  <span>Dhuvie Knowledge Archives // Directory Edition</span>
                </div>
              </div>
            </div>

          </div>

          {/* 2. MOBILE ACCORDION LAYOUT (Visible on mobile under md) */}
          <div className="flex md:hidden flex-col gap-3 p-4">
            {BOOKS_DATA.map((book, i) => {
              const isOpen = mobileOpenIdx === i;
              return (
                <div 
                  key={i} 
                  className={`border rounded-xl overflow-hidden transition-all duration-350
                    ${isOpen 
                      ? (isLightMode ? "border-[#0033aa]/25 bg-white/60 shadow-sm" : "border-signal/25 bg-[#0c0c0e]/50 shadow-md") 
                      : (isLightMode ? "border-black/5 bg-white/20" : "border-zinc-800 bg-[#0c0c0e]/15")
                    }
                  `}
                >
                  {/* Folder Accordion Trigger Header */}
                  <button
                    type="button"
                    onClick={() => setMobileOpenIdx(isOpen ? null : i)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left font-mono text-xs cursor-pointer select-none active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`transition-colors duration-200 ${isOpen ? (isLightMode ? "text-[#0033aa]" : "text-signal") : "opacity-60"}`}>
                        {getCategoryIcon(i)}
                      </span>
                      <div>
                        <span className="opacity-50 text-[10px] mr-1">0{i + 1}.</span>
                        <span className="font-bold tracking-tight text-ink">{book.spineTitle}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[7.5px] opacity-40 font-bold">{book.volume}</span>
                      {/* Interactive Chevron Rotate */}
                      <svg 
                        className={`w-3.5 h-3.5 transition-transform duration-300 opacity-60 ${isOpen ? "rotate-180" : ""}`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Folder Drawer */}
                  <div 
                    className={`transition-all duration-350 overflow-hidden font-mono
                      ${isOpen ? "max-h-[800px] border-t border-subtle" : "max-h-0"}
                    `}
                  >
                    <div className="p-4 space-y-4 text-left">
                      <p className={`text-[10px] leading-relaxed ${isLightMode ? "text-zinc-500" : "text-white/50"}`}>
                        Technical registry of {book.title.toLowerCase()} and operational runtime architectures compiled during production.
                      </p>

                      <div className="space-y-3">
                        {book.items.map((skill, idx) => (
                          <div key={idx} className="space-y-1.5 border border-dashed rounded p-3 border-subtle">
                            <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                              <span>{skill.name}</span>
                              <span className={`text-[9px] font-mono
                                ${isLightMode ? "text-[#0033aa]/90" : "text-signal/90"}
                              `}>
                                {getExperienceLabel(skill.level)} // {skill.level * 20}%
                              </span>
                            </div>
                            
                            {/* Segmented LED Indicators */}
                            <div className="flex gap-[3.5px] py-1">
                              {[...Array(10)].map((_, step) => {
                                const isLit = step < skill.level * 2;
                                return (
                                  <div 
                                    key={step} 
                                    className={`h-1.5 flex-1 rounded-[1px] transition-all duration-500
                                      ${isLit 
                                        ? (isLightMode 
                                            ? "bg-[#0033aa]" 
                                            : "bg-signal shadow-[0_0_5px_rgba(240,160,0,0.5)]"
                                          ) 
                                        : (isLightMode 
                                            ? "bg-black/10" 
                                            : "bg-zinc-800"
                                          )
                                      }
                                    `}
                                  />
                                );
                              })}
                            </div>

                            <p className="text-[9px] text-ink/50 pl-1 leading-relaxed">
                              - {skill.note}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Small signature plate */}
                      <div className={`pt-2 border-t flex justify-between text-[7px] font-bold uppercase ${isLightMode ? "border-black/5 text-zinc-400" : "border-white/5 text-white/30"}`}>
                        <span>VERIFIED_OK</span>
                        <span>Knowledge Archives</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
