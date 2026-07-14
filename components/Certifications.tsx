"use client";

import { useRef, useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/animations";

const CERTIFICATIONS = [
  { text: "Oracle Certified Pro: Java 17", org: "Oracle", id: "CR-9201" },
  { text: "SAP Generative AI Developer", org: "SAP", id: "CR-7742" },
  { text: "SAP Business AI Solutions", org: "SAP", id: "CR-8831" },
  { text: "TATA Data Analytics", org: "TATA", id: "CR-1049" },
  { text: "Commonwealth Bank SE", org: "CBA", id: "CR-2290" },
];

export default function Certifications() {
  const containerRef = useRef<HTMLElement>(null);
  const darkMaskRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

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

  return (
    <section 
      id="certifications" 
      ref={containerRef}
      className={`relative w-full min-h-[900px] overflow-hidden z-10 cursor-crosshair border-y transition-colors duration-300 ${
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
            [ Use Spotlight to Reveal Data ]
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
          {CERTIFICATIONS.map((cert, i) => (
            <div 
              key={i} 
              className={`relative border p-10 backdrop-blur-sm pointer-events-auto transition-transform hover:scale-[1.02] border-white/10 bg-black hover:bg-black/90 ${
                i % 2 === 0 ? "lg:mt-16" : ""
              } ${i === 4 ? "md:col-span-2 lg:col-span-1 lg:mt-32" : ""}`}
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
