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

    </>
  );
}
