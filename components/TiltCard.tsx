"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { createTiltEffect } from "@/lib/animations";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxDeg?: number;
}

export default function TiltCard({
  children,
  className = "",
  maxDeg = 8,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cleanup = createTiltEffect(ref.current, maxDeg);
    return cleanup;
  }, [maxDeg]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
