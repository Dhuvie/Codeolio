"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { createHeroIntro, prefersReducedMotion } from "@/lib/animations";
import MagneticButton from "./MagneticButton";
import TextDecoder from "./TextDecoder";


// Roles for typing animation
const ROLES = [
  "Full-Stack Engineer",
  "AI/ML Builder",
  "Systems Programmer",
  "Open Source Contributor",
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const decorRingRef = useRef<HTMLDivElement>(null);
  const hudTopRef = useRef<HTMLDivElement>(null);
  const hudBottomRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSpanElement>(null);

  // Typing animation state
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayedRole, setDisplayedRole] = useState("");

  // Typing effect
  useEffect(() => {
    const currentRole = ROLES[roleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex <= currentRole.length) {
      setDisplayedRole(currentRole.slice(0, charIndex));
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 60 + Math.random() * 40);
    } else if (!isDeleting && charIndex > currentRole.length) {
      // Pause at end
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && charIndex > 0) {
      setDisplayedRole(currentRole.slice(0, charIndex - 1));
      timeout = setTimeout(() => setCharIndex((c) => c - 1), 30);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setRoleIndex((r) => (r + 1) % ROLES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, roleIndex]);

  // Background scroll fade-out
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const tl = createHeroIntro(contentRef.current);

    // Fade and sink the entire hero background smoothly on scroll
    let bgSt: ScrollTrigger | undefined;
    if (bgRef.current && !prefersReducedMotion()) {
      bgSt = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=50%", // Fades out completely exactly before the section starts scrolling up!
        scrub: true,
        animation: gsap.to(bgRef.current, {
          opacity: 0,
          scale: 0.95,
          ease: "none",
        }),
      });
    }

    // Animate stats in — staggered counter-like entrance
    if (statsRef.current && !prefersReducedMotion()) {
      const statItems = statsRef.current.querySelectorAll(".hero-stat");
      gsap.fromTo(
        statItems,
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.12,
          delay: 1.8,
        }
      );
    }

    // Slow rotating decorative ring
    if (decorRingRef.current && !prefersReducedMotion()) {
      gsap.to(decorRingRef.current, {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: "none",
      });
    }

    // Parallax depth on HUD corners
    if (!prefersReducedMotion()) {
      const parallaxElements = [hudTopRef.current, hudBottomRef.current, decorRingRef.current].filter(Boolean);
      parallaxElements.forEach((el, i) => {
        gsap.to(el, {
          y: (i + 1) * -20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });
    }

    // Removed Hero pinning to ensure the seamless infinite scroll loop works perfectly without overlapping the Contact section.

    return () => {
      tl.kill();
      bgSt?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* BACKGROUND WRAPPER (fades out completely to avoid any hard horizontal line when scrolling) */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Grid dot background - Hidden on mobile because rendering a full-screen alpha texture over WebGL destroys mobile GPU fill-rate */}
        <div className="hidden md:block absolute inset-0 grid-dots opacity-20 pointer-events-none" />

        {/* Cinematic left-to-right vignette (Lighter/Simpler on mobile) */}
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background:
              "linear-gradient(108deg, rgba(13,11,8,0.94) 0%, rgba(13,11,8,0.78) 32%, rgba(13,11,8,0.28) 62%, rgba(13,11,8,0.08) 100%)",
          }}
        />
        {/* Simpler, faster gradient for mobile to keep text readable without lagging WebGL */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            background: "linear-gradient(180deg, rgba(13,11,8,0.85) 0%, rgba(13,11,8,0.4) 40%, rgba(13,11,8,0) 100%)",
          }}
        />
      </div>

      {/* Decorative rotating ring (top-right corner) */}
      <div
        ref={decorRingRef}
        className="absolute top-16 right-8 lg:right-24 w-48 h-48 pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <circle cx="100" cy="100" r="90" stroke="#f0a000" strokeWidth="1" strokeDasharray="6 10" />
          <circle cx="100" cy="100" r="65" stroke="#f0a000" strokeWidth="0.5" strokeDasharray="2 8" />
          <circle cx="100" cy="100" r="40" stroke="#f0a000" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="#f0a000" strokeWidth="0.5" opacity="0.5" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="#f0a000" strokeWidth="0.5" opacity="0.5" />
          <circle cx="100" cy="10"  r="3" fill="#f0a000" />
          <circle cx="100" cy="190" r="3" fill="#f0a000" />
          <circle cx="10"  cy="100" r="3" fill="#f0a000" />
          <circle cx="190" cy="100" r="3" fill="#f0a000" />
        </svg>
      </div>

      {/* HUD corners -- kprverse.com inspired */}
      <div ref={hudTopRef} className="absolute top-0 left-0 w-44 h-44 pointer-events-none" aria-hidden="true" style={{ opacity: 0.35 }}>
        <svg viewBox="0 0 176 176" fill="none" className="w-full h-full">
          <path d="M0 70 L0 0 L70 0" stroke="#f0a000" strokeWidth="1.5" fill="none" />
          <circle cx="4" cy="4" r="2.5" fill="#f0a000" />
        </svg>
        <div className="absolute top-6 left-6 font-mono text-signal/50" style={{ fontSize: "8px", letterSpacing: "0.1em", lineHeight: 1.8 }}>
          <div>28.6139N 77.2090E</div>
          <div>DHRUV.V3</div>
        </div>
      </div>
      {/* HUD corner -- bottom right */}
      <div ref={hudBottomRef} className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none" aria-hidden="true" style={{ opacity: 0.25 }}>
        <svg viewBox="0 0 128 128" fill="none" className="w-full h-full">
          <path d="M128 58 L128 128 L58 128" stroke="#f0a000" strokeWidth="1" fill="none" />
        </svg>
      </div>
      {/* kprverse-style system log -- top of section */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ paddingTop: "calc(var(--nav-height) + 0.5rem)" }}
        aria-hidden="true"
      >
        <div
          className="font-mono text-signal/30 px-6 whitespace-nowrap"
          style={{ fontSize: "9px", letterSpacing: "0.12em", animation: "marquee 30s linear infinite" }}
        >
          // sys.online / portfolio.v3 / projects.ready / contact.active / build.9vw / stack.fullstack / ai.ml / systems.kernel&nbsp;&nbsp;&nbsp;&nbsp;// sys.online / portfolio.v3 / projects.ready / contact.active / build.9vw / stack.fullstack / ai.ml / systems.kernel
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 section-container hero-content-container"
        style={{ paddingTop: "calc(var(--nav-height) + 2rem)" }}
      >
        {/* Status indicator */}
        <div className="hero-subtext flex items-center gap-3 mb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="ping-ripple absolute inline-flex h-full w-full rounded-full bg-signal" />
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal signal-pulse" />
          </span>
          <span className="font-util text-xs tracking-widest uppercase text-signal glow-breathe cursor-blink">
            System Online / Ready
          </span>
        </div>

        {/* Name — original coordinate labels and TextDecoder */}
        <h1
          className="font-display font-bold mb-6 relative z-20"
          style={{
            fontSize: "var(--font-size-hero)",
            lineHeight: "0.95",
            letterSpacing: "-0.03em",
          }}
        >
          {/* kprverse-inspired: numbered coordinate labels per line */}
          <div className="flex items-end gap-3">
            <span className="font-mono text-signal/40 mb-2 shrink-0" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>01</span>
            <TextDecoder text="Dhruv" className="block text-ink" />
          </div>
          <div className="flex items-end gap-3">
            <span className="font-mono text-signal/40 mb-2 shrink-0" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>02</span>
            <TextDecoder text="Narayan" className="block text-ink" />
          </div>
          <div className="flex items-end gap-3">
            <span className="font-mono text-signal/40 mb-2 shrink-0" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>03</span>
            <div className="flex">
              <TextDecoder text="Baj" className="block" />
              {/* "a" -- glowing gradient green, the hidden "ai" easter egg */}
              <span
                className="char inline-block gradient-text-animated"
                style={{ filter: "drop-shadow(0 0 18px rgba(240,160,0,0.8)) drop-shadow(0 0 40px rgba(240,160,0,0.4))" }}
              >a</span>
              <TextDecoder text="j" className="block text-ink" />
            </div>
          </div>
        </h1>

        {/* Tagline — typing animation with role cycling */}
        <div className="hero-subtext font-util text-sm md:text-base tracking-wider text-muted mb-6 max-w-2xl h-7">
          <span ref={typeRef} className="text-ink typewriter-cursor">
            {displayedRole}
          </span>
        </div>

        {/* One-liner */}
        <p className="hero-subtext text-muted max-w-xl mb-12 leading-relaxed lg:ml-24 font-body opacity-80" style={{ fontSize: "var(--font-size-body)" }}>
          I turn ideas into production-grade architectures — from kernel-level tools
          and real-time OpenGL engines to scalable AI platforms serving real users.
        </p>

        {/* CTAs */}
        <div className="hero-subtext flex flex-wrap gap-4 mb-14">
          <div data-cursor-text="VIEW" className="btn-primary-glow rounded-full">
            <MagneticButton href="#projects" variant="primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View Work
            </MagneticButton>
          </div>

          <div data-cursor-text="HELLO">
            <MagneticButton href="mailto:dhruvnarayanbajaj@gmail.com" variant="secondary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4l6 4 6-4M2 4v8h12V4H2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Get In Touch
            </MagneticButton>
          </div>
        </div>



      </div>

    </section>
  );
}
