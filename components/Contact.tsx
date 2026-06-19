"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";
import MagneticButton from "./MagneticButton";
import ParticleField from "./ParticleField";

// Terminal-style contact info
const CONTACT_LINES = [
  { prefix: "email", value: "dhruvnarayanbajaj@gmail.com" },
  { prefix: "github", value: "github.com/Dhuvie" },
  { prefix: "linkedin", value: "linkedin.com/in/dhruv-bajaj" },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const bigTextRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminalLines, setTerminalLines] = useState<number>(0);
  const [termText, setTermText] = useState("");

  useEffect(() => {
    if (!sectionRef.current) return;

    // Parallax on the big decorative text
    if (bigTextRef.current && !prefersReducedMotion()) {
      gsap.to(bigTextRef.current, {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="relative overflow-hidden">
      {/* Particle field */}
      <ParticleField count={50} connectionDist={90} />

      {/* Background grid dots */}
      <div className="absolute inset-0 grid-dots opacity-15 pointer-events-none" />

      {/* Decorative large background text */}
      <div
        ref={bigTextRef}
        className="absolute bottom-0 left-0 right-0 select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <p
          className="font-display font-bold text-center whitespace-nowrap"
          style={{
            fontSize: "clamp(5rem, 18vw, 20rem)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(240,160,0,0.06)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          CONNECT
        </p>
      </div>

      <div className="section-container pb-24 relative z-10">
        <p className="section-label">Contact</p>

        <div className="max-w-2xl">
          <h2
            className="contact-item font-display font-semibold mb-4"
            style={{ fontSize: "var(--font-size-h2)" }}
          >
            Let&apos;s <span className="gradient-text-animated">connect</span>
          </h2>

          <p className="contact-item text-muted mb-8 leading-relaxed">
            Open to collaborating on innovative projects and exploring new
            opportunities. I respond fast — usually within 24 hours.
          </p>

          {/* Availability badge */}
          <div className="contact-item flex items-center gap-3 mb-8 p-4 rounded-xl border border-signal/15 bg-surface/40 w-fit">
            <span className="relative flex h-2.5 w-2.5">
              <span className="ping-ripple absolute inline-flex h-full w-full rounded-full bg-signal" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal" />
            </span>
            <span className="font-util text-xs tracking-widest uppercase text-signal">
              Currently Available for Internship / Freelance
            </span>
          </div>

          {/* Terminal-style contact info */}
          <div
            ref={terminalRef}
            className="contact-item mb-8 p-5 rounded-xl bg-surface/60 border border-ink/5 font-mono text-sm space-y-2"
          >
            <div className="flex items-center gap-2 mb-3 text-muted text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 tracking-widest uppercase">contact.sh</span>
            </div>
            {CONTACT_LINES.map((line, i) => (
              <div
                key={line.prefix}
                className="flex gap-2 transition-all duration-300"
                style={{
                  opacity: 1,
                  transform: "translateY(0)",
                }}
              >
                <span className="text-signal/60">$</span>
                <span className="text-muted">{line.prefix}:</span>
                <span className="text-ink">{line.value}</span>
              </div>
            ))}
            <div className="relative min-h-[1.5rem] group w-full">
              <span className="text-signal/60 mr-2">$</span>
              <span className="text-signal whitespace-pre-wrap break-all typewriter-cursor">
                {termText || '\u200B'}
              </span>
              <input 
                type="text"
                value={termText}
                onChange={(e) => setTermText(e.target.value)}
                maxLength={100}
                className="absolute inset-0 opacity-0 w-full h-full cursor-text"
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
              />
            </div>
          </div>

          {/* Links */}
          <div className="contact-item flex flex-wrap gap-4 mb-12">
            <MagneticButton href="mailto:dhruvnarayanbajaj@gmail.com" variant="primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4l6 4 6-4M2 4v8h12V4H2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Email Me
            </MagneticButton>

            <MagneticButton href="https://github.com/Dhuvie" variant="secondary" external>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </MagneticButton>

            <MagneticButton href="https://linkedin.com/in/dhruv-bajaj-a379b827a" variant="secondary" external>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </MagneticButton>
          </div>
        </div>

      </div>
    </section>
  );
}
