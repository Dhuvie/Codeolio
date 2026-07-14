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

          <div className="min-h-[520px] flex items-center justify-center p-6 bg-surface/5 relative">
            
            {(openBookIdx !== null || isClosing) && (
              <div 
                onClick={handleCloseBook}
                className="absolute inset-0 z-10 cursor-pointer bg-black/40 backdrop-blur-[1px] transition-all duration-500 animate-fade-in"
              />
            )}

            {openBookIdx === null && !isClosing ? (
              // 1. HIGH-FIDELITY SKEUOMORPHIC BOOKSHELF VIEW
              <div className="flex flex-col items-center justify-center w-full max-w-3xl mt-4 select-none">
                <span className="font-mono text-[9px] text-ink/40 uppercase tracking-widest mb-6">
                  Select a volume to study engineering registers
                </span>

                {isMobileShelf ? (
                  /* HIGH-DENSITY DEPLOYED SKILLS DIRECTORY FOR MOBILE DEVICES */
                  <div className="w-full flex flex-col gap-6 text-left select-none pointer-events-auto">
                    {BOOKS_DATA.map((book, i) => (
                      <div 
                        key={i}
                        className={`border rounded-lg p-5 font-mono transition-colors duration-300
                          ${isLightMode 
                            ? "bg-[#eef2f6] border-[#0c0c0e]/15 shadow-sm" 
                            : "bg-zinc-900/60 border-zinc-800 shadow-md"
                          }
                        `}
                      >
                        <div className={`text-xs font-bold uppercase mb-4 pb-1 border-b tracking-wider flex justify-between
                          ${isLightMode ? "text-[#0033aa] border-[#0033aa]/10" : "text-signal border-signal/15"}
                        `}>
                          <span>[ NODE 0{i + 1} // {book.spineTitle} ]</span>
                          <span className="text-[8px] opacity-55">{book.volume}</span>
                        </div>

                        <div className="space-y-5">
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
                ) : (
                  /* THE WOODEN/STEEL BOOKSHELF PLATFORM FOR DESKTOP */
                  <div className={`relative w-full max-w-2xl h-80 rounded-lg border-b-8 border-r-4 border-l-4 p-4 flex items-end justify-center gap-4 md:gap-6 shadow-xl
                    ${isLightMode 
                      ? "bg-[#efebe4] border-[#8b7355] shadow-[0_20px_40px_rgba(0,0,0,0.08)]" 
                      : "bg-[#18181b] border-[#3f3f46] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                    }
                  `}>
                    {/* Top inner shelf shadow depth */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.15)_0%,transparent_20%)] pointer-events-none" />

                    {BOOKS_DATA.map((book, i) => (
                      <div
                        key={i}
                        onClick={() => handleOpenBook(i)}
                        className={`relative ${book.height} ${book.width} ${book.tilt} ${book.coverColor} rounded-t border-t-2 border-r border-l shadow-[2px_-2px_10px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer group flex flex-col justify-between items-center py-6 px-1 md:px-2
                          ${book.spineColor}
                          hover:-translate-y-6 hover:shadow-[5px_-5px_18px_rgba(0,0,0,0.4)]
                        `}
                      >
                        {/* Spine Cylindrical Lighting Shading Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.35)_0%,rgba(255,255,255,0.05)_20%,rgba(255,255,255,0.05)_50%,rgba(0,0,0,0.45)_100%)] pointer-events-none rounded-t" />

                        {/* Spine Ribs (Raised bands) */}
                        <div className="absolute top-[18%] left-0 right-0 h-[2px] bg-black/45 border-b border-white/5 pointer-events-none" />
                        <div className="absolute top-[40%] left-0 right-0 h-[2px] bg-black/45 border-b border-white/5 pointer-events-none" />
                        <div className="absolute top-[62%] left-0 right-0 h-[2px] bg-black/45 border-b border-white/5 pointer-events-none" />
                        <div className="absolute top-[82%] left-0 right-0 h-[2px] bg-black/45 border-b border-white/5 pointer-events-none" />

                        {/* Gold Foil Scroll Ornaments */}
                        <div className="absolute top-2.5 left-1 right-1 h-1.5 border-t border-b border-amber-400/40 pointer-events-none" />
                        <div className="absolute bottom-2.5 left-1 right-1 h-1.5 border-t border-b border-amber-400/40 pointer-events-none" />

                        {/* Gold Book volume number */}
                        <div className={`font-serif text-[7px] md:text-[8px] font-bold tracking-widest text-center z-10 ${book.textColor}`}>
                          {book.volume}
                        </div>

                        {/* Title block banner inside spine */}
                        <div className="w-[85%] bg-black/30 border border-amber-400/20 rounded py-2 px-0.5 flex items-center justify-center z-10 shadow-inner">
                          <span 
                            className="font-serif text-[7px] md:text-[8px] font-bold tracking-widest uppercase text-center block text-amber-100/90 whitespace-nowrap"
                            style={{ writingMode: "vertical-rl" }}
                          >
                            {book.spineTitle}
                          </span>
                        </div>

                        {/* Bookmark Ribbon Hanging Out */}
                        <div className={`absolute bottom-0 w-2.5 h-6 rounded-b shadow ${book.ribbonColor} translate-y-3.5 group-hover:translate-y-4 transition-all z-10`} />

                        {/* Metadata label */}
                        <div className="border border-white/15 px-1 py-0.2 rounded-sm bg-black/35 z-10">
                          <span className="font-mono text-[6px] text-white/50">{book.fileName.slice(0, 3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Brass plaque under shelf */}
                <div className={`mt-8 px-5 py-1.5 border rounded-md font-mono text-[9px] uppercase tracking-widest
                  ${isLightMode ? "border-zinc-300 bg-white text-zinc-600" : "border-zinc-800 bg-zinc-900/60 text-zinc-400"}
                `}>
                  Dhuvie Knowledge Archives // Library Edition
                </div>
              </div>
            ) : (
              // 2. DETAILED OPEN BOOK LEDGER SKEUOMORPHIC PAGE VIEW (WITH CLOSE ANIMATION Support)
              <div className={`w-full max-w-4xl relative z-20 ${
                isClosing 
                  ? "animate-[scaleDownBook_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
                  : "animate-[scaleUpBook_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              }`}>
                
                {/* Back to Shelf HUD Instruction */}
                <span className="absolute -top-8 left-0 font-mono text-[9px] text-ink/40 uppercase tracking-widest pointer-events-none select-none">
                  [ Click outside to return volume to shelf ]
                </span>

                {/* The Hardback leather book spreads underneath */}
                <div className={`w-full rounded-2xl p-2.5 md:p-4 shadow-2xl relative border-4 border-zinc-950/80
                  ${activeBook.coverColor}
                `}>
                  
                  {/* Two Page Spread Paper (Ivory / Vintage ledger texture) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 bg-[#fcf9f2] rounded-lg overflow-hidden min-h-[440px] relative border border-black/15 shadow-[inset_0_0_40px_rgba(0,0,0,0.06)] text-zinc-900" style={{ perspective: "1500px" }}>
                    
                    {/* Left Page (Conceptual Sketches / Schematics) */}
                    <div className={`p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-300/60 flex flex-col justify-between relative min-h-[380px] origin-right transition-transform duration-[800ms] ease-out ${
                      isClosing 
                        ? "animate-[foldLeft_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
                        : "animate-[unfoldLeft_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                    }`}>
                      
                      {/* Left Page Header */}
                      <div className="border-b border-zinc-300/80 pb-3 flex justify-between items-end">
                        <span className="font-serif italic text-xs text-zinc-500 font-bold">{activeBook.volume}</span>
                        <span className="font-serif text-[10px] uppercase tracking-widest text-zinc-400">specifications</span>
                      </div>

                      {/* SVG Conceptual Sketch Grid (Skeuomorphic Blueprint) */}
                      <div className="flex-grow flex items-center justify-center my-6 relative min-h-[160px]">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          {activeBook.svgIllustration}
                        </div>
                        <div className="absolute bottom-2 font-mono text-[8px] text-zinc-400 uppercase tracking-widest text-center w-full">
                          Fig 1.1: System abstraction diagram
                        </div>
                      </div>

                      {/* Page description */}
                      <div className="font-serif text-xs leading-relaxed text-zinc-700 italic border-t border-zinc-200 pt-4">
                        This volume archives the operational technical registries, benchmarks, and architectural designs compiled during production.
                      </div>
                    </div>

                    {/* Book Central crease line shadows */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-[linear-gradient(90deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.18)_50%,rgba(0,0,0,0.05)_100%)] pointer-events-none z-10" />

                    {/* Right Page (Ledger Skills List) */}
                    <div className={`p-6 md:p-8 flex flex-col justify-between min-h-[380px] origin-left transition-transform duration-[800ms] ease-out ${
                      isClosing 
                        ? "animate-[foldRight_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
                        : "animate-[unfoldRight_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                    }`}>
                      
                      {/* Right Page Header */}
                      <div className="border-b border-zinc-300/80 pb-3 flex justify-between items-end">
                        <span className="font-serif text-[11px] font-bold text-zinc-800 uppercase tracking-wider">
                          {activeBook.title}
                        </span>
                        <span className="font-serif italic text-xs text-zinc-500">folio 42</span>
                      </div>

                      {/* Skill ledger elements */}
                      <div className="space-y-4 my-6">
                        {activeBook.items.map((skill, sIdx) => (
                          <div key={sIdx} className="space-y-1.5">
                            <div className="flex items-center justify-between font-serif">
                              <span className="font-bold text-zinc-850 text-xs">{skill.name}</span>
                              
                              {/* Ledger style checkbox metrics */}
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div
                                    key={star}
                                    className={`w-3.5 h-3.5 border border-zinc-400 rounded-sm flex items-center justify-center text-[8px] font-bold
                                      ${star <= skill.level 
                                        ? "bg-zinc-850 text-white border-zinc-900" 
                                        : "bg-transparent text-transparent"
                                      }
                                    `}
                                  >
                                    ✓
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p className="font-mono text-[9px] text-zinc-500 pl-2 leading-relaxed">
                              - {skill.note}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Hand-drawn ink marginal note */}
                      <div className="border-t border-zinc-200/80 pt-4 flex items-center justify-between">
                        <span className="font-mono text-[8px] text-zinc-400">ledger seal // verified</span>
                        <span className="font-handwritten text-xs text-blue-800 rotate-[-2deg] opacity-75">
                          Production deploy verified!
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
