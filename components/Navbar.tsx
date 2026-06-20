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
        </div>

      </div>
    </nav>
  );
}
