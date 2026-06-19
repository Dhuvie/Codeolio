"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { createMagneticEffect } from "@/lib/animations";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number;
  variant?: "primary" | "secondary";
  external?: boolean;
}

export default function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  strength = 0.3,
  variant = "primary",
  external = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cleanup = createMagneticEffect(ref.current, strength);
    return cleanup;
  }, [strength]);

  const baseClasses = `
    inline-flex items-center gap-2 px-6 py-3 rounded-lg
    font-mono text-sm tracking-wider uppercase
    transition-colors duration-300 cursor-pointer
    relative overflow-hidden group
  `;

  const variantClasses =
    variant === "primary"
      ? "text-signal"
      : "text-ink";

  const combinedClasses = `
    inline-flex items-center gap-2 px-8 py-4 rounded-full
    font-util text-sm font-bold tracking-[0.2em] uppercase
    transition-all duration-300 cursor-pointer
    relative overflow-hidden group
    md:hover:scale-105 md:hover:shadow-[0_0_40px_rgba(240,160,0,0.4),inset_0_0_20px_rgba(240,160,0,0.2)]
    ${variantClasses} ${className}
  `;

  const renderContent = () => (
    <>
      {/* ── 1. Deep Tech Base ── */}
      <span className="absolute inset-0 rounded-full bg-[#080808] border border-signal/20 transition-colors duration-300 md:group-hover:border-signal/80 z-0" />

      {/* ── 2. Laser Grid Background ── */}
      <span 
        className="absolute inset-0 rounded-full z-0 opacity-10 md:group-hover:opacity-40 transition-opacity duration-500 mix-blend-screen"
        style={{
          backgroundImage: "radial-gradient(var(--signal) 1px, transparent 1px)",
          backgroundSize: "6px 6px"
        }}
      />

      {/* ── 3. Plasma Glow Core ── */}
      <span 
        className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 z-0 mix-blend-screen"
        style={{
          background: variant === "primary" 
            ? "radial-gradient(circle at 50% 100%, rgba(240, 160, 0, 0.4), transparent 60%)" 
            : "radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.2), transparent 60%)",
        }}
      />

      {/* ── 4. Cybernetic Scanline (Animated across) ── */}
      <span className="absolute inset-0 z-0 overflow-hidden rounded-full">
        <span className="absolute top-0 bottom-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-signal/30 to-transparent -translate-x-full md:group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </span>

      {/* ── 5. Text Content (3D Roll with aggressive glow) ── */}
      <span className="relative z-20 flex items-center gap-2 overflow-hidden h-full drop-shadow-[0_0_8px_rgba(240,160,0,1.0)]">
        <span className="flex flex-col transition-transform duration-500 md:group-hover:-translate-y-full">
          <span className="flex items-center justify-center gap-2 h-full">{children}</span>
          <span className="flex items-center justify-center gap-2 h-full absolute top-full left-0 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">{children}</span>
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={combinedClasses}
        onClick={onClick}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <button ref={ref} className={combinedClasses} onClick={onClick}>
      {renderContent()}
    </button>
  );
}
