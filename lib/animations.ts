"use client";


import { gsap, ScrollTrigger } from "@/lib/gsap-register";

export function prefersReducedMotion(): boolean {
  return false;
}

export function createHeroIntro(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ delay: 0.2 });

  if (prefersReducedMotion() || (typeof window !== "undefined" && window.innerWidth < 768)) {
    tl.set(container, { opacity: 1 });
    return tl;
  }

  const chars = container.querySelectorAll(".char");
  const words = container.querySelectorAll(".word");
  const subtexts = container.querySelectorAll(".hero-subtext");

  if (chars.length > 0) {
    tl.set(container, { opacity: 1 })
      .from(chars, {
        opacity: 0,
        y: 80,
        rotateX: -40,
        stagger: 0.025,
        duration: 0.8,
        ease: "expo.out",
      })
      .from(
        subtexts,
        {
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.6,
          ease: "expo.out",
        },
        "-=0.3"
      );
  } else if (words.length > 0) {
    tl.set(container, { opacity: 1 })
      .from(words, {
        opacity: 0,
        y: 60,
        stagger: 0.06,
        duration: 0.7,
        ease: "expo.out",
      })
      .from(
        subtexts,
        {
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.6,
          ease: "expo.out",
        },
        "-=0.3"
      );
  } else {
    tl.set(container, { opacity: 1 }).from(subtexts, {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.6,
      ease: "expo.out",
    });
  }

  return tl;
}

export function createStaggerEntrance(
  trigger: HTMLElement,
  items: HTMLElement[] | NodeListOf<Element>,
  options?: {
    from?: "bottom" | "left" | "right";
    stagger?: number;
    scrub?: boolean;
  }
): ScrollTrigger {
  const from = options?.from ?? "bottom";
  const stagger = options?.stagger ?? 0.05;

  if (prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, x: 0, y: 0 });
    return ScrollTrigger.create({ trigger });
  }

  const fromVars: gsap.TweenVars = {
    opacity: 0,
    y: from === "bottom" ? 40 : 0,
    x: from === "left" ? -40 : from === "right" ? 40 : 0,
    stagger,
    duration: 0.6,
    ease: "expo.out",
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
      ...(options?.scrub ? { scrub: 1 } : {}),
    },
  });

  tl.from(items, fromVars);

  return tl.scrollTrigger!;
}

export function animateCounter(
  el: HTMLElement,
  target: number,
  suffix: string = "",
  prefix: string = "",
  duration: number = 2
): ScrollTrigger {
  const obj = { val: 0 };

  if (prefersReducedMotion()) {
    el.textContent = `${prefix}${target}${suffix}`;
    return ScrollTrigger.create({ trigger: el });
  }

  const st = ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration,
        ease: "expo.out",
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
        },
      });
    },
  });

  return st;
}

export function createMagneticEffect(
  el: HTMLElement,
  strength: number = 0.3
): () => void {
  if (prefersReducedMotion()) return () => {};

  const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

  const handleMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    xTo(dx * strength);
    yTo(dy * strength);
  };

  const handleLeave = () => {
    xTo(0);
    yTo(0);
  };

  el.addEventListener("mousemove", handleMove);
  el.addEventListener("mouseleave", handleLeave);

  return () => {
    el.removeEventListener("mousemove", handleMove);
    el.removeEventListener("mouseleave", handleLeave);
    gsap.set(el, { x: 0, y: 0 });
  };
}

export function createTiltEffect(
  el: HTMLElement,
  maxDeg: number = 8
): () => void {
  if (prefersReducedMotion()) return () => {};

  const handleMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(el, {
      rotateY: x * maxDeg,
      rotateX: -y * maxDeg,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 800,
    });
  };

  const handleLeave = () => {
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });
  };

  el.addEventListener("mousemove", handleMove);
  el.addEventListener("mouseleave", handleLeave);

  return () => {
    el.removeEventListener("mousemove", handleMove);
    el.removeEventListener("mouseleave", handleLeave);
    gsap.set(el, { rotateX: 0, rotateY: 0 });
  };
}

export function killAll() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
  gsap.killTweensOf("*");
}
