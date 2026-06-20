"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion, animateCounter } from "@/lib/animations";
import SplitTextReveal from "./SplitTextReveal";
import SpotlightCard from "./SpotlightCard";

const ACHIEVEMENTS = [
  {
    place: "1st Place",
    event: "MSC HackXHack (Microsoft)",
    date: "Jan 2024",
    project: "UniSlot",
    description: "Real-time activity matching + AI moderation",
    hash: "0x8F9A2B4C9D1E7F",
  },
  {
    place: "Top 5%",
    event: "Devfolio Hackathon",
    date: "Mar 2025",
    project: "MediSync",
    description: "AI triage system, 92% accuracy on 10K+ records",
    hash: "0x3A1B4C9D2E8F6A",
  },
  {
    place: "Finalist",
    event: "HackerEarth AI Hackathon",
    date: "Nov 2024",
    project: "EcoRoute",
    description: "ML logistics optimization, 18% fuel reduction",
    hash: "0x7C9D2E1A4B8F3A",
  },
];



const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*&%";

function ScrambleText({ text, trigger }: { text: string; trigger: any }) {
  const [displayText, setDisplayText] = useState(text);
  
  useEffect(() => {
    if (prefersReducedMotion()) return;
    
    let iterations = 0;
    const maxIterations = 15;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((letter, index) => {
            if (index < iterations) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 2;
    }, 30);
    
    return () => clearInterval(interval);
  }, [text, trigger]);

  return <>{displayText}</>;
}

function LedgerBlock({ ach, index }: { ach: typeof ACHIEVEMENTS[0], index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex-shrink-0 w-full md:w-[350px] relative group mb-4 md:mb-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {index !== ACHIEVEMENTS.length - 1 && (
        <div className="hidden md:block absolute top-1/2 left-full w-8 h-[2px] bg-signal/20 z-0 -translate-y-1/2 group-hover:bg-signal/60 transition-colors" />
      )}

      <div className={`relative border border-signal/20 bg-[#080808] p-5 rounded z-10 transition-all duration-300 ${isHovered ? 'md:border-signal/80 md:shadow-[0_0_20px_rgba(240,160,0,0.15)] md:bg-[#0c0a06] md:-translate-y-1' : ''}`}>
        
        <div className="flex items-center justify-between border-b border-signal/10 pb-3 mb-4">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-signal/40 tracking-widest uppercase">Block Height</span>
            <span className="font-mono text-xs text-signal/80">#{819200 + index}</span>
          </div>
          <span className="font-mono text-[10px] text-muted tracking-widest bg-signal/5 px-2 py-1 rounded">
            {ach.date}
          </span>
        </div>

        <div className="hidden md:flex min-h-[140px] flex-col justify-center">
          {!isHovered ? (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] text-signal/40 tracking-widest uppercase">SHA-256 Hash</span>
              <span className="font-mono text-sm text-white break-all bg-signal/5 p-3 rounded border border-signal/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                {ach.hash}{index}A9F...
              </span>
              <span className="font-mono text-[10px] text-signal/60 animate-pulse mt-2">
                [ AWAITING DECRYPTION ]
              </span>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-[fade-in_0.2s_ease-out]">
              <span className="font-mono text-sm text-signal font-bold mb-1 uppercase tracking-widest">
                <ScrambleText text={ach.place} trigger={isHovered} />
              </span>
              <span className="font-mono text-xs text-white/80 mb-3 uppercase tracking-wider">
                <ScrambleText text={`@ ${ach.event}`} trigger={isHovered} />
              </span>
              
              <div className="bg-[#030303] border border-white/5 p-3 rounded font-mono text-[10px] text-muted leading-relaxed mt-auto">
                <span className="text-signal mr-2">{">"}</span>
                <span className="text-white">{ach.project}:</span> {ach.description}
              </div>
            </div>
          )}
        </div>

        <div className="flex md:hidden flex-col justify-center pt-2">
          <div className="flex flex-col h-full">
            <span className="font-mono text-sm text-signal font-bold mb-1 uppercase tracking-widest">
              {ach.place}
            </span>
            <span className="font-mono text-xs text-white/80 mb-3 uppercase tracking-wider">
              @ {ach.event}
            </span>
            
            <div className="bg-[#030303] border border-white/5 p-3 rounded font-mono text-[10px] text-muted leading-relaxed mt-auto">
              <span className="text-signal mr-2">{">"}</span>
              <span className="text-white">{ach.project}:</span> {ach.description}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none rounded" />
      </div>
    </div>
  );
}

export default function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;



    const blocks = scrollContainerRef.current?.querySelectorAll(".flex-shrink-0");
    blocks?.forEach((block, i) => {
      gsap.fromTo(block, 
        { opacity: 0, x: 50 },
        {
          opacity: 1, 
          x: 0, 
          duration: 0.6, 
          delay: i * 0.1, 
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        setShowHint(entries[0].isIntersecting);
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      ScrollTrigger.getAll()
        .filter((t) => sectionRef.current?.contains(t.trigger as Element))
        .forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="achievements" className="relative py-12">
      <div className="section-container relative z-10">
        <p className="section-label" data-cursor-magnetic>Verified Ledger</p>
        <SplitTextReveal text="Competition blocks." className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl mb-16" />

        <div className={`cave-hint fixed top-1/2 right-0 md:right-4 -translate-y-1/2 flex items-center gap-3 bg-black/80 border border-signal/30 p-2 md:p-3 rounded-l-full md:rounded-full pointer-events-none z-50 shadow-[0_0_15px_rgba(240,160,0,0.2)] transition-all duration-700 ease-out ${showHint ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-signal/50 flex items-center justify-center text-signal font-mono text-xs md:text-sm animate-pulse">
            i
          </div>
          <span className="font-mono text-[10px] md:text-xs text-muted pr-2 md:pr-1 whitespace-nowrap">
            Move mouse to explore cave
          </span>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent z-20 pointer-events-none" />
          
          <div 
            ref={scrollContainerRef}
            className="flex flex-col md:flex-row gap-4 md:gap-8 overflow-x-hidden md:overflow-x-auto custom-scrollbar md:pb-8 pt-4 px-4 md:scroll-smooth md:snap-x md:snap-mandatory"
          >
            {ACHIEVEMENTS.map((ach, i) => (
              <div key={i} className="md:snap-center">
                <LedgerBlock ach={ach} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
