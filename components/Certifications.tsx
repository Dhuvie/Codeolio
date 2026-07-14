"use client";

import { useRef, useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/animations";

const CERTIFICATIONS = [
  { 
    text: "Oracle Certified Pro: Java 17", 
    org: "Oracle", 
    id: "CR-9201",
    issued: "January 2024",
    hash: "SHA-256: 8a4e9b98fd292c10a30bfe19",
    description: "Professional certification validating advanced Java language constructs, memory optimizations, multi-threading architectures, garbage collection algorithms, and concurrency schedulers.",
    skills: "Java 17 OOP, Concurrency, Stream API, Memory Management, Unit Testing",
    verification: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=9B699E1ECDC59D3BFF1B00C737DB69C22E382339DBB4224170C3810269798C9E"
  },
  { 
    text: "SAP Generative AI Developer", 
    org: "SAP", 
    id: "CR-7742",
    issued: "November 2024",
    hash: "SHA-256: 9b2d3e11a3b8c199201dfbc2",
    description: "Advanced generative AI developer validation focusing on orchestrating cognitive agents, vector embedding layouts, RAG architectures, prompt engineering models, and LLM API integrations.",
    skills: "GenAI Foundations, LLM Orchestration, RAG Architectures, Vector Stores",
    verification: "https://www.credly.com/earner/earned/badge/6757864c-db33-4ee9-8e2b-9d45419f1682"
  },
  { 
    text: "SAP Business AI Solutions", 
    org: "SAP", 
    id: "CR-8831",
    issued: "December 2024",
    hash: "SHA-256: 7c8d9e12f0a1c3b8890123df",
    description: "Specialized validation verifying capability in designing, training, and integrating predictive ML pipelines and automated agents into enterprise database systems safely.",
    skills: "Predictive Analytics, Enterprise Integration, Automated Workflows, Ethics",
    verification: "https://www.credly.com/earner/earned/badge/3f5cf4c6-e2c6-4d58-baf0-46dddc662825"
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

  const [mobileCertHighlightIdx, setMobileCertHighlightIdx] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleLeft = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "certifications") {
        setMobileCertHighlightIdx((prev) => Math.max(0, prev - 1));
      }
    };
    const handleRight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "certifications") {
        setMobileCertHighlightIdx((prev) => Math.min(CERTIFICATIONS.length - 1, prev + 1));
      }
    };
    const handleButtonA = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "certifications") {
        if (expandedCardIdx === null) {
          handleOpenCard(mobileCertHighlightIdx);
        }
      }
    };
    const handleButtonB = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeSection === "certifications") {
        if (expandedCardIdx !== null) {
          handleCloseCard();
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
  }, [expandedCardIdx, mobileCertHighlightIdx]);

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
    }, 800); // 800ms matches the 3D door swing duration
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
              className={`relative border p-10 backdrop-blur-sm pointer-events-auto cursor-pointer transition-transform hover:scale-[1.02] bg-black hover:bg-black/90 lg:mt-16 ${
                mobileCertHighlightIdx === i 
                  ? "border-[#f0a000] shadow-[0_0_15px_rgba(240,160,0,0.25)]" 
                  : "border-white/10"
              }`}
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
          className={`fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-6 backdrop-blur-sm transition-opacity duration-500 cursor-default ${
            isLightMode ? "bg-black/45" : "bg-black/85"
          }`}
        >
          {/* Central Vault Box Wrapper */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
            className={`w-[90vw] max-w-[600px] h-[440px] relative overflow-hidden rounded-lg shadow-2xl transition-all duration-500 ${
              isLightMode 
                ? "bg-[#fafafc] border border-black/10" 
                : "bg-[#0c0c0e] border border-[#f0a000]/30"
            } ${
              isClosing 
                ? "animate-[scaleDownBook_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
                : "animate-[scaleUpBook_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            }`}
          >
            {/* 1. REVEALED CENTRAL CORE (UNDER THE DOORS) */}
            <div className={`absolute inset-0 z-0 p-5 md:p-8 flex flex-col justify-between overflow-y-auto font-mono text-xs ${
              isLightMode ? "bg-[#f4f4f7] text-[#0c0c0e]" : "bg-[#040406] text-white"
            }`}>
              {/* Gold backing aura */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  background: isLightMode 
                    ? "radial-gradient(circle at center, rgba(192, 128, 0, 0.04) 0%, transparent 75%)" 
                    : "radial-gradient(circle at center, rgba(240, 160, 0, 0.06) 0%, transparent 75%)"
                }}
              />

              <div className="relative z-10">
                {/* Header status bar */}
                <div className={`flex items-center justify-between border-b pb-3 mb-4 text-[9px] ${
                  isLightMode ? "border-black/15" : "border-[#f0a000]/25"
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isLightMode ? "bg-[#c08000]" : "bg-[#f0a000]"}`} />
                    <span className={`tracking-widest uppercase font-bold ${isLightMode ? "text-[#c08000]" : "text-[#f0a000]"}`}>
                      SECURE_VAULT_NODE // SHIELD_ACTIVE
                    </span>
                  </div>
                  <span className={isLightMode ? "text-black/50" : "text-white/40"}>
                    HASH: {activeCert.hash}
                  </span>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <span className={`text-[9px] uppercase tracking-widest block mb-0.5 ${
                      isLightMode ? "text-[#c08000]/80" : "text-[#f0a000]/60"
                    }`}>Title of Registry</span>
                    <h3 className={`font-display font-bold text-lg md:text-2xl uppercase tracking-wide leading-tight ${
                      isLightMode ? "text-black" : "text-white"
                    }`}>
                      {activeCert.text}
                    </h3>
                  </div>

                  <div className={`grid grid-cols-2 gap-3 md:gap-4 border-y py-3 md:py-4 my-2 ${
                    isLightMode ? "border-black/10" : "border-white/5"
                  }`}>
                    <div className={`space-y-1.5 border-r pr-4 ${isLightMode ? "border-black/10" : "border-white/5"}`}>
                      <span className={`text-[9px] uppercase tracking-wider block ${isLightMode ? "text-black/40" : "text-white/30"}`}>Credential Authority</span>
                      <p className={`font-bold text-xs uppercase font-sans ${isLightMode ? "text-black" : "text-white"}`}>{activeCert.org}</p>
                      <span className={`text-[9px] uppercase tracking-wider block mt-2 ${isLightMode ? "text-black/40" : "text-white/30"}`}>Issued Date</span>
                      <p className={`font-bold text-[10px] ${isLightMode ? "text-black/80" : "text-white/80"}`}>{activeCert.issued}</p>
                    </div>
                    <div className="space-y-1.5 pl-2">
                      <span className={`text-[9px] uppercase tracking-wider block ${isLightMode ? "text-black/40" : "text-white/30"}`}>System registry code</span>
                      <p className={`font-bold text-xs ${isLightMode ? "text-[#c08000]" : "text-[#f0a000]"}`}>{activeCert.id}</p>
                      <span className={`text-[9px] uppercase tracking-wider block mt-2 ${isLightMode ? "text-black/40" : "text-white/30"}`}>Status validation</span>
                      <p className={`font-bold text-[10px] uppercase ${isLightMode ? "text-green-700" : "text-green-400"}`}>VERIFIED // SUCCESS</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className={`text-[9px] uppercase tracking-widest block ${
                      isLightMode ? "text-[#c08000]/80" : "text-[#f0a000]/60"
                    }`}>Operational syllabus modules</span>
                    <p className={`font-sans text-[10px] md:text-[11px] leading-relaxed font-medium ${
                      isLightMode ? "text-black/70" : "text-white/70"
                    }`}>
                      {activeCert.description}
                    </p>
                  </div>

                  <div className="space-y-2 md:space-y-2.5 pt-2">
                    <span className={`text-[9px] uppercase tracking-widest block ${
                      isLightMode ? "text-[#c08000]/80" : "text-[#f0a000]/60"
                    }`}>Acquired Competencies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCert.skills.split(", ").map((skill) => (
                        <span 
                          key={skill} 
                          className={`font-mono text-[8px] border rounded px-2.5 py-1 ${
                            isLightMode 
                              ? "text-black border-black/10 bg-black/5" 
                              : "text-white border-white/10 bg-white/5"
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`relative z-10 border-t pt-3 md:pt-4 flex items-center justify-between mt-4 md:mt-6 ${
                isLightMode ? "border-black/10" : "border-[#f0a000]/15"
              }`}>
                <span className={`text-[8px] uppercase tracking-widest ${isLightMode ? "text-black/40" : "text-white/20"}`}>[ Click outside to seal vault ]</span>
                <a 
                  href={activeCert.verification} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`font-mono text-[9px] border px-4 py-2 rounded hover:bg-[#f0a000]/15 transition-all uppercase tracking-widest font-bold ${
                    isLightMode 
                      ? "text-[#c08000] border-[#c08000]/40 bg-[#c08000]/5 shadow-[0_0_15px_rgba(192,128,0,0.03)]" 
                      : "text-[#f0a000] border-[#f0a000]/40 bg-[#f0a000]/5 shadow-[0_0_15px_rgba(240,160,0,0.05)]"
                  }`}
                >
                  [ Verify Certificate ]
                </a>
              </div>
            </div>

            {/* 2. LEFT VAULT DOOR (Pivots open to the left) */}
            <div 
              className={`absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden transition-all duration-[800ms] ease-out z-10 pointer-events-none origin-left border-r ${
                isLightMode ? "bg-[#ffffff] border-black/10" : "bg-black border-[#f0a000]/25"
              }`}
              style={{ 
                transform: isDeclassified 
                  ? "rotateY(-95deg) scale(0.95)" 
                  : "rotateY(0deg) scale(1)",
                opacity: isDeclassified ? 0 : 1
              }}
            >
              <div className="w-[200%] h-full p-6 md:p-10 relative">
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 opacity-50 ${isLightMode ? "border-black/30" : "border-signal/50"}`} />
                <span className={`font-mono text-[10px] tracking-widest uppercase block mb-8 ${isLightMode ? "text-[#c08000]" : "text-signal"}`}>
                  SYS.ID // {activeCert.id}
                </span>
                <h3 className={`font-display font-bold text-2xl uppercase tracking-wide mb-4 ${isLightMode ? "text-black" : "text-white"}`}>
                  {activeCert.text}
                </h3>
                <p className={`font-sans text-sm uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/50"}`}>
                  Issued by: <span className={isLightMode ? "text-black font-bold" : "text-white font-bold"}>{activeCert.org}</span>
                </p>
              </div>
            </div>

            {/* 3. RIGHT VAULT DOOR (Pivots open to the right) */}
            <div 
              className={`absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden transition-all duration-[800ms] ease-out z-10 pointer-events-none origin-right border-l ${
                isLightMode ? "bg-[#ffffff] border-black/10" : "bg-black border-[#f0a000]/25"
              }`}
              style={{ 
                transform: isDeclassified 
                  ? "rotateY(95deg) scale(0.95)" 
                  : "rotateY(0deg) scale(1)",
                opacity: isDeclassified ? 0 : 1
              }}
            >
              <div className="w-[200%] h-full p-6 md:p-10 relative" style={{ transform: "translateX(-50%)" }}>
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 opacity-50 ${isLightMode ? "border-black/30" : "border-signal/50"}`} />
                <span className={`font-mono text-[10px] tracking-widest uppercase block mb-8 ${isLightMode ? "text-[#c08000]" : "text-signal"}`}>
                  SYS.ID // {activeCert.id}
                </span>
                <h3 className={`font-display font-bold text-2xl uppercase tracking-wide mb-4 ${isLightMode ? "text-black" : "text-white"}`}>
                  {activeCert.text}
                </h3>
                <p className={`font-sans text-sm uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/50"}`}>
                  Issued by: <span className={isLightMode ? "text-black font-bold" : "text-white font-bold"}>{activeCert.org}</span>
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
