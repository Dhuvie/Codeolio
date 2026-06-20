"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "@/lib/gsap-register";
import { useLenis } from "@/lib/lenis-provider";

const PATHS: Record<string, { path: string; cmd: string }> = {
  hero:           { path: "~/dhruv",                   cmd: "whoami"              },
  about:          { path: "~/dhruv/about.md",           cmd: "cat about.md"        },
  experience:     { path: "~/dhruv/experience/",        cmd: "ls -l experience/"   },
  projects:       { path: "~/dhruv/projects/",          cmd: "git log --oneline"   },
  achievements:   { path: "~/dhruv/achievements.json",  cmd: "cat achievements.json"},
  certifications: { path: "~/dhruv/certifications/",    cmd: "ls certifications/"  },
  skills:         { path: "~/dhruv/skills.sh",          cmd: "./skills.sh --all"   },
  contact:        { path: "~/dhruv/contact.sh",         cmd: "bash contact.sh"     },
};

export default function FolderTransition() {
  const layer1Ref       = useRef<SVGSVGElement>(null);
  const layer2Ref       = useRef<HTMLDivElement>(null);
  const textContainerRef= useRef<HTMLDivElement>(null);
  const cmdRef          = useRef<HTMLSpanElement>(null);
  const pathRef         = useRef<HTMLSpanElement>(null);
  const isPlaying       = useRef(false);
  const lenis           = useLenis();

  const [statusPath, setStatusPath] = useState("~/dhruv");
  const [blink, setBlink]           = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleWipe = (e: Event) => {
      const customEvent = e as CustomEvent<{ sectionId: string }>;
      const { sectionId } = customEvent.detail;
      
      const target = document.getElementById(sectionId);
      if (!target || isPlaying.current) return;
      
      isPlaying.current = true;
      const meta = PATHS[sectionId] ?? { path: `~/dhruv/${sectionId}`, cmd: `cd ${sectionId}/` };
      
      const l1 = layer1Ref.current;
      const text = textContainerRef.current;
      const cmdEl = cmdRef.current;
      const pathEl = pathRef.current;

      if (!l1 || !text || !cmdEl || !pathEl) { 
        isPlaying.current = false; 
        return; 
      }

      const pathNode = l1.querySelector("path");

      pathEl.textContent = meta.path;
      cmdEl.textContent  = `$ ${meta.cmd}`;
      setStatusPath(meta.path);

      const tl = gsap.timeline({ onComplete: () => { isPlaying.current = false; } });

      tl.set(l1, { display: "block" })
        .to(pathNode, {
          attr: { d: "M 0 100 V 50 Q 50 -20 100 50 V 100 z" },
          duration: 0.4,
          ease: "power2.in",
        })
        .to(pathNode, {
          attr: { d: "M 0 100 V 0 Q 50 0 100 0 V 100 z" },
          duration: 0.4,
          ease: "power2.out",
        });

      tl.add(() => {
        if (lenis) {
          lenis.scrollTo(target, { immediate: true });
        } else {
          target.scrollIntoView({ behavior: "auto" });
        }
      });

      tl.set(text, { opacity: 0, scale: 0.9 })
        .to(text, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" })
        .to({}, { duration: 0.4 }) // Hold
        .to(text, { opacity: 0, scale: 1.05, duration: 0.3, ease: "power3.in" });

      tl.to(pathNode, {
          attr: { d: "M 0 0 V 0 Q 50 120 100 0 V 0 z" },
          duration: 0.4,
          ease: "power2.in",
        }, "-=0.1")
        .to(pathNode, {
          attr: { d: "M 0 0 V 0 Q 50 0 100 0 V 0 z" },
          duration: 0.4,
          ease: "power2.out",
        })
        .set(l1, { display: "none" })
        .set(pathNode, { attr: { d: "M 0 100 V 100 Q 50 100 100 100 V 100 z" } });
    };

    window.addEventListener("trigger-wipe", handleWipe);
    return () => window.removeEventListener("trigger-wipe", handleWipe);
  }, [lenis]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("main > [data-section]");
    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    sections.forEach(el => {
      const name = el.dataset.section ?? "";
      const meta = PATHS[name] ?? { path: `~/dhruv/${name}`, cmd: `cd ${name}/` };

      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          onEnter:     () => setStatusPath(meta.path),
          onEnterBack: () => setStatusPath(meta.path),
        })
      );
    });

    return () => triggers.forEach(t => t.kill());
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
        
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          style={{ display: "none" }}
          ref={layer1Ref}
        >
          <path
            fill="#050403"
            d="M 0 100 V 100 Q 50 100 100 100 V 100 z"
          />
        </svg>

        <div ref={textContainerRef} className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0">
          <div className="absolute w-64 h-64 bg-signal/20 rounded-full blur-[80px]" style={{ willChange: "transform" }} />
          
          <span ref={pathRef} className="font-mono text-xs tracking-[0.2em] uppercase text-signal relative z-10" />
          <span ref={cmdRef} className="font-mono text-3xl md:text-5xl font-bold tracking-tight text-ink relative z-10" style={{ textShadow: "0 0 30px rgba(240,160,0,0.5)" }} />
        </div>
      </div>

      <div className="fixed bottom-5 left-6 z-50 pointer-events-none select-none font-mono">
        <span className="text-xs text-signal/40">{statusPath}</span>
        <span className="text-xs ml-0.5 text-signal/70" style={{ opacity: blink ? 1 : 0, transition: "opacity 0.05s" }}>█</span>
      </div>
    </>
  );
}
