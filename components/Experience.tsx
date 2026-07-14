"use client";

import { useRef, useState, useEffect } from "react";
import SplitTextReveal from "./SplitTextReveal";

interface JobDossier {
  id: number;
  company: string;
  role: string;
  period: string;
  stamp: string;
  stampColor: string;
  color: string;
  initialX: number;
  initialY: number;
  initialRot: number;
  bullets: string[];
  tech: string[];
}

const DOSSIERS: JobDossier[] = [
  {
    id: 0,
    company: "Cart-esthetic",
    role: "Freelance UI Developer",
    period: "Jun 2024 – Sep 2024",
    stamp: "RELEASED",
    stampColor: "border-red-600 text-red-600",
    color: "#d4af37",
    initialX: 80,
    initialY: 90,
    initialRot: -6,
    bullets: [
      "Engineered 25+ animated React components with Framer Motion across product listing, cart, and checkout flows for a fashion e-commerce brand",
      "Built a sticky checkout panel with form auto-save and session-persistent cart state, reducing cart abandonment an estimated 15–20% per client feedback",
      "Improved Lighthouse performance score from 67 to 89 via lazy loading, route-level code splitting, and next/image optimization",
    ],
    tech: ["React", "Framer Motion", "Next.js", "TypeScript"],
  },
  {
    id: 1,
    company: "Promptgram",
    role: "Freelance Full-Stack Developer",
    period: "Oct 2024 – Apr 2025",
    stamp: "ARCHIVED",
    stampColor: "border-emerald-600 text-emerald-600",
    color: "#00ffcc",
    initialX: 340,
    initialY: 60,
    initialRot: 4,
    bullets: [
      "Built a prompt-to-image social platform (Next.js, Node.js, PostgreSQL) that processed 800+ AI generations in its first month",
      "Integrated Cloudflare CDN with a Redis caching layer, cutting median page load from 4.2s to 1.8s on 3G and server response time by 38%",
      "Implemented JWT auth via NextAuth.js, role-based access control, and AWS S3 presigned URL storage for secure user-generated content",
    ],
    tech: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Cloudflare"],
  },
  {
    id: 2,
    company: "Future Lab",
    role: "Next-Gen AI Systems Intern",
    period: "Present",
    stamp: "CLASSIFIED",
    stampColor: "border-amber-600 text-amber-600",
    color: "#f0a000",
    initialX: 600,
    initialY: 100,
    initialRot: -2,
    bullets: [
      "Currently researching TinyML adaptive quantization techniques and building automated LangGraph agent workflow simulations.",
      "Developing high-performance GPU WebGL visualizers and interactive spatial math modules for developer portfolios."
    ],
    tech: ["LangGraph", "TensorFlow Lite", "WebGL", "Rust", "Gemini 2.5"],
  }
];

export default function Experience() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [positions, setPositions] = useState<{ [key: number]: { x: number; y: number; rot: number } }>({});
  const [draggingId, setDraggingId] = useState<number | null>(null);
  
  const pointerStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef({ x: 0, y: 0, rot: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  const deskRef = useRef<HTMLDivElement>(null);
  const [deskWidth, setDeskWidth] = useState(1000);

  // ResizeObserver to track container width for responsive scaling
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDeskWidth(entry.contentRect.width);
      }
    });
    if (deskRef.current) {
      observer.observe(deskRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Initialize Dossier Coordinates on Mount
  useEffect(() => {
    const posMap: { [key: number]: { x: number; y: number; rot: number } } = {};
    DOSSIERS.forEach((d) => {
      posMap[d.id] = { x: d.initialX, y: d.initialY, rot: d.initialRot };
    });
    setPositions(posMap);
  }, []);

  // Pointer drag triggers (mouse + touch safe)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: number) => {
    if (activeId !== null || deskWidth < 850) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);

    pointerStart.current = { x: e.clientX, y: e.clientY };
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    elementStart.current = { 
      x: positions[id]?.x || 0, 
      y: positions[id]?.y || 0,
      rot: positions[id]?.rot || 0
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId === null || deskWidth < 850) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    
    // Dynamic rotation angle based on drag velocity
    const velocityX = e.clientX - lastMousePos.current.x;
    const dragTilt = velocityX * 0.4;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setPositions((prev) => ({
      ...prev,
      [draggingId]: {
        x: Math.max(20, Math.min(elementStart.current.x + dx, deskWidth - 240)),
        y: Math.max(20, Math.min(elementStart.current.y + dy, 280)),
        rot: elementStart.current.rot * 0.8 + dragTilt * 0.2
      }
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId === null || deskWidth < 850) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Settle back to natural rotation
    const settledRot = DOSSIERS.find((d) => d.id === draggingId)?.initialRot || 0;
    setPositions((prev) => ({
      ...prev,
      [draggingId]: {
        ...prev[draggingId],
        rot: settledRot
      }
    }));
    setDraggingId(null);
  };

  const openFolder = (id: number) => {
    if (draggingId !== null) return;
    setActiveId(id);
  };

  const closeFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveId(null);
  };

  const isMobileDesk = deskWidth < 850;

  return (
    <section 
      id="experience" 
      className="relative w-full min-h-screen bg-transparent py-32 border-b border-signal/15 select-none"
    >
      {/* Blueprint grid desktop background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <div className="section-container relative z-10 w-full">
        
        <div className="mb-16">
          <p className="font-mono text-sm text-signal tracking-[0.5em] uppercase mb-4">
            {"// Tactical Operations Desk"}
          </p>
          <SplitTextReveal text="Work Experience." className="font-display font-semibold text-5xl md:text-7xl text-white" />
        </div>

        {/* Top-down physical desk container */}
        <div 
          ref={deskRef}
          className={`relative w-full border border-white/10 bg-[#0d0d11] rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_0_80px_rgba(0,0,0,0.7)] p-6 transition-all duration-300 ${
            isMobileDesk && activeId === null ? "h-auto min-h-[500px] pb-12" : "h-[620px]"
          }`}
        >
          <div className="absolute top-4 left-6 font-mono text-[9px] text-white/20 uppercase tracking-widest pointer-events-none z-10">
            DHOVIE_WORKSPACE // CLASSIFIED FILES {isMobileDesk ? "" : "(POINTER DRAGGABLE)"}
          </div>

          {/* Decorative Coffee Cup Ring Stain */}
          <div className="absolute bottom-12 left-16 w-32 h-32 rounded-full border border-yellow-800/10 pointer-events-none select-none z-0">
            <div className="absolute inset-2 rounded-full border border-yellow-800/5" />
          </div>

          {/* DUAL RENDER FLOW: RESPONSIVE GRID FOR TABLET/MOBILE VS ABSOLUTE VIEW FOR DESKTOP */}
          {isMobileDesk ? (
            activeId === null ? (
              /* RESPONSIVE LAYOUT FOR CLOSED DOSSIERS */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full pt-12 px-4 justify-items-center z-10 relative">
                {DOSSIERS.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => openFolder(d.id)}
                    className="w-56 h-72 border border-[#d2ab5b]/35 bg-gradient-to-br from-[#e6c280] to-[#cba355] shadow-[0_15px_30px_rgba(0,0,0,0.5)] cursor-pointer rounded-md p-6 flex flex-col justify-between overflow-hidden hover:scale-105 transition-all duration-300"
                  >
                    {/* CLOSED KRAFT PAPER MANILA COVER */}
                    <div className="flex flex-col justify-between h-full font-mono text-[#4a3416] select-none pointer-events-none relative">
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#b38f45] to-[#cba355] border-r border-[#a8823b] -ml-6 -my-6 rounded-l" />
                      <div className="absolute left-2 right-2 top-1/4 h-[1px] bg-[#dfb96c] opacity-60" />
                      <div className="absolute left-2 right-2 top-3/4 h-[1px] bg-[#dfb96c] opacity-60" />
                      
                      <div className="absolute bottom-12 right-0 w-16 h-16 rounded-full border border-[#4a3416]/12 flex items-center justify-center opacity-30 rotate-[22deg]">
                        <span className="font-mono text-[6px] text-center uppercase tracking-widest font-black leading-none text-[#4a3416]/50">
                          DEPT<br/>OF<br/>SYS
                        </span>
                      </div>

                      <div>
                        <div className="w-16 h-4 bg-[#e6c280] rounded-t border-t border-x border-[#cba355] -mt-5 -ml-1 flex items-center justify-center relative">
                          <span className="text-[7px] text-[#4a3416]/50 font-bold">FILE_{d.id + 1}</span>
                          <div className="absolute -top-1 right-2 w-[8px] h-[20px] border border-[#a6a6af] rounded-full opacity-80 rotate-[15deg]" />
                        </div>
                        <div className="w-full h-[1px] bg-[#cba355] mb-4" />
                        
                        <span className="text-[8px] text-[#3d2910]/60 tracking-widest uppercase block mb-1 font-bold">
                          REGISTRY DOSSIER
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-tight uppercase leading-snug drop-shadow-sm">
                          {d.company}
                        </h4>
                      </div>

                      <div className="border-t border-[#cba355] pt-3 flex items-center justify-between text-[9px] font-bold">
                        <span className="text-[#3b270a]">{d.period.split(" ")[0]}</span>
                        <span className="text-[#4a3416]/60 tracking-wider">[DECRYPT]</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* RESPONSIVE LAYOUT FOR SINGLE OPENED DOSSIER */
              <div className="w-full h-full flex items-center justify-center pt-8">
                {(() => {
                  const activeDossier = DOSSIERS.find((d) => d.id === activeId)!;
                  return (
                    <div className="w-full max-w-[800px] min-h-[480px] bg-[#faf8f5] border border-[#dfdbd3] shadow-[0_35px_80px_rgba(0,0,0,0.85)] rounded-md p-5 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex flex-col justify-between h-full relative z-10 font-sans text-black pl-5">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-600/20 pointer-events-none" />
                        
                        <div className="absolute -top-3 left-8 w-[18px] h-[45px] border-2 border-[#a6a6af] rounded-full opacity-90 rotate-[-12deg] pointer-events-none z-20 shadow-[1px_2px_4px_rgba(0,0,0,0.25)] flex justify-center items-center">
                          <div className="w-[10px] h-[34px] border border-[#b4b4bc] rounded-full" />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-black/15 pb-4 gap-4">
                          <div>
                            <span className="font-mono text-[9px] text-red-600 font-bold uppercase tracking-widest block mb-1">
                              SECURITY_LEVEL: TOP_SECRET // REGISTRY_{activeDossier.period.replace(/[\s–]/g, "_")}
                            </span>
                            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1e1e24] uppercase tracking-tighter leading-none mb-1">
                              {activeDossier.company}
                            </h3>
                            <h4 className="font-mono text-xs text-black/60 font-bold tracking-widest uppercase">
                              {activeDossier.role}
                            </h4>
                          </div>

                          <div className="flex items-center gap-4 ml-auto sm:ml-0">
                            <div className="flex flex-col items-end border-l-2 border-dashed border-black/15 pl-4">
                              <div className="w-12 h-4 bg-white border border-black/20 flex items-stretch gap-[1.5px] p-[2.5px]">
                                <div className="bg-black w-[3px]" />
                                <div className="bg-black w-[1px]" />
                                <div className="bg-black w-[2px]" />
                                <div className="bg-black w-[4px]" />
                                <div className="bg-black w-[1px]" />
                                <div className="bg-black w-[3px]" />
                              </div>
                              <span className="font-mono text-[6px] text-black/40 mt-[2px] font-bold">INV-{8192 + activeDossier.id}A</span>
                            </div>
                            <button 
                              onClick={closeFolder}
                              className="font-mono text-xs text-black border border-black/35 bg-black/5 px-4 py-2 rounded hover:bg-black/15 transition-all cursor-pointer shadow-[0_2px_5px_rgba(0,0,0,0.06)]"
                            >
                              [ CLOSE ]
                            </button>
                          </div>
                        </div>

                        <div className="flex-grow py-6 space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                          {activeDossier.bullets.map((bullet, idx) => (
                            <div key={idx} className="flex gap-3">
                              <span className="text-red-600 font-bold font-mono text-sm select-none">&gt;&gt;</span>
                              <p className="text-[#2c2c35] leading-relaxed text-xs md:text-sm font-medium tracking-wide">
                                {bullet}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-black/15 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex flex-wrap gap-2">
                            {activeDossier.tech.map((t) => (
                              <span 
                                key={t}
                                className="font-mono text-[9px] uppercase text-[#1e1e24] border border-black/20 rounded px-2.5 py-1 bg-black/5 font-bold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <span className={`font-mono text-xs font-black tracking-[0.25em] border-2 rounded px-3 py-1.5 uppercase rotate-[12deg] sm:scale-110 shadow-sm ${activeDossier.stampColor} self-end sm:self-auto`}>
                            {activeDossier.stamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )
          ) : (
            /* ABSOLUTE POSITIONED DRAGGABLE LAYOUT FOR DESKTOP VIEWS */
            <>
              {DOSSIERS.map((d) => {
                const isExpanded = activeId === d.id;
                const pos = positions[d.id] || { x: d.initialX, y: d.initialY, rot: d.initialRot };

                return (
                  <div
                    key={d.id}
                    onPointerDown={(e) => handlePointerDown(e, d.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onClick={() => openFolder(d.id)}
                    style={{
                      left: isExpanded ? "50%" : `${pos.x}px`,
                      top: isExpanded ? "50%" : `${pos.y}px`,
                      transform: isExpanded 
                        ? "translate(-50%, -50%) scale(1.0)" 
                        : `rotate(${pos.rot}deg) scale(0.95)`,
                      zIndex: isExpanded ? 50 : 10 + d.id,
                    }}
                    className={`absolute transition-all duration-300 ease-out ${
                      isExpanded 
                        ? "w-[96%] max-w-[860px] h-[500px] bg-[#faf8f5] border border-[#dfdbd3] shadow-[0_40px_100px_rgba(0,0,0,0.95)]" 
                        : "w-56 h-72 border border-[#d2ab5b]/35 bg-gradient-to-br from-[#e6c280] to-[#cba355] shadow-[0_15px_30px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing hover:border-white/50 hover:scale-100 hover:rotate-[3deg] hover:shadow-[0_22px_45px_rgba(0,0,0,0.7)]"
                    } rounded-md p-6 flex flex-col justify-between overflow-hidden`}
                  >
                    {isExpanded ? (
                      /* DECRYPTED DETAILED PAPER PAGE VIEW */
                      <div className="flex flex-col justify-between h-full relative z-10 font-sans text-black pl-5">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-600/20 pointer-events-none" />

                        {/* Skeuomorphic Paperclip */}
                        <div className="absolute -top-3 left-8 w-[18px] h-[45px] border-2 border-[#a6a6af] rounded-full opacity-90 rotate-[-12deg] pointer-events-none z-20 shadow-[1px_2px_4px_rgba(0,0,0,0.25)] flex justify-center items-center">
                          <div className="w-[10px] h-[34px] border border-[#b4b4bc] rounded-full" />
                        </div>

                        {/* Retro Folder Header */}
                        <div className="flex items-start justify-between border-b-2 border-black/15 pb-4">
                          <div>
                            <span className="font-mono text-[9px] text-red-600 font-bold uppercase tracking-widest block mb-1">
                              SECURITY_LEVEL: TOP_SECRET // REGISTRY_{d.period.replace(/[\s–]/g, "_")}
                            </span>
                            <h3 className="font-display font-black text-2xl md:text-4xl text-[#1e1e24] uppercase tracking-tighter leading-none mb-1">
                              {d.company}
                            </h3>
                            <h4 className="font-mono text-xs text-black/60 font-bold tracking-widest uppercase">
                              {d.role}
                            </h4>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Skeuomorphic Barcode Catalog Tag */}
                            <div className="hidden sm:flex flex-col items-end border-l-2 border-dashed border-black/15 pl-4">
                              <div className="w-12 h-4 bg-white border border-black/20 flex items-stretch gap-[1.5px] p-[2.5px]">
                                <div className="bg-black w-[3px]" />
                                <div className="bg-black w-[1px]" />
                                <div className="bg-black w-[2px]" />
                                <div className="bg-black w-[4px]" />
                                <div className="bg-black w-[1px]" />
                                <div className="bg-black w-[3px]" />
                              </div>
                              <span className="font-mono text-[6px] text-black/40 mt-[2px] font-bold">INV-{8192 + d.id}A</span>
                            </div>

                            <button 
                              onClick={closeFolder}
                              className="font-mono text-xs text-black border border-black/35 bg-black/5 px-4 py-2 rounded hover:bg-black/15 transition-all cursor-pointer shadow-[0_2px_5px_rgba(0,0,0,0.06)]"
                            >
                              [ CLOSE ]
                            </button>
                          </div>
                        </div>

                        {/* Paper Document Body (Typewriter style) */}
                        <div className="flex-grow py-6 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {d.bullets.map((bullet, idx) => (
                            <div key={idx} className="flex gap-3">
                              <span className="text-red-600 font-bold font-mono text-sm select-none">&gt;&gt;</span>
                              <p className="text-[#2c2c35] leading-relaxed text-xs md:text-sm font-medium tracking-wide">
                                {bullet}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Paper Clip Tags and Red Ink Stamp */}
                        <div className="border-t border-black/15 pt-4 flex items-center justify-between">
                          {/* Pinned tags */}
                          <div className="flex flex-wrap gap-2">
                            {d.tech.map((t) => (
                              <span 
                                key={t}
                                className="font-mono text-[9px] uppercase text-[#1e1e24] border border-black/20 rounded px-2.5 py-1 bg-black/5 font-bold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          
                          {/* Ink stamp */}
                          <span className={`font-mono text-xs font-black tracking-[0.25em] border-2 rounded px-3 py-1.5 uppercase rotate-[12deg] scale-110 shadow-sm ${d.stampColor}`}>
                            {d.stamp}
                          </span>
                        </div>

                      </div>
                    ) : (
                      /* CLOSED KRAFT PAPER MANILA COVER */
                      <div className="flex flex-col justify-between h-full font-mono text-[#4a3416] select-none pointer-events-none relative">
                        {/* Folder spine binder columns */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#b38f45] to-[#cba355] border-r border-[#a8823b] -ml-6 -my-6 rounded-l" />

                        {/* Horizontal creasing lines */}
                        <div className="absolute left-2 right-2 top-1/4 h-[1px] bg-[#dfb96c] opacity-60" />
                        <div className="absolute left-2 right-2 top-3/4 h-[1px] bg-[#dfb96c] opacity-60" />

                        {/* Insignia Circular Watermark */}
                        <div className="absolute bottom-12 right-0 w-16 h-16 rounded-full border border-[#4a3416]/12 flex items-center justify-center opacity-30 rotate-[22deg]">
                          <span className="font-mono text-[6px] text-center uppercase tracking-widest font-black leading-none text-[#4a3416]/50">
                            DEPT<br/>OF<br/>SYS
                          </span>
                        </div>

                        <div>
                          {/* Manila folder tab label */}
                          <div className="w-16 h-4 bg-[#e6c280] rounded-t border-t border-x border-[#cba355] -mt-5 -ml-1 flex items-center justify-center relative">
                            <span className="text-[7px] text-[#4a3416]/50 font-bold">FILE_{d.id + 1}</span>
                            {/* Tab Paperclip */}
                            <div className="absolute -top-1 right-2 w-[8px] h-[20px] border border-[#a6a6af] rounded-full opacity-80 rotate-[15deg]" />
                          </div>
                          <div className="w-full h-[1px] bg-[#cba355] mb-4" />
                          
                          <span className="text-[8px] text-[#3d2910]/60 tracking-widest uppercase block mb-1 font-bold">
                            REGISTRY DOSSIER
                          </span>
                          <h4 className="text-sm font-bold text-white tracking-tight uppercase leading-snug drop-shadow-sm">
                            {d.company}
                          </h4>
                        </div>

                        <div className="border-t border-[#cba355] pt-3 flex items-center justify-between text-[9px] font-bold">
                          <span className="text-[#3b270a]">{d.period.split(" ")[0]}</span>
                          <span className="text-[#4a3416]/60 tracking-wider">[DECRYPT]</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

      </div>
    </section>
  );
}
