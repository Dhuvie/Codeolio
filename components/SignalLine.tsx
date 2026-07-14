"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";

export default function SignalLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const headDotRef = useRef<SVGCircleElement>(null);

  const [docHeight, setDocHeight] = useState(10000);
  const [pathD, setPathD] = useState("");
  const [nodes, setNodes] = useState<{ id: string; x: number; y: number }[]>([]);

  useEffect(() => {
    const updatePath = () => {
      const width = window.innerWidth;
      const height = document.documentElement.scrollHeight;
      setDocHeight(height);

      // Determine the content container bounds (usually 1200px max, plus margins)
      const contentWidth = Math.min(width - 60, 1200);
      const leftBound = (width - contentWidth) / 2;
      const rightBound = (width + contentWidth) / 2;
      const sections = Array.from(document.querySelectorAll("main > [data-section]"));
      const points: { x: number; topY: number; bottomY: number; centerY: number; id: string }[] = [];

      sections.forEach((sec, i) => {
        const el = sec as HTMLElement;
        const rect = el.getBoundingClientRect();
        const topY = window.scrollY + rect.top;
        const bottomY = window.scrollY + rect.bottom;
        const secHeight = rect.height;
        
        // Align signal line to run along the page content bounds (right bound on even, left bound on odd)
        const x = (i % 2 === 0) ? rightBound + 12 : leftBound - 12;
        const offset = Math.min(60, secHeight * 0.1);
        
        points.push({ 
          x, 
          topY: topY + offset, 
          bottomY: bottomY - offset, 
          centerY: topY + secHeight / 2,
          id: el.getAttribute("data-section") || "" 
        });
      });

      if (points.length > 0) {
        let d = `M ${points[0].x} 0`;
        
        for (let i = 0; i < points.length; i++) {
          const curr = points[i];
          
          d += ` L ${curr.x} ${curr.bottomY}`;
          
          if (i < points.length - 1) {
            const next = points[i + 1];
            
            const sign = next.x > curr.x ? 1 : -1;
            const radius = Math.min(30, (next.topY - curr.bottomY) * 0.4);
            const midY = curr.bottomY + (next.topY - curr.bottomY) * 0.5;

            // Go down vertically to the start of the first corner turn
            d += ` L ${curr.x} ${midY - radius}`;
            // Curve corner 1 (turn horizontal)
            d += ` Q ${curr.x} ${midY}, ${curr.x + sign * radius} ${midY}`;
            // Horizontal line across the gap space
            d += ` L ${next.x - sign * radius} ${midY}`;
            // Curve corner 2 (turn vertical)
            d += ` Q ${next.x} ${midY}, ${next.x} ${midY + radius}`;
            // Go to the top start of the next section
            d += ` L ${next.x} ${next.topY}`;
          }
        }
        
        const last = points[points.length - 1];
        if (last.bottomY < height) {
          d += ` L ${last.x} ${height}`;
        }
        
        setPathD(d);
        setNodes(points.map(p => ({ id: p.id, x: p.x, y: p.centerY })));
      }
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    const timeout = setTimeout(updatePath, 500); // Recalculate after layout settles

    return () => {
      window.removeEventListener("resize", updatePath);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!pathRef.current || !headDotRef.current || !pathD || prefersReducedMotion()) return;
    
    const path = pathRef.current;
    const headDot = headDotRef.current;
    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.1, // Very tight scrub for buttery smooth tracking
      onUpdate: (self) => {
        gsap.set(path, {
          strokeDashoffset: length * (1 - self.progress),
        });

        const point = path.getPointAtLength(length * self.progress);
        gsap.set(headDot, {
          cx: point.x,
          cy: point.y,
        });
      },
    });

    const nodeElements = containerRef.current?.querySelectorAll(".signal-node");
    nodeElements?.forEach((node) => {
      gsap.fromTo(node, 
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: `#${node.getAttribute("data-section")}`,
            start: "top 50%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    return () => {
      st.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (typeof t.vars.trigger === "string" && t.vars.trigger.startsWith("#")) {
          if (Array.from(nodeElements || []).some(n => `#${n.getAttribute("data-section")}` === t.vars.trigger)) {
            t.kill();
          }
        }
      });
    };
  }, [pathD]);

  if (!pathD) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full z-[35] pointer-events-none hidden lg:block overflow-hidden"
      style={{ height: docHeight }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={pathD}
          stroke="var(--signal)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.1"
          fill="none"
        />

        <path
          ref={pathRef}
          d={pathD}
          stroke="var(--signal)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
          fill="none"
          style={{ filter: "drop-shadow(0 0 8px rgba(240, 160, 0, 0.6))" }}
        />

        {nodes.map((node) => (
          <g key={node.id} className="signal-node" data-section={node.id} style={{ transformOrigin: `${node.x}px ${node.y}px` }}>
            <circle cx={node.x} cy={node.y} r="4" fill="var(--signal)" />
            <circle
              cx={node.x}
              cy={node.y}
              r="10"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="24"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="0.5"
              opacity="0.2"
            />
          </g>
        ))}

        <g>
          <circle
            ref={headDotRef}
            r="6"
            fill="var(--signal)"
            style={{ filter: "drop-shadow(0 0 12px var(--signal))", willChange: "cx, cy" }}
          />
        </g>
      </svg>
    </div>
  );
}
