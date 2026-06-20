"use client";

import { useRef } from "react";

const EXPERIENCES = [
  {
    role: "Freelance Full-Stack Developer",
    company: "Promptgram",
    period: "Oct 2024 – Apr 2025",
    bullets: [
      "Built a prompt-to-image social platform (Next.js, Node.js, PostgreSQL) that processed 800+ AI generations in its first month",
      "Integrated Cloudflare CDN with a Redis caching layer, cutting median page load from 4.2s to 1.8s on 3G and server response time by 38%",
      "Implemented JWT auth via NextAuth.js, role-based access control, and AWS S3 presigned URL storage for secure user-generated content",
      "Project paused after 3 months due to client funding constraints; delivered a clean handoff with full API docs and a deployment runbook",
    ],
    tech: ["Next.js", "Node.js", "PostgreSQL", "Redis", "AWS S3", "NextAuth.js", "Cloudflare"],
  },
  {
    role: "Freelance UI Developer",
    company: "Cart-esthetic",
    period: "Jun 2024 – Sep 2024",
    bullets: [
      "Engineered 25+ animated React components with Framer Motion across product listing, cart, and checkout flows for a fashion e-commerce brand",
      "Built a sticky checkout panel with form auto-save and session-persistent cart state, reducing cart abandonment an estimated 15–20% per client feedback",
      "Improved Lighthouse performance score from 67 to 89 via lazy loading, route-level code splitting, and next/image optimization",
      "Delivered responsive, WCAG-accessible UI; collaborated async with a 3-person design team across a 12-month engagement",
    ],
    tech: ["React", "Framer Motion", "Next.js", "TypeScript", "Tailwind CSS"],
  },
];

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      id="experience" 
      ref={containerRef}
      className="relative w-full min-h-screen bg-transparent py-32"
    >
      <div className="section-container relative z-10 w-full">
        
        <div className="mb-24">
          <p className="font-mono text-sm text-signal tracking-[0.5em] uppercase mb-4">
            {"// Career Timeline"}
          </p>
          <h2 className="font-display font-semibold text-4xl md:text-5xl text-white">
            Work Experience.
          </h2>
        </div>

        <div className="flex flex-col gap-32">
          {EXPERIENCES.map((exp, i) => (
            <div key={i} className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
              
              <div className="lg:w-5/12 relative">
                <div className="lg:sticky lg:top-40 flex flex-col items-start">
                  <h3 className="font-display font-black text-5xl md:text-7xl text-white uppercase tracking-tighter leading-none">
                    {exp.company}
                  </h3>
                  <div className="w-12 h-1 bg-signal my-6" />
                  <h4 className="font-mono text-xl text-signal tracking-widest uppercase">
                    {exp.role}
                  </h4>
                  <p className="font-mono text-sm text-white/40 tracking-widest mt-2">
                    {exp.period}
                  </p>
                </div>
              </div>

              <div className="lg:w-7/12 flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  {exp.bullets.map((bullet, idx) => (
                    <p key={idx} className="text-lg md:text-xl text-white/80 font-sans leading-relaxed tracking-wide">
                      {bullet}
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {exp.tech.map((t, idx) => (
                    <span 
                      key={idx} 
                      className="font-mono text-xs uppercase text-signal/80 tracking-widest border border-signal/20 rounded-full px-4 py-2 hover:bg-signal hover:text-bg transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
