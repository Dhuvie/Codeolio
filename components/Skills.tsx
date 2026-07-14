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
  const [openBookIdx, setOpenBookIdx] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const lastOpenedBookIdxRef = useRef<number>(0);

  // Mobile swipeable shelf states
  const [isMobileShelf, setIsMobileShelf] = useState(false);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(2);
  const [shelfDragOffset, setShelfDragOffset] = useState(0);
  const [isDraggingShelf, setIsDraggingShelf] = useState(false);

  const shelfDragStart = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobileShelf(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShelfPointerDown = (e: React.PointerEvent) => {
    shelfDragStart.current = e.clientX;
    setIsDraggingShelf(true);
    setShelfDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleShelfPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingShelf) return;
    const dx = e.clientX - shelfDragStart.current;
    setShelfDragOffset(dx);
  };

  const handleShelfPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingShelf) return;
    setIsDraggingShelf(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const dx = e.clientX - shelfDragStart.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) {
        setMobileActiveIdx((prev) => Math.min(BOOKS_DATA.length - 1, prev + 1));
      } else {
        setMobileActiveIdx((prev) => Math.max(0, prev - 1));
      }
    } else {
      if (Math.abs(dx) < 8) {
        handleOpenBook(mobileActiveIdx);
      }
    }
    setShelfDragOffset(0);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleLeft = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "skills") {
        setMobileActiveIdx((prev) => Math.max(0, prev - 1));
      }
    };
    const handleRight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "skills") {
        setMobileActiveIdx((prev) => Math.min(BOOKS_DATA.length - 1, prev + 1));
      }
    };
    const handleButtonA = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "skills") {
        if (openBookIdx === null) {
          handleOpenBook(mobileActiveIdx);
        }
      }
    };
    const handleButtonB = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "skills") {
        if (openBookIdx !== null) {
          handleCloseBook();
        }
      }
    };

    window.addEventListener("mobile-dpad-left", handleLeft);
    window.addEventListener("mobile-dpad-right", handleRight);
    window.addEventListener("mobile-button-a", handleButtonA);
    window.addEventListener("mobile-button-b", handleButtonB);

    return () => {
      window.removeEventListener("mobile-dpad-left", handleLeft);
      window.removeEventListener("mobile-dpad-right", handleRight);
      window.removeEventListener("mobile-button-a", handleButtonA);
      window.removeEventListener("mobile-button-b", handleButtonB);
    };
  }, [openBookIdx, mobileActiveIdx]);

  // Keep track of the last opened book index so that the text content
  // remains rendered and readable during the exit/close animation.
  useEffect(() => {
    if (openBookIdx !== null) {
      lastOpenedBookIdxRef.current = openBookIdx;
    }
  }, [openBookIdx]);

  // Sync theme
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

  // Procedural audio synthesizer for paper book flipping
  const playPaperSound = (type: "open" | "close") => {
    if (typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.35;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate custom white noise values
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;

      const lowpassFilter = audioCtx.createBiquadFilter();
      lowpassFilter.type = "lowpass";

      if (type === "open") {
        lowpassFilter.frequency.setValueAtTime(550, audioCtx.currentTime);
        lowpassFilter.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.25);
      } else {
        lowpassFilter.frequency.setValueAtTime(950, audioCtx.currentTime);
        lowpassFilter.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.2);
      }

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);

      noiseSource.connect(lowpassFilter);
      lowpassFilter.connect(gain);
      gain.connect(audioCtx.destination);
      
      noiseSource.start();
    } catch (err) {
      // Audio contexts blocked by security
    }
  };

  const handleOpenBook = (idx: number) => {
    playPaperSound("open");
    setOpenBookIdx(idx);
  };

  const handleCloseBook = () => {
    playPaperSound("close");
    setIsClosing(true);
    setTimeout(() => {
      setOpenBookIdx(null);
      setIsClosing(false);
    }, 600); // 600ms matches the closing transition duration
  };

  const activeBookIdx = openBookIdx !== null ? openBookIdx : lastOpenedBookIdxRef.current;
  const activeBook = BOOKS_DATA[activeBookIdx];

  return (
    <section ref={sectionRef} id="skills" className="relative py-12 overflow-hidden border-b border-signal/15">
      <div className="absolute inset-0 grid-dots opacity-20 pointer-events-none" />

      <div className="section-container relative z-10">
        <p className="section-label" data-cursor-magnetic>Skills</p>
        <SplitTextReveal text="Knowledge Library." className="font-display font-semibold text-5xl md:text-6xl mb-16" />

        {/* WORKSPACE CASE CONSOLE */}
        <div className={`cyber-window cyber-window-skills w-full border border-subtle transition-colors duration-300 relative
          ${isLightMode 
            ? "bg-[#fafafa]/90 shadow-[0_30px_60px_rgba(0,0,0,0.06)]" 
            : "bg-[#09090b]/80 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
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
              {openBookIdx !== null ? "VOL_OPEN // READING" : "VOL_CLOSED // SHELF"}
            </div>
          </div>

          <div className="w-full p-6 bg-surface/5 relative pointer-events-auto">
            {/* GRID DIRECTORY SHOWCASE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left select-none">
              {BOOKS_DATA.map((book, i) => (
                <div 
                  key={i}
                  className={`border rounded-lg p-5 font-mono transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:hover:scale-[1.01]
                    ${isLightMode 
                      ? "bg-[#ffffff] border-[#0c0c0e]/10 shadow-sm" 
                      : "bg-[#0c0c0e]/60 border-zinc-800 shadow-md"
                    }
                  `}
                >
                  <div className={`text-xs font-bold uppercase mb-4 pb-2 border-b tracking-wider flex justify-between items-center
                    ${isLightMode ? "text-[#0033aa] border-black/5" : "text-signal border-white/5"}
                  `}>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isLightMode ? "bg-[#0033aa]" : "bg-signal"} animate-pulse`} />
                      <span>[ MODULE_0{i + 1} // {book.spineTitle} ]</span>
                    </div>
                    <span className={`text-[8px] font-bold ${isLightMode ? "text-zinc-400" : "text-white/30"}`}>{book.volume}</span>
                  </div>

                  <p className={`text-[10px] leading-relaxed mb-4 min-h-[40px] ${isLightMode ? "text-zinc-500" : "text-white/50"}`}>
                    Technical registry of {book.title.toLowerCase()} and operational runtime architectures compiled during production.
                  </p>

                  <div className="space-y-4">
                    {book.items.map((skill, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-ink">
                          <span>{skill.name}</span>
                          <span className={`text-[9px] font-mono
                            ${isLightMode ? "text-[#c07000]" : "text-signal/90"}
                          `}>
                            LEVEL_{skill.level * 20}%
                          </span>
                        </div>
                        
                        {/* Visual Level Progress Bar */}
                        <div className={`w-full h-1.5 rounded-full overflow-hidden
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
              ))}
            </div>

            {/* Plaque under grid */}
            <div className="flex justify-center mt-8">
              <div className={`px-5 py-1.5 border rounded-md font-mono text-[9px] uppercase tracking-widest
                ${isLightMode ? "border-zinc-300 bg-white text-zinc-600" : "border-zinc-800 bg-zinc-900/60 text-zinc-400"}
              `}>
                Dhuvie Knowledge Archives // Directory Edition
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
