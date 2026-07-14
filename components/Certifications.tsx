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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      className={`relative w-full min-h-[600px] overflow-hidden z-10 border-y transition-colors duration-300 ${
        isLightMode ? "bg-[#ffffff] border-black/5" : "bg-[#020202] border-white/5"
      }`}
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

      <div className="relative z-10 w-full h-full section-container py-24 pointer-events-auto">
        
        <div className="mb-16 text-center">
          <p className="font-mono text-sm text-signal tracking-[0.5em] uppercase mb-4">
            {"// Verified Credentials"}
          </p>
          <h2 className="font-display font-semibold text-5xl md:text-6xl text-ink tracking-tighter">
            Credential Vault.
          </h2>
          <p className="font-mono text-xs text-signal/60 tracking-widest mt-6 uppercase animate-pulse">
            [ SECURE RECORDS IN FULL VIEW // VERIFIED DIRECTLY ]
          </p>
        </div>

        {/* 3-column direct dossier grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {CERTIFICATIONS.map((cert, i) => (
            <div 
              key={i} 
              className={`relative border p-6 rounded-lg font-mono text-left transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:hover:scale-[1.01] backdrop-blur-xl ${
                isLightMode 
                  ? "bg-white/35 border-black/5 shadow-sm text-zinc-900" 
                  : "bg-[#0c0c0e]/40 border-zinc-800 text-white"
              }`}
            >
              {/* Visual corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-signal/50 opacity-40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-signal/50 opacity-40" />
              
              <span className={`text-[8px] tracking-widest uppercase block mb-4 ${isLightMode ? "text-[#0033aa]" : "text-signal"}`}>
                SYS.ID // {cert.id}
              </span>
              
              <h3 className={`font-display font-bold text-lg uppercase tracking-wide mb-2 ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                {cert.text}
              </h3>
              
              <p className={`text-[10px] uppercase tracking-widest mb-4 ${isLightMode ? "text-zinc-600" : "text-white/50"}`}>
                Issued by: <span className="font-bold">{cert.org}</span> // {cert.issued}
              </p>

              <div className="space-y-3 mb-6">
                <div className={`text-[8px] font-bold border-b pb-1 ${isLightMode ? "border-black/10 text-zinc-500" : "border-white/10 text-white/40"}`}>
                  [ CREDENTIAL_DECRYPTION_LOGS ]
                </div>
                <p className={`text-[9px] leading-relaxed min-h-[90px] ${isLightMode ? "text-zinc-600" : "text-white/70"}`}>
                  {cert.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[50px] items-start">
                  {cert.skills.split(", ").map((skill, sIdx) => (
                    <span 
                      key={sIdx}
                      className={`text-[7px] px-1.5 py-0.5 rounded border ${
                        isLightMode 
                          ? "bg-white border-black/10 text-zinc-600" 
                          : "bg-black/40 border-white/10 text-white/50"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-[7.5px] opacity-40 text-left pt-1 select-all font-mono">
                  HASH: {cert.hash}
                </div>
              </div>

                <div className="flex items-center justify-between border-t pt-4 border-subtle text-[8px]">
                  <span className={isLightMode ? "text-zinc-400" : "text-white/30"}>STATUS // VERIFIED</span>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
