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

          <div className="w-full p-6 bg-surface/5 relative pointer-events-auto flex flex-col md:flex-row gap-6">
            
            {/* LEFT SIDEBAR: CATEGORY NAVIGATION (Horizontal scroll on mobile, Vertical stack on desktop) */}
            <div className="w-full md:w-1/4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-subtle md:pr-4 scrollbar-none">
              {BOOKS_DATA.map((book, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`w-full text-left font-mono text-[10px] md:text-xs px-3.5 py-2.5 rounded-lg border transition-all duration-200 flex items-center justify-between whitespace-nowrap md:whitespace-normal cursor-pointer select-none
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
                    <span className="opacity-60">0{i + 1}.</span>
                    <span className="tracking-wider">{book.spineTitle}</span>
                  </div>
                  <span className="text-[8px] opacity-50 hidden md:inline">{book.volume}</span>
                </button>
              ))}
            </div>

            {/* RIGHT PANEL: SELECTED CATEGORY TELEMETRY READOUT */}
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
                      <div key={idx} className="space-y-1.5 border border-dashed rounded p-3 border-subtle">
                        <div className="flex items-center justify-between text-xs font-bold text-ink">
                          <span>{skill.name}</span>
                          <span className={`text-[9px] font-mono
                            ${isLightMode ? "text-[#c07000]" : "text-signal/90"}
                          `}>
                            LEVEL_{skill.level * 20}%
                          </span>
                        </div>
                        
                        {/* Visual Level Progress Bar */}
                        <div className={`w-full h-1 rounded-full overflow-hidden
                          ${isLightMode ? "bg-black/10" : "bg-zinc-800"}
                        `}>
                          <div 
                            className={`h-full rounded-full transition-all duration-500
                              ${isLightMode ? "bg-[#0033aa]" : "bg-signal"}
                            `}
                            style={{ width: `${skill.level * 20}%` }}
                          />
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
        </div>
      </div>
    </section>
  );
}
