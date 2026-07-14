"use client";

import { useRef, useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/animations";

const CERTIFICATIONS = [
  { 
    text: "Oracle Certified Pro: Java 17", 
    org: "Oracle", 
    id: "CR-9201",
    issued: "Jan 2024",
    description: "Professional industry credential validating advanced core Java scheduling, structural patterns, concurrency paradigms, garbage collection tuning, and API architectures.",
    skills: "Java 17 OOP, Concurrency, Stream API, Memory Management, Unit Testing",
    verification: "https://www.oracle.com/education/certification/"
  },
  { 
    text: "SAP Generative AI Developer", 
    org: "SAP", 
    id: "CR-7742",
    issued: "Nov 2024",
    description: "Advanced AI credential focused on building generative agent workloads, prompt engineering, vector search algorithms, and setting up secure Retrieval-Augmented Generation (RAG) pipelines.",
    skills: "GenAI Foundations, LLM Orchestration, RAG Architectures, Vector Stores",
    verification: "https://credsverse.com/credentials/"
  },
  { 
    text: "SAP Business AI Solutions", 
    org: "SAP", 
    id: "CR-8831",
    issued: "Dec 2024",
    description: "Enterprise validation demonstrating competency in designing and deploying predictive machine learning algorithms and workflows into ERP architectures.",
    skills: "Predictive Analytics, Enterprise Integration, Automated Workflows, Ethics",
    verification: "https://credsverse.com/credentials/"
  }
];

export default function Certifications() {
  const containerRef = useRef<HTMLElement>(null);
  const darkMaskRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);
  const [isDeclassified, setIsDeclassified] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const lastOpenedIdxRef = useRef<number>(0);

  useEffect(() => {
    if (expandedCardIdx !== null) {
      lastOpenedIdxRef.current = expandedCardIdx;
    }
  }, [expandedCardIdx]);

  // Sync isLightMode with document class list
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

  useEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !darkMaskRef.current || !spotlightRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Transparent cutout reveal coordinates
      const maskStr = `radial-gradient(circle 400px at ${x}px ${y}px, transparent 0%, black 100%)`;
      darkMaskRef.current.style.maskImage = maskStr;
      darkMaskRef.current.style.webkitMaskImage = maskStr;

      // In light mode, apply a dark multiplier shadow sweep; in dark mode, a bright gold spotlight
      if (document.documentElement.classList.contains("light")) {
        spotlightRef.current.style.background = `radial-gradient(circle 400px at ${x}px ${y}px, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.01) 40%, transparent 100%)`;
      } else {
        spotlightRef.current.style.background = `radial-gradient(circle 400px at ${x}px ${y}px, rgba(240, 160, 0, 0.15) 0%, rgba(240, 160, 0, 0.05) 40%, transparent 100%)`;
      }
    };

    const container = containerRef.current;
    container.addEventListener("mousemove", onMouseMove);
    return () => container.removeEventListener("mousemove", onMouseMove);
  }, []);

  const handleOpenCard = (idx: number) => {
    setExpandedCardIdx(idx);
    setIsDeclassified(false);
    setIsClosing(false);
    setTimeout(() => {
      setIsDeclassified(true);
    }, 50);
  };

  const handleCloseCard = () => {
    setIsDeclassified(false);
    setIsClosing(true);
    setTimeout(() => {
      setExpandedCardIdx(null);
      setIsClosing(false);
    }, 700); // 700ms matches the vault door sliding closed
  };

  const activeCertIdx = expandedCardIdx !== null ? expandedCardIdx : lastOpenedIdxRef.current;
  const activeCert = CERTIFICATIONS[activeCertIdx];

  return (
    <section 
      id="certifications" 
      ref={containerRef}
      className={`relative w-full min-h-[850px] overflow-hidden z-10 cursor-crosshair border-y transition-colors duration-300 ${
        isLightMode ? "bg-[#ffffff] border-black/5" : "bg-[#020202] border-white/5"
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: isLightMode
            ? `linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`
            : `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full h-full section-container py-32 pointer-events-none">
        
        <div className="mb-24 text-center">
          <p className="font-mono text-sm text-signal tracking-[0.5em] uppercase mb-4">
            {"// Verified Credentials"}
          </p>
          <h2 className="font-display font-semibold text-5xl md:text-7xl text-ink tracking-tighter">
            Hidden Vault.
          </h2>
          <p className="font-mono text-xs text-signal/60 tracking-widest mt-6 uppercase animate-pulse">
            [ Spotlight Reveals Cards // Click to Decrypt ]
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
          {CERTIFICATIONS.map((cert, i) => (
            <div 
              key={i} 
              onClick={() => handleOpenCard(i)}
              className="relative border p-10 backdrop-blur-sm pointer-events-auto cursor-pointer transition-transform hover:scale-[1.02] border-white/10 bg-black hover:bg-black/90 lg:mt-16"
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-signal/50 opacity-50" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-signal/50 opacity-50" />
              
              <span className="font-mono text-[10px] tracking-widest text-signal uppercase block mb-8">
                SYS.ID // {cert.id}
              </span>
              
              <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wide mb-4">
                {cert.text}
              </h3>
              
              <p className="font-sans text-sm text-white/50 uppercase tracking-widest">
                Issued by: <span className="text-white font-bold">{cert.org}</span>
              </p>

              <div className="mt-12 w-full h-[1px] bg-gradient-to-r from-signal/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED CREDENTIAL SCI-FI VAULT MODAL */}
      {(expandedCardIdx !== null || isClosing) && (
        <div 
          onClick={handleCloseCard}
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm transition-opacity duration-500 cursor-default"
        >
          {/* Central Vault Box Wrapper */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-[90vw] max-w-[600px] h-[400px] relative overflow-hidden bg-[#0c0c0e] border border-[#f0a000]/30 rounded-lg shadow-2xl transition-all duration-500 ${
              isClosing 
                ? "animate-[scaleDownBook_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
                : "animate-[scaleUpBook_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            }`}
          >
            {/* 1. REVEALED CENTRAL CORE (UNDER THE DOORS) */}
            <div className="absolute inset-0 z-0 p-8 bg-[#040406] flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between border-b border-[#f0a000]/20 pb-4 mb-4 font-mono">
                  <span className="text-[9px] text-[#f0a000] tracking-widest uppercase">
                    SECURE_VAULT_NODE // DECLASSIFIED
                  </span>
                  <span className="text-[9px] text-white/40">
                    ISSUED: {activeCert.issued}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl md:text-2xl text-white uppercase tracking-wide mb-3 leading-snug">
                  {activeCert.text}
                </h3>
                <p className="font-sans text-xs text-white/70 leading-relaxed mb-6 font-medium">
                  {activeCert.description}
                </p>

                {/* Skills learned grid */}
                <div className="space-y-2">
                  <h4 className="font-mono text-[9px] text-[#f0a000] uppercase tracking-wider">
                    Verified Competencies:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCert.skills.split(", ").map((skill) => (
                      <span key={skill} className="font-mono text-[8px] text-white border border-white/10 bg-white/5 rounded px-2.5 py-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#f0a000]/15 pt-4 flex items-center justify-between mt-6">
                <span className="font-mono text-[8px] text-white/30">CRED.ID: {activeCert.id}</span>
                
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[8px] text-[#f0a000]/40">[ Click outside to seal vault ]</span>
                  <a 
                    href={activeCert.verification} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] text-[#f0a000] border border-[#f0a000]/30 bg-[#f0a000]/5 px-3 py-1.5 rounded hover:bg-[#f0a000]/15 transition-all uppercase tracking-wider"
                  >
                    [ Verify Credential ]
                  </a>
                </div>
              </div>
            </div>

            {/* 2. LEFT VAULT DOOR (Slides Left) */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1/2 bg-black border-r border-[#f0a000]/20 overflow-hidden transition-transform duration-700 ease-out z-10 pointer-events-none"
              style={{ transform: isDeclassified ? "translateX(-100%)" : "translateX(0)" }}
            >
              <div className="w-[600px] h-full p-10 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-signal/50 opacity-50" />
                <span className="font-mono text-[10px] tracking-widest text-signal uppercase block mb-8">
                  SYS.ID // {activeCert.id}
                </span>
                <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wide mb-4">
                  {activeCert.text}
                </h3>
                <p className="font-sans text-sm text-white/50 uppercase tracking-widest">
                  Issued by: <span className="text-white font-bold">{activeCert.org}</span>
                </p>
              </div>
            </div>

            {/* 3. RIGHT VAULT DOOR (Slides Right) */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-black border-l border-[#f0a000]/20 overflow-hidden transition-transform duration-700 ease-out z-10 pointer-events-none"
              style={{ transform: isDeclassified ? "translateX(100%)" : "translateX(0)" }}
            >
              <div className="w-[600px] h-full p-10 relative" style={{ transform: "translateX(-300px)" }}>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-signal/50 opacity-50" style={{ transform: "translateX(300px)" }} />
                <span className="font-mono text-[10px] tracking-widest text-signal uppercase block mb-8">
                  SYS.ID // {activeCert.id}
                </span>
                <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wide mb-4">
                  {activeCert.text}
                </h3>
                <p className="font-sans text-sm text-white/50 uppercase tracking-widest">
                  Issued by: <span className="text-white font-bold">{activeCert.org}</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      <div 
        ref={darkMaskRef}
        className={`hidden lg:block absolute inset-0 z-20 pointer-events-none transition-all duration-300 ${
          isLightMode ? "bg-[#ffffff]" : "bg-[#020202]"
        }`}
        style={{
          maskImage: `radial-gradient(circle 0px at -1000px -1000px, transparent 0%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle 0px at -1000px -1000px, transparent 0%, black 100%)`,
        }}
      />

      <div 
        ref={spotlightRef}
        className={`hidden lg:block absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 ${
          isLightMode ? "mix-blend-multiply" : "mix-blend-screen"
        } ${isHovering ? "opacity-100" : "opacity-0"}`}
        style={{
          background: `radial-gradient(circle 0px at -1000px -1000px, rgba(240, 160, 0, 0.15) 0%, rgba(240, 160, 0, 0.05) 40%, transparent 100%)`
        }}
      />
    </section>
  );
}
