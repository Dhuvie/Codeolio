"use client";

import { useEffect } from "react";
import { LenisProvider } from "@/lib/lenis-provider";
import { killAll } from "@/lib/animations";

import Navbar from "@/components/Navbar";
import SignalLine from "@/components/SignalLine";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Achievements from "@/components/Achievements";
import Certifications from "@/components/Certifications";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";

import dynamic from "next/dynamic";

const GlobalCanvas = dynamic(() => import("@/components/GlobalCanvas"), { 
  ssr: false,
});

import FolderTransition from "@/components/FolderTransition";
import Preloader from "@/components/Preloader";
import MobileConsole from "@/components/MobileConsole";

export default function Home() {
  useEffect(() => {
    return () => {
      killAll();
    };
  }, []);

  return (
    <>
      <Preloader />
      <LenisProvider>
      <GlobalCanvas />
      <Navbar />
      <SignalLine />
      <ScrollProgress />
      <FolderTransition />
      <MobileConsole />

      <main>
        <div data-section="hero"><Hero /></div>
        <div data-section="about"><About /></div>
        <div data-section="experience"><Experience /></div>
        <div data-section="projects"><Projects /></div>
        <div data-section="achievements"><Achievements /></div>
        <div data-section="certifications"><Certifications /></div>
        <div data-section="skills"><Skills /></div>
        <div data-section="contact"><Contact /></div>
      </main>
    </LenisProvider>
    </>
  );
}
