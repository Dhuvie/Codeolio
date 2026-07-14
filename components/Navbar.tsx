"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { createMagneticEffect, prefersReducedMotion } from "@/lib/animations";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light";
      const hasLightClass = document.documentElement.classList.contains("light");
      if (savedTheme === "light" || (!savedTheme && hasLightClass)) {
        setTheme("light");
        document.documentElement.classList.add("light");
      } else {
        setTheme("dark");
        document.documentElement.classList.remove("light");
      }
    }
  }, []);

  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const triggerClick = (delay: number) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(3200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
          
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        }, delay);
      };
      
      triggerClick(0);
      triggerClick(22); // Click bounce
    } catch (e) {
      console.warn("Web Audio block", e);
    }
  };

  const toggleTheme = (e?: React.MouseEvent) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    playClickSound();
    
    if (typeof window !== "undefined") {
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;
      
      if (e && e.clientX !== undefined && e.clientY !== undefined) {
        startX = e.clientX;
        startY = e.clientY;
      } else {
        const dotEl = document.getElementById("dot-j-bajaj");
        if (dotEl) {
          const rect = dotEl.getBoundingClientRect();
          startX = rect.left + rect.width * 0.72; 
          startY = rect.top + rect.height * 0.15;
        }
      }
      
      // 1. Check if View Transitions API is supported
      if ((document as any).startViewTransition) {
        const transition = (document as any).startViewTransition(() => {
          if (nextTheme === "light") {
            document.documentElement.classList.add("light");
            localStorage.setItem("theme", "light");
          } else {
            document.documentElement.classList.remove("light");
            localStorage.setItem("theme", "dark");
          }
          setTheme(nextTheme);
        });
        
        transition.ready.then(() => {
          // Calculate diagonal to guarantee full viewport coverage
          const targetRadius = Math.hypot(
            Math.max(startX, window.innerWidth - startX),
            Math.max(startY, window.innerHeight - startY)
          );
          
          document.documentElement.animate(
            [
              {
                clipPath: `circle(0px at ${startX}px ${startY}px)`
              },
              {
                clipPath: `circle(${targetRadius}px at ${startX}px ${startY}px)`
              }
            ],
            {
              duration: 650,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              pseudoElement: "::view-transition-new(root)"
            }
          );
        });
      } else {
        // 2. Fallback: GSAP Circle sweep overlay
        const circle = document.getElementById("theme-transition-circle");
        if (circle) {
          const maxDim = Math.max(window.innerWidth, window.innerHeight);
          const targetScale = (maxDim / 100) * 3;
          
          gsap.killTweensOf(circle);
          
          circle.style.left = `${startX}px`;
          circle.style.top = `${startY}px`;
          circle.style.backgroundColor = nextTheme === "light" ? "#ffffff" : "#0d0b08";
          circle.style.opacity = "1";
          circle.style.transform = "translate(-50%, -50%) scale(0)";
          
          gsap.to(circle, {
            scale: targetScale,
            duration: 0.9,
            ease: "power2.inOut",
            onComplete: () => {
              if (nextTheme === "light") {
                document.documentElement.classList.add("light");
                localStorage.setItem("theme", "light");
              } else {
                document.documentElement.classList.remove("light");
                localStorage.setItem("theme", "dark");
              }
              setTheme(nextTheme);
              
              gsap.to(circle, {
                opacity: 0,
                duration: 0.45,
                ease: "power1.out",
                onComplete: () => {
                  circle.style.transform = "translate(-50%, -50%) scale(0)";
                }
              });
            }
          });
        } else {
          if (nextTheme === "light") {
            document.documentElement.classList.add("light");
            localStorage.setItem("theme", "light");
          } else {
            document.documentElement.classList.remove("light");
            localStorage.setItem("theme", "dark");
          }
          setTheme(nextTheme);
        }
      }
    }
  };

  useEffect(() => {
    if (prefersReducedMotion()) {
      setScrolled(true);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top -80px",
      onUpdate: (self) => {
        setScrolled(self.progress > 0);
      },
    });

    const cleanups: (() => void)[] = [];
    const links = navRef.current?.querySelectorAll<HTMLElement>(".nav-link");
    links?.forEach((link) => {
      cleanups.push(createMagneticEffect(link, 0.2));
    });

    return () => {
      st.kill();
      cleanups.forEach((c) => c());
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isMobile: boolean = false) => {
    setMobileOpen(false);

    if (isMobile) {
      return;
    }

    e.preventDefault();
    const sectionId = href.replace("#", "");

    window.dispatchEvent(
      new CustomEvent("trigger-wipe", {
        detail: { sectionId },
      })
    );
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 nav-materialize ${
          scrolled ? "nav-scrolled" : "bg-transparent"
        }`}
        style={{ height: "var(--nav-height)" }}
      >
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-6 lg:px-12">
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="font-util text-sm tracking-wider text-ink hover:text-signal transition-colors duration-300 glow-breathe"
            style={{ animationDuration: "4s" }}
          >
            <span className="text-signal" style={{ textShadow: "0 0 12px rgba(240,160,0,0.6)" }}>D</span>NB
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="nav-link highlight-underline font-util text-xs tracking-widest uppercase text-muted hover:text-signal transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            
            {/* Innovative skeuomorphic mechanical theme switch toggle */}
            <div 
              onClick={toggleTheme}
              className="flex items-center gap-3 cursor-pointer select-none ml-4 relative group"
              title="Toggle Theme Switch"
            >
              <span className="font-util text-[10px] tracking-widest uppercase text-muted group-hover:text-signal transition-colors duration-300">
                {theme === "dark" ? "SYS_LIGHT" : "SYS_DARK"}
              </span>

              <div className={`w-[42px] h-[22px] rounded-full border p-[2px] relative flex items-center transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-[#141416] border-[#2c2c35] shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]" 
                  : "bg-[#f0f0f4] border-[#cdcdde] shadow-[inset_0_2px_5px_rgba(0,0,0,0.12)]"
              } group-hover:border-signal`}>
                
                {/* Status LED */}
                <div 
                  className={`absolute left-[6.5px] w-[4.5px] h-[4.5px] rounded-full transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]" 
                      : "bg-[#ff5500] shadow-[0_0_8px_#ff5500]"
                  }`}
                />

                {/* Tactile metal knob lever */}
                <div 
                  className={`w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#ffffff] to-[#a0a0b0] shadow-[0_2px_5px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.85)_inset] transition-all duration-300 transform ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  } active:scale-90`}
                />
              </div>
            </div>
          </div>

        </div>
      </nav>

      {/* Theme transition circle overlay */}
      <div
        id="theme-transition-circle"
        className="fixed rounded-full pointer-events-none z-[99999] opacity-0"
        style={{
          transform: "translate(-50%, -50%) scale(0)",
          width: "100px",
          height: "100px",
          willChange: "transform, opacity",
          left: 0,
          top: 0,
        }}
      />
    </>
  );
}
