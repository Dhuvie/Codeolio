"use client";

import { useState, useEffect, useRef } from "react";

export default function MobileConsole() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [gyro, setGyro] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [ping, setPing] = useState(42);
  const [isTiltEnabled, setIsTiltEnabled] = useState(true);

  const sections = ["hero", "about", "experience", "projects", "achievements", "certifications", "skills", "contact"];

  // Detect mobile viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    if (typeof window === "undefined" || !isMobile) return;
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (const sec of sections) {
        const el = document.querySelector(`[data-section="${sec}"]`);
        if (el) {
          const top = (el as HTMLElement).offsetTop;
          const height = (el as HTMLElement).offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Track Device Gyroscope Tilt
  useEffect(() => {
    if (typeof window === "undefined" || !isMobile) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const rawPitch = e.beta ? e.beta : 0;
      const rawRoll = e.gamma ? e.gamma : 0;
      
      setGyro({ x: Math.round(rawRoll), y: Math.round(rawPitch) });

      if (isTiltEnabled) {
        // Normalize: pitch neutral at 45deg holding angle on mobile
        const pitch = rawPitch - 45;
        const roll = rawRoll;
        
        // Clamp to max 8 degrees tilt
        const clampX = Math.max(-8, Math.min(8, pitch * 0.25));
        const clampY = Math.max(-8, Math.min(8, roll * 0.25));
        
        document.documentElement.style.setProperty("--gyro-rotate-x", `${-clampX}deg`);
        document.documentElement.style.setProperty("--gyro-rotate-y", `${clampY}deg`);
      }
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      document.documentElement.style.setProperty("--gyro-rotate-x", "0deg");
      document.documentElement.style.setProperty("--gyro-rotate-y", "0deg");
    };
  }, [isMobile, isTiltEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isTiltEnabled) {
      document.documentElement.style.setProperty("--gyro-rotate-x", "0deg");
      document.documentElement.style.setProperty("--gyro-rotate-y", "0deg");
    }
  }, [isTiltEnabled]);

  // Fetch simulated battery level and ping variations
  useEffect(() => {
    if (typeof window === "undefined" || !isMobile) return;

    // Battery
    if ((navigator as any).getBattery) {
      (navigator as any).getBattery().then((bat: any) => {
        setBatteryLevel(Math.round(bat.level * 100));
        bat.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(bat.level * 100));
        });
      });
    }

    // Ping variation
    const interval = setInterval(() => {
      setPing(40 + Math.floor(Math.random() * 10));
    }, 4000);
    return () => clearInterval(interval);
  }, [isMobile]);

  const triggerHaptic = (ms = 15) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const playSound = (type: "click" | "beep" | "success" | "error") => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === "beep") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === "success") {
        osc.type = "square";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio context blocked
    }
  };

  const handleSectionScroll = (direction: "up" | "down") => {
    playSound("click");
    triggerHaptic(20);
    const currIdx = sections.indexOf(activeSection);
    let targetIdx = currIdx;

    if (direction === "up") {
      targetIdx = Math.max(0, currIdx - 1);
    } else {
      targetIdx = Math.min(sections.length - 1, currIdx + 1);
    }

    const targetSec = sections[targetIdx];
    const el = document.querySelector(`[data-section="${targetSec}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const dispatchConsoleEvent = (eventName: string) => {
    triggerHaptic(25);
    playSound("beep");
    window.dispatchEvent(new CustomEvent(eventName, { detail: { activeSection } }));
  };

  if (!isMobile) return null;

  return (
    <>
      {/* 1. FUTURISTIC TELEMETRY STATUS BAR (TOP OF MOBILE SCREEN) */}
      <div className="fixed top-0 left-0 right-0 h-9 z-[999999] bg-[#0c0c0e]/85 backdrop-blur-md border-b border-[#f0a000]/20 flex items-center justify-between px-4 font-mono text-[8px] text-white/50 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[#f0a000] font-bold uppercase tracking-widest">
            LOC: {activeSection.toUpperCase()} // SEC_0{sections.indexOf(activeSection) + 1}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>GYRO_X: {gyro.x}°</span>
          <span>GYRO_Y: {gyro.y}°</span>
          <span className="hidden xs:inline">PING: {ping}ms</span>
          <span>BAT: {batteryLevel}%</span>
          
          <button 
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setIsTiltEnabled(!isTiltEnabled);
            }} 
            className={`border rounded px-1.5 py-0.5 tracking-wider uppercase font-bold font-mono transition-all ${
              isTiltEnabled ? "border-[#f0a000]/30 text-[#f0a000] bg-[#f0a000]/5" : "border-zinc-500/40 text-zinc-500 bg-zinc-500/5"
            }`}
          >
            {isTiltEnabled ? "TILT_ON" : "TILT_OFF"}
          </button>
          
          <button 
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setIsMuted(!isMuted);
            }} 
            className={`border rounded px-1.5 py-0.5 tracking-wider uppercase font-bold font-mono transition-all ${
              isMuted ? "border-red-500/40 text-red-500 bg-red-500/5" : "border-[#f0a000]/30 text-[#f0a000] bg-[#f0a000]/5"
            }`}
          >
            {isMuted ? "MUTED" : "SOUND_ON"}
          </button>
        </div>
      </div>

      {/* 2. GLOWING SCI-FI HANDHELD D-PAD CONTROLLER (BOTTOM LEFT CORNER) */}
      <div className="fixed bottom-4 left-4 z-[999999] w-24 h-24 flex items-center justify-center pointer-events-auto select-none">
        {/* Glow backdrop ring */}
        <div className="absolute inset-0 bg-[#f0a000]/3 rounded-full border border-[#f0a000]/5 shadow-[0_0_20px_rgba(240,160,0,0.03)]" />

        <div className="relative w-20 h-20">
          {/* Vertical axis bar */}
          <div className="absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2 bg-[#121214] border border-[#f0a000]/25 rounded-md flex flex-col justify-between p-0.5" />
          {/* Horizontal axis bar */}
          <div className="absolute top-1/2 left-0 right-0 h-6 -translate-y-1/2 bg-[#121214] border border-[#f0a000]/25 rounded-md flex justify-between p-0.5" />

          {/* D-Pad Buttons */}
          {/* UP Button (Scroll Up) */}
          <button
            type="button"
            onClick={() => handleSectionScroll("up")}
            className="absolute left-1/2 top-0.5 w-5 h-5 -translate-x-1/2 rounded active:bg-[#f0a000]/20 flex items-center justify-center z-10 transition-colors"
          >
            <svg width="8" height="6" viewBox="0 0 8 6" className="text-[#f0a000] rotate-180">
              <path d="M4 6L0 0H8L4 6Z" fill="currentColor" />
            </svg>
          </button>

          {/* DOWN Button (Scroll Down) */}
          <button
            type="button"
            onClick={() => handleSectionScroll("down")}
            className="absolute left-1/2 bottom-0.5 w-5 h-5 -translate-x-1/2 rounded active:bg-[#f0a000]/20 flex items-center justify-center z-10 transition-colors"
          >
            <svg width="8" height="6" viewBox="0 0 8 6" className="text-[#f0a000]">
              <path d="M4 6L0 0H8L4 6Z" fill="currentColor" />
            </svg>
          </button>

          {/* LEFT Button (Action Left) */}
          <button
            type="button"
            onClick={() => dispatchConsoleEvent("mobile-dpad-left")}
            className="absolute left-0.5 top-1/2 w-5 h-5 -translate-y-1/2 rounded active:bg-[#f0a000]/20 flex items-center justify-center z-10 transition-colors"
          >
            <svg width="6" height="8" viewBox="0 0 6 8" className="text-[#f0a000] rotate-90">
              <path d="M3 8L0 0H6L3 8Z" fill="currentColor" />
            </svg>
          </button>

          {/* RIGHT Button (Action Right) */}
          <button
            type="button"
            onClick={() => dispatchConsoleEvent("mobile-dpad-right")}
            className="absolute right-0.5 top-1/2 w-5 h-5 -translate-y-1/2 rounded active:bg-[#f0a000]/20 flex items-center justify-center z-10 transition-colors"
          >
            <svg width="6" height="8" viewBox="0 0 6 8" className="text-[#f0a000] -rotate-90">
              <path d="M3 8L0 0H6L3 8Z" fill="currentColor" />
            </svg>
          </button>

          {/* Center core cap */}
          <div className="absolute inset-0 m-auto w-4 h-4 bg-[#1e1e21] border border-[#f0a000]/40 rounded-full shadow-[inset_0_0_4px_rgba(240,160,0,0.5)] z-20" />
        </div>
      </div>

      {/* 3. GLOWING CONSOLE ACTION BUTTONS (BOTTOM RIGHT CORNER) */}
      <div className="fixed bottom-4 right-4 z-[999999] flex gap-3 pointer-events-auto select-none">
        {/* BUTTON B (Close/Back) */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => dispatchConsoleEvent("mobile-button-b")}
            className="w-10 h-10 rounded-full border border-red-500/40 bg-[#121214] flex items-center justify-center active:bg-red-500/20 active:border-red-500/80 shadow-[0_4px_10px_rgba(239,68,68,0.15)] transition-all font-mono text-xs font-bold text-red-500"
          >
            B
          </button>
          <span className="font-mono text-[7px] text-red-500/60 uppercase tracking-widest font-black">BACK</span>
        </div>

        {/* BUTTON A (Open/Select) */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => dispatchConsoleEvent("mobile-button-a")}
            className="w-11 h-11 rounded-full border border-green-500/40 bg-[#121214] flex items-center justify-center active:bg-green-500/20 active:border-green-500/80 shadow-[0_4px_12px_rgba(34,197,94,0.18)] transition-all font-mono text-sm font-bold text-green-500"
          >
            A
          </button>
          <span className="font-mono text-[7px] text-green-500/60 uppercase tracking-widest font-black">ACTION</span>
        </div>
      </div>
    </>
  );
}
