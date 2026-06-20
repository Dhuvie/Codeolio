"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/animations";

const TAIL_LENGTH = 20;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);
  
  const mouse = useRef({ x: -1000, y: -1000 });
  const dotsState = useRef(Array(TAIL_LENGTH).fill(null).map(() => ({ x: -1000, y: -1000 })));
  const isHovering = useRef(false);

  useEffect(() => {
    if (!cursorRef.current || linesRef.current.length === 0) return;
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) {
      cursorRef.current.style.display = "none";
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const onMouseHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest("#certifications")) {
        gsap.to(cursorRef.current, { scale: 0, opacity: 0, duration: 0.2 });
        return;
      }

      if (
        target.closest("a") || 
        target.closest("button") || 
        target.dataset.cursorText || 
        target.classList.contains("cursor-grab")
      ) {
        isHovering.current = true;
        gsap.to(cursorRef.current, { scale: 3, backgroundColor: "rgba(240, 160, 0, 0.4)", duration: 0.3, ease: "power3.out" });
      } else {
        isHovering.current = false;
        gsap.to(cursorRef.current, { scale: 1, backgroundColor: "var(--signal)", duration: 0.3, ease: "power3.out", opacity: 1 });
      }
    };

    const onMouseDown = () => gsap.to(cursorRef.current, { scale: 0.5, duration: 0.15 });
    const onMouseUp = () => gsap.to(cursorRef.current, { scale: isHovering.current ? 3 : 1, duration: 0.4, ease: "bounce.out" });

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseHover);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    let animationFrameId: number;
    const render = () => {
      dotsState.current[0].x = mouse.current.x;
      dotsState.current[0].y = mouse.current.y;

      for (let i = 1; i < TAIL_LENGTH; i++) {
        const targetX = isHovering.current ? dotsState.current[0].x : dotsState.current[i - 1].x;
        const targetY = isHovering.current ? dotsState.current[0].y : dotsState.current[i - 1].y;
        
        dotsState.current[i].x += (targetX - dotsState.current[i].x) * 0.45;
        dotsState.current[i].y += (targetY - dotsState.current[i].y) * 0.45;
      }

      if (cursorRef.current) {
         cursorRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0)`;
      }

      linesRef.current.forEach((line, i) => {
        if (line) {
          line.setAttribute("x1", dotsState.current[i].x.toString());
          line.setAttribute("y1", dotsState.current[i].y.toString());
          line.setAttribute("x2", dotsState.current[i + 1].x.toString());
          line.setAttribute("y2", dotsState.current[i + 1].y.toString());
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseHover);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "auto";
      document.head.removeChild(style);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <svg className="fixed inset-0 pointer-events-none z-[9998] hidden md:block mix-blend-difference w-full h-full">
        {[...Array(TAIL_LENGTH - 1)].map((_, i) => {
          // Taper the width from 8px at the head down to 0 at the tail
          const strokeWidth = 8 * (1 - i / (TAIL_LENGTH - 1));
          const opacity = 1 - (i / (TAIL_LENGTH - 1));
          
          return (
            <line
              key={i}
              ref={(el) => { linesRef.current[i] = el; }}
              stroke="var(--signal)"
              strokeWidth={Math.max(0.5, strokeWidth)}
              strokeLinecap="round"
              opacity={opacity}
            />
          );
        })}
      </svg>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-3 h-3 rounded-full bg-signal shadow-[0_0_12px_rgba(240,160,0,0.8)] pointer-events-none z-[9999] hidden md:block mix-blend-difference"
        style={{ 
          marginLeft: '-6px', 
          marginTop: '-6px',
          willChange: 'transform'
        }} 
      />
    </>
  );
}
