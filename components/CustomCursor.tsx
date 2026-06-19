"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/animations";

const DOT_COUNT = 6;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // State for fluid physics
  const mouse = useRef({ x: -1000, y: -1000 });
  const dotsState = useRef(Array(DOT_COUNT).fill(null).map(() => ({ x: -1000, y: -1000 })));
  const isHovering = useRef(false);

  useEffect(() => {
    if (!cursorRef.current || dotsRef.current.length === 0) return;
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
        gsap.to(dotsRef.current, { scale: 0, opacity: 0, duration: 0.2 });
        return;
      }

      if (
        target.closest("a") || 
        target.closest("button") || 
        target.dataset.cursorText || 
        target.classList.contains("cursor-grab")
      ) {
        isHovering.current = true;
        gsap.to(dotsRef.current, { scale: 2.5, backgroundColor: "rgba(240, 160, 0, 0.4)", duration: 0.3, stagger: 0.02, ease: "power3.out" });
      } else {
        isHovering.current = false;
        gsap.to(dotsRef.current, { scale: 1, backgroundColor: "var(--signal)", duration: 0.3, stagger: 0.02, ease: "power3.out" });
        dotsRef.current.forEach((dot, index) => {
           if (dot) gsap.to(dot, { opacity: 1 - index * 0.15, duration: 0.3 });
        });
      }
    };

    const onMouseDown = () => gsap.to(dotsRef.current, { scale: 0.5, duration: 0.15 });
    const onMouseUp = () => gsap.to(dotsRef.current, { scale: 1, duration: 0.4, ease: "bounce.out" });

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseHover);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    // Buttery Smooth Physics Loop
    let animationFrameId: number;
    const render = () => {
      // The head dot exactly follows the mouse
      dotsState.current[0].x = mouse.current.x;
      dotsState.current[0].y = mouse.current.y;

      // The rest of the dots mathematically lerp towards the dot in front of them
      for (let i = 1; i < DOT_COUNT; i++) {
        // If hovering, they all snap directly to the center for the "orb" effect
        const targetX = isHovering.current ? dotsState.current[0].x : dotsState.current[i - 1].x;
        const targetY = isHovering.current ? dotsState.current[0].y : dotsState.current[i - 1].y;
        
        // Lower lerp factor = more fluid/draggy. Higher = stiff string.
        dotsState.current[i].x += (targetX - dotsState.current[i].x) * 0.4;
        dotsState.current[i].y += (targetY - dotsState.current[i].y) * 0.4;
      }

      // Apply to DOM
      dotsRef.current.forEach((dot, i) => {
        if (dot) {
          // -50% translate is handled by margin in the style below, so we just set Left/Top
          dot.style.transform = `translate3d(${dotsState.current[i].x}px, ${dotsState.current[i].y}px, 0)`;
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
    <div ref={cursorRef} className="fixed inset-0 pointer-events-none z-[9999] hidden md:block mix-blend-difference">
      {[...Array(DOT_COUNT)].map((_, i) => {
        const size = 12 - i * 1.5;
        const opacity = 1 - i * 0.15;
        
        return (
          <div 
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className="absolute top-0 left-0 rounded-full bg-signal shadow-[0_0_10px_rgba(240,160,0,0.8)]"
            style={{ 
              width: `${size}px`, 
              height: `${size}px`,
              opacity,
              willChange: "transform",
              marginLeft: `-${size / 2}px`,
              marginTop: `-${size / 2}px`
            }}
          />
        );
      })}
    </div>
  );
}
