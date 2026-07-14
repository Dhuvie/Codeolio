"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";
import MagneticButton from "./MagneticButton";
import ParticleField from "./ParticleField";

interface TerminalLine {
  text: string;
  type: "input" | "output" | "error" | "success" | "system";
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const bigTextRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<TerminalLine[]>([
    { text: "DHURUV_OS v2.1.0 Workstation Initialized.", type: "system" },
    { text: "Type 'help' or click quick chips below to list system commands.", type: "output" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isSelfDestructing, setIsSelfDestructing] = useState(false);
  const [destructCount, setDestructCount] = useState(5);

  // Mobile responsive terminal states
  const [isMobile, setIsMobile] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Matrix Rain State
  const [isMatrixActive, setIsMatrixActive] = useState(false);

  // RPG Game State
  const [gameState, setGameState] = useState<"shell" | "rpg">("shell");
  const [rpgRoom, setRpgRoom] = useState("start");
  const [rpgHp, setRpgHp] = useState(100);
  const [hasKey, setHasKey] = useState(false);
  const [defeatedBug, setDefeatedBug] = useState(false);

  // Sync theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLightMode(document.documentElement.classList.contains("light"));
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            setIsLightMode(document.documentElement.classList.contains("light"));
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  // GSAP scroll slide
  useEffect(() => {
    if (!sectionRef.current) return;

    if (bigTextRef.current && !prefersReducedMotion()) {
      gsap.to(bigTextRef.current, {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, isMatrixActive]);

  // Command parser
  const runCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Append user input line
    const userLineText = gameState === "rpg" ? `[RPG] guest@dhruv-os:~$ ${trimmed}` : `guest@dhruv-os:~$ ${trimmed}`;
    setHistory((prev) => [...prev, { text: userLineText, type: "input" }]);
    
    // Store in cmd history
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 1. RPG STATE GAME ENGINE PARSER
    if (gameState === "rpg") {
      handleRpgCommand(command, args);
      setInputVal("");
      return;
    }

    // 2. SHELL STATE PARSER
    switch (command) {
      case "help":
      case "?":
        setHistory((prev) => [
          ...prev,
          { text: "Available System Directives:", type: "system" },
          { text: "  about       - Summarize Dhruv's background", type: "output" },
          { text: "  projects    - List major visual and systems projects", type: "output" },
          { text: "  skills      - Print structural technical core skills", type: "output" },
          { text: "  contact     - Display communication and profile links", type: "output" },
          { text: "  neofetch    - Fetch virtual workstation system specs", type: "output" },
          { text: "  matrix      - Initialize matrix digital rain telemetry", type: "output" },
          { text: "  play        - Launch RPG mini-game text installation", type: "output" },
          { text: "  destruct    - Initiate mock emergency core override", type: "output" },
          { text: "  pacman      - Dijkstra short path arcade solver visual", type: "output" },
          { text: "  quant       - Compress values via adaptive quantization", type: "output" },
          { text: "  ledger      - Query distributed ledger stats & mine blocks", type: "output" },
          { text: "  fraud       - Stream UPI transaction scanner telemetry", type: "output" },
          { text: "  clear       - Clear CLI terminal screen buffer", type: "output" }
        ]);
        break;

      case "clear":
      case "cls":
        setHistory([]);
        break;

      case "about":
        setHistory((prev) => [
          ...prev,
          { text: "ABOUT DHRUV:", type: "system" },
          { text: "I am a Systems, Intelligence, and Web developer specializing in optimizing TinyML pipelines, constructing distributed backend microservices, and crafting premium, award-winning interactive UI frontends. My engineering principles balance mathematical clarity with high-fidelity tactile design.", type: "output" }
        ]);
        break;

      case "projects":
        setHistory((prev) => [
          ...prev,
          { text: "ACTIVE REGISTERS (Type 'info <num>' to inspect details, e.g., 'info 1'):", type: "system" },
          { text: "  [1] EdgeVision   - Lidar 3D point cloud scanner & scene editor.", type: "output" },
          { text: "  [2] AutoForge    - AutoML multi-stage container build orchestration.", type: "output" },
          { text: "  [3] Medisync     - Cardiac vital heartbeat vector node scanner.", type: "output" },
          { text: "  [4] Astra Ledger - Crystalline refracting transmission glass safe.", type: "output" },
          { text: "  [5] Pathfinder   - Interactive pacman-style Dijkstra path finder grid.", type: "output" }
        ]);
        break;

      case "info":
        const projNum = parseInt(args[0]);
        if (projNum === 1) {
          setHistory((prev) => [
            ...prev,
            { text: "EdgeVision: Scene-editor utilizing Gemini vision APIs. Maps bounding boxes of dynamic vectors onto a 3D R3F Canvas and overlays real-time lidar scanning beams.", type: "success" }
          ]);
        } else if (projNum === 2) {
          setHistory((prev) => [
            ...prev,
            { text: "AutoForge: Automates machine learning model compiling inside isolated Docker sandboxes, spinning up container nodes dynamically and linking telemetry flows.", type: "success" }
          ]);
        } else if (projNum === 3) {
          setHistory((prev) => [
            ...prev,
            { text: "Medisync: Captures patient vital indexes, outputting real-time risk scores. Animated using R3F spring nodes synced to scroll-bound ECG lines.", type: "success" }
          ]);
        } else if (projNum === 4) {
          setHistory((prev) => [
            ...prev,
            { text: "Astra Ledger: Refracting glass vault in light mode, iron safe box in dark mode. Intersecting cursor sweeps rotate locking notch dials to open crystal core.", type: "success" }
          ]);
        } else if (projNum === 5) {
          setHistory((prev) => [
            ...prev,
            { text: "Dijkstra Pathfinder: Text arcade mesh where a custom pathfinding algorithm solves route trajectories toward target coordinates inside grid systems.", type: "success" }
          ]);
        } else {
          setHistory((prev) => [...prev, { text: "Usage: info <1-5>", type: "error" }]);
        }
        break;

      case "skills":
        setHistory((prev) => [
          ...prev,
          { text: "CORE TECH STACK:", type: "system" },
          { text: "  Languages  : C++, Python, TypeScript, Java, SQL, GLSL Shaders", type: "output" },
          { text: "  AI / ML    : PyTorch, TensorFlow, Scikit-Learn, Genkit, Gemini API", type: "output" },
          { text: "  Web Engine : React, Next.js, Node.js, Express.js, Socket.IO, Framer", type: "output" },
          { text: "  Databases  : PostgreSQL, MongoDB, Redis Cache, Prisma ORM, MySQL", type: "output" },
          { text: "  Operations : Docker Containers, Actions CI/CD MLOps, Linux Systems", type: "output" }
        ]);
        break;

      case "contact":
        setHistory((prev) => [
          ...prev,
          { text: "COMMUNICATION ENVELOPE:", type: "system" },
          { text: "  Email    : dhruvnarayanbajaj@gmail.com", type: "output" },
          { text: "  GitHub   : https://github.com/Dhuvie", type: "output" },
          { text: "  LinkedIn : https://linkedin.com/in/dhruv-bajaj-a379b827a", type: "output" }
        ]);
        break;

      case "neofetch":
        setHistory((prev) => [
          ...prev,
          { text: "      /\\_/\\     Dhruv Bajaj", type: "success" },
          { text: "     ( o.o )    ----------------------------", type: "success" },
          { text: "      > ^ <     OS      : Dhruv OS v1.0", type: "success" },
          { text: "                Kernel  : dhruvie-neural-core-x64", type: "success" },
          { text: "                Shell   : dhruvie-sh v1.0", type: "success" },
          { text: "                CPU     : Brain-Wave X1 (16 Cores)", type: "success" },
          { text: "                GPU     : WebGL Shader Emissive Material", type: "success" },
          { text: "                Memory  : 16 GB Cache / 64 GB Storage", type: "success" },
          { text: "                Uptime  : 342 days, 12 hours", type: "success" }
        ]);
        break;

      case "matrix":
        setIsMatrixActive(true);
        setHistory((prev) => [...prev, { text: "INITIALIZING TELEMETRY STREAM...", type: "system" }]);
        setTimeout(() => {
          setIsMatrixActive(false);
          setHistory((prev) => [...prev, { text: "TELEMETRY CONNECTIVITY RESUMED.", type: "success" }]);
        }, 5000);
        break;

      case "play":
        setGameState("rpg");
        setRpgRoom("start");
        setRpgHp(100);
        setHasKey(false);
        setDefeatedBug(false);
        setHistory((prev) => [
          ...prev,
          { text: "==================================================", type: "system" },
          { text: "  DHURUV'S TEXT DUNGEON ADVENTURE: CORE ESCAPE    ", type: "system" },
          { text: "==================================================", type: "system" },
          { text: "You stand in a cold, metallic server room. Racks of servers hum all around you. There is a locked exit door to the NORTH.", type: "output" },
          { text: "Commands: 'north', 'search', 'stat', 'quit'.", type: "system" }
        ]);
        break;

      case "destruct":
        setIsSelfDestructing(true);
        setDestructCount(5);
        setHistory((prev) => [...prev, { text: "WARNING: SELF-DESTRUCT INITIATED. OVERRIDE CORE CODE RETROSPECTIVE...", type: "error" }]);
        break;

      case "pacman":
        setHistory((prev) => [
          ...prev,
          { text: "PAC-MAN DIJKSTRA SOLVER CORE:", type: "system" },
          { text: "  Loading 6x6 Dijkstra Grid System...", type: "output" },
          { text: "  [START] (-0.9, -0.9) ---> [TARGET] (0.0, 0.0)", type: "output" },
          { text: "  o---o---o---o---o", type: "output" },
          { text: "  | ᗧ . . . . ●   |  // Solver traversing coordinates", type: "success" },
          { text: "  o---o---o---o---o", type: "output" },
          { text: "  Path Resolved: [-0.9,-0.9] -> [-0.9,0.9] -> [0.0,0.9] -> [0.0,0.0]", type: "success" },
          { text: "  Execution Time: 0.12ms // 7 Nodes Explored.", type: "success" }
        ]);
        break;

      case "quant":
        if (args.length === 0) {
          setHistory((prev) => [
            ...prev,
            { text: "Usage: quant <num1> <num2> ...", type: "system" },
            { text: "Simulate adaptive weight quantization (snaps FP32 values to nearest 0.4 grid resolution).", type: "output" }
          ]);
        } else {
          const results = args.map(arg => {
            const val = parseFloat(arg);
            if (isNaN(val)) return `${arg} (Invalid Number)`;
            const quantized = Math.round(val * 2.5) / 2.5;
            return `${val} -> [${quantized.toFixed(1)}]`;
          });
          setHistory((prev) => [
            ...prev,
            { text: "ADAPTIVE WEIGHT COMPRESSION COMPLETED:", type: "system" },
            ...results.map(r => ({ text: `  Quantized Float: ${r}`, type: "success" as const })),
            { text: "Compression Ratio: 4:1 (FP32 -> INT8 Snapped Lattice Grid)", type: "success" }
          ]);
        }
        break;

      case "ledger":
        if (args[0] === "mine") {
          setHistory((prev) => [
            ...prev,
            { text: "MINING NEW LEDGER BLOCK ON DISTRIBUTED CHAIN...", type: "system" },
            { text: "  Difficulty Target: 0000ffffffffffff...", type: "output" },
            { text: "  Hash Solved: 0000a42f8c12b90d715a...", type: "success" },
            { text: "  Block #142855 committed. Validator reward: +0.25 ASTRA.", type: "success" }
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { text: "ASTRA LEDGER DISTRIBUTED SYSTEMS:", type: "system" },
            { text: "  Total Blocks : 142,854", type: "output" },
            { text: "  Active Nodes : 9 Validators", type: "output" },
            { text: "  Consensus    : Proof-of-Trust (PoT)", type: "output" },
            { text: "  Vault Status : LOCKED // Type 'secret crystal' to retrieve validation token.", type: "error" },
            { text: "  Available Commands: 'ledger mine'", type: "system" }
          ]);
        }
        break;

      case "fraud":
        setHistory((prev) => [
          ...prev,
          { text: "INITIALIZING UPI TRANSACTION SCANNERS...", type: "system" },
          { text: "  Scanning real-time network streams...", type: "output" },
          { text: "  TX_892A: $18.40  (Standard User Node) -> [SAFE]", type: "success" },
          { text: "  TX_892B: $220.00 (Standard User Node) -> [SAFE]", type: "success" },
          { text: "  TX_892C: $8,990.00 (Anomalous Flow - Botnet Speed) -> [BLOCKED]", type: "error" },
          { text: "  Deflection Status: Red Threat Nodes routed to side quarantine gates.", type: "error" }
        ]);
        break;

      case "vault":
      case "secret":
        if (args[0] === "crystal") {
          setHistory((prev) => [
            ...prev,
            { text: "ACCESS GRANTED. PINK CRYSTAL KEY DETECTED.", type: "success" },
            { text: "DHUVIE_VAULT_UNLOCK_CODE: #F5A623 (Crystalline Lockbox)", type: "success" }
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { text: "ASTRA VAULT LOCK: Awaiting Secret Key (Usage: secret <key>).", type: "error" },
            { text: "Hint: Complete the dungeon game (type 'play') to retrieve the key.", type: "system" }
          ]);
        }
        break;

      case "sudo":
        if (args[0] === "rm" && args[1] === "-rf") {
          setHistory((prev) => [
            ...prev,
            { text: "guest is not in the sudoers file. This incident will be reported.", type: "error" }
          ]);
        } else {
          setHistory((prev) => [...prev, { text: "Authentication required for admin credentials.", type: "error" }]);
        }
        break;

      default:
        setHistory((prev) => [
          ...prev,
          { text: `Command not found: ${command}. Type 'help' for system guide.`, type: "error" }
        ]);
        break;
    }
    setInputVal("");
  };

  // 3. TEXT DUNGEON crawler game logic
  const handleRpgCommand = (cmd: string, args: string[]) => {
    switch (cmd) {
      case "quit":
      case "exit":
        setGameState("shell");
        setHistory((prev) => [...prev, { text: "Returned to main shell interface.", type: "system" }]);
        break;

      case "stat":
        setHistory((prev) => [
          ...prev,
          { text: `PLAYER STATUS: HP ${rpgHp}/100 | KEY: ${hasKey ? "FOUND" : "MISSING"} | BUG: ${defeatedBug ? "DEFEATED" : "ACTIVE"}`, type: "system" }
        ]);
        break;

      case "search":
        if (rpgRoom === "start") {
          setHistory((prev) => [
            ...prev,
            { text: "You search the server racks. Behind a bundle of ethernet cables, you find a small glowing corridor leading EAST.", type: "success" },
            { text: "New direction unlocked: 'east'.", type: "system" }
          ]);
          setRpgRoom("start_searched");
        } else if (rpgRoom === "corridor" && !hasKey) {
          if (!defeatedBug) {
            setHistory((prev) => [
              ...prev,
              { text: "You search around, but the AI Bug blocker jumps in front of you, preventing you from searching! Type 'fight' to engage.", type: "error" }
            ]);
          } else {
            setHistory((prev) => [
              ...prev,
              { text: "You search the wreckage of the AI Bug blocker. Under a circuit board, you find the CRYSTAL KEY!", type: "success" }
            ]);
            setHasKey(true);
          }
        } else {
          setHistory((prev) => [...prev, { text: "You search, but find nothing of interest here.", type: "output" }]);
        }
        break;

      case "east":
        if (rpgRoom === "start_searched" || rpgRoom === "corridor") {
          setRpgRoom("corridor");
          setHistory((prev) => [
            ...prev,
            { text: "You follow the corridor into a dimly lit maintenance tunnel. Floating in the middle is a giant red-glowing AI Bug blocker block! It has 50 HP.", type: "output" },
            { text: "Commands: 'fight', 'west', 'stat'.", type: "system" }
          ]);
        } else {
          setHistory((prev) => [...prev, { text: "You cannot go east from here.", type: "error" }]);
        }
        break;

      case "west":
        if (rpgRoom === "corridor") {
          setRpgRoom("start_searched");
          setHistory((prev) => [
            ...prev,
            { text: "You retreat west back to the server room.", type: "output" }
          ]);
        } else {
          setHistory((prev) => [...prev, { text: "You cannot go west from here.", type: "error" }]);
        }
        break;

      case "fight":
        if (rpgRoom === "corridor") {
          if (defeatedBug) {
            setHistory((prev) => [...prev, { text: "The bug is already wreckage.", type: "output" }]);
          } else {
            // Fight sequence
            const dmgUser = Math.floor(Math.random() * 20) + 15;
            const dmgBug = Math.floor(Math.random() * 15) + 5;
            const newHp = Math.max(0, rpgHp - dmgBug);
            setRpgHp(newHp);

            if (newHp === 0) {
              setHistory((prev) => [
                ...prev,
                { text: `The AI Bug zaps you for ${dmgBug} damage. You have collapsed!`, type: "error" },
                { text: "GAME OVER. Restarting dungeon...", type: "error" }
              ]);
              setRpgRoom("start");
              setRpgHp(100);
            } else {
              setHistory((prev) => [
                ...prev,
                { text: `You throw a compile exception at the AI Bug! You deal ${dmgUser} damage. The Bug zaps you back for ${dmgBug} HP.`, type: "success" },
                { text: "You defeated the AI Bug! It explodes into capacitors.", type: "success" }
              ]);
              setDefeatedBug(true);
            }
          }
        } else {
          setHistory((prev) => [...prev, { text: "There is nothing to fight here.", type: "error" }]);
        }
        break;

      case "north":
        if (rpgRoom === "start" || rpgRoom === "start_searched") {
          if (hasKey) {
            setHistory((prev) => [
              ...prev,
              { text: "You insert the Crystal Key into the exit door console. The spring lock clicks, and the door opens into the CORE VAULT!", type: "success" },
              { text: "Written on the terminal screen inside is a hidden key:", type: "success" },
              { text: ">> ASTRA_LEDGER_CODE = 'crystal' <<", type: "success" },
              { text: "Type 'secret crystal' in the main terminal to claim your prize! Exiting game...", type: "system" }
            ]);
            setGameState("shell");
          } else {
            setHistory((prev) => [
              ...prev,
              { text: "The door is locked tight. It requires a physical crystal key to unlock.", type: "error" }
            ]);
          }
        } else {
          setHistory((prev) => [...prev, { text: "You cannot go north from here.", type: "error" }]);
        }
        break;

      default:
        setHistory((prev) => [
          ...prev,
          { text: `Unknown RPG action: ${cmd}. Type 'stat' or 'quit'.`, type: "error" }
        ]);
        break;
    }
  };

  // Self-Destruct Count Effect
  useEffect(() => {
    if (!isSelfDestructing) return;
    if (destructCount === 0) {
      setIsSelfDestructing(false);
      setHistory((prev) => [
        ...prev,
        { text: "BOOM! Just kidding. Dhruv's workstation is structurally indestructible.", type: "success" }
      ]);
      return;
    }

    const timer = setTimeout(() => {
      setHistory((prev) => [...prev, { text: `T-MINUS: ${destructCount}...`, type: "error" }]);
      setDestructCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSelfDestructing, destructCount]);

  // Command History key cycling (Up/Down Arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInputVal("");
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(inputVal);
  };

  const executeChipCommand = (cmd: string) => {
    runCommand(cmd);
    inputRef.current?.focus();
  };

  return (
    <section ref={sectionRef} id="contact" className="relative overflow-hidden py-32 border-b border-signal/15">
      <ParticleField count={50} connectionDist={90} />

      <div 
        className={`absolute inset-0 bg-gradient-to-t pointer-events-none z-0 transition-all duration-300
          ${isLightMode 
            ? "from-white via-white/50 to-transparent" 
            : "from-[#020202] via-[#020202]/50 to-transparent"
          }
        `} 
      />
      <div className="absolute inset-0 grid-dots opacity-15 pointer-events-none z-0" />

      {/* Background Connect Title */}
      <div
        ref={bigTextRef}
        className="absolute bottom-0 left-0 right-0 select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <p
          className="font-display font-bold text-center whitespace-nowrap"
          style={{
            fontSize: "clamp(5rem, 18vw, 20rem)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(240,160,0,0.06)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          CONNECT
        </p>
      </div>

      <div className="section-container pb-24 relative z-10">
        <p className="section-label">Contact</p>

        <div className="max-w-2xl">
          <h2
            className="contact-item font-display font-semibold mb-4 text-ink transition-colors duration-300"
            style={{ fontSize: "var(--font-size-h2)" }}
          >
            Let&apos;s <span className="gradient-text-animated">connect</span>
          </h2>

          <p className="contact-item text-ink/90 font-medium drop-shadow-md mb-8 leading-relaxed">
            Open to collaborating on innovative projects and exploring new
            opportunities. Execute commands in the terminal shell below or send an email directly.
          </p>

          <div className="contact-item flex items-center gap-3 mb-8 p-4 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md w-fit select-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="ping-ripple absolute inline-flex h-full w-full rounded-full bg-signal" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal" />
            </span>
            <span className="font-util text-xs tracking-widest uppercase text-signal drop-shadow-sm font-bold">
              Currently Available for Internship / Freelance
            </span>
          </div>

          {/* SKEUOMORPHIC retro terminal console window */}
          <div 
            className={`contact-item mb-8 rounded-xl border font-mono text-sm relative flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300
              ${isLightMode 
                ? "bg-[#efebe4] border-zinc-300 text-zinc-800 shadow-[0_15px_30px_rgba(0,0,0,0.06)]" 
                : "bg-black/95 border-signal/20 text-[#00ffcc] shadow-[0_15px_40px_rgba(240,160,0,0.04)]"
              }
              ${isSelfDestructing ? "animate-[shake_0.2s_infinite]" : ""}
            `}
          >
            {/* Holographic grid scanline filter */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,255,204,0.015)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-10 animate-scanline" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)] pointer-events-none z-10" />

            {/* Window Top title bar with circle tags */}
            <div className="h-10 bg-surface/85 border-b border-subtle flex items-center justify-between px-4 select-none z-20">
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3355]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffaa00]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ffcc]" />
              </div>
              <div className="text-[10px] text-ink/40 uppercase tracking-wider font-bold">
                dhruvnarayan@workstation:~
              </div>
              <div className="w-12" />
            </div>

            {/* Terminal output stream console */}
            <div 
              ref={chatContainerRef} 
              className="flex-grow p-5 overflow-y-auto max-h-[260px] min-h-[220px] space-y-2.5 pr-2 z-20 relative select-text"
            >
              {isMatrixActive ? (
                // 4. MATRIX DIGITAL CODE STREAM OVERLAY
                <div className="w-full text-center py-8 space-y-2 font-bold animate-[pulse_1s_infinite]">
                  <p>1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0</p>
                  <p>0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1</p>
                  <p>1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0</p>
                  <p>0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1</p>
                  <p className="text-white">STREAMING SECTORS CORRELATION...</p>
                </div>
              ) : (
                history.map((line, idx) => {
                  let lineClass = "";
                  if (line.type === "input") lineClass = isLightMode ? "text-zinc-900 font-bold" : "text-white font-bold";
                  else if (line.type === "error") lineClass = "text-red-500 font-bold";
                  else if (line.type === "success") lineClass = "text-amber-500 font-bold";
                  else if (line.type === "system") lineClass = isLightMode ? "text-zinc-500 font-bold" : "text-signal font-bold";
                  else lineClass = isLightMode ? "text-zinc-700" : "text-[#00ffcc]/85";

                  return (
                    <div key={idx} className={`text-xs whitespace-pre-wrap ${lineClass}`}>
                      {line.text}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick pre-seeded CLI chips */}
            <div className="flex flex-wrap gap-2 px-5 pb-4 select-none z-20">
              <button 
                onClick={() => executeChipCommand("about")}
                className="text-[9px] text-[#00ffcc] border border-[#00ffcc]/20 rounded px-2 py-0.5 bg-[#00ffcc]/5 hover:bg-[#00ffcc]/15 transition-all cursor-pointer"
                style={{ color: isLightMode ? "#008888" : undefined, borderColor: isLightMode ? "#008888/20" : undefined }}
              >
                about
              </button>
              <button 
                onClick={() => executeChipCommand("projects")}
                className="text-[9px] text-[#00ffcc] border border-[#00ffcc]/20 rounded px-2 py-0.5 bg-[#00ffcc]/5 hover:bg-[#00ffcc]/15 transition-all cursor-pointer"
                style={{ color: isLightMode ? "#008888" : undefined, borderColor: isLightMode ? "#008888/20" : undefined }}
              >
                projects
              </button>
              <button 
                onClick={() => executeChipCommand("skills")}
                className="text-[9px] text-[#00ffcc] border border-[#00ffcc]/20 rounded px-2 py-0.5 bg-[#00ffcc]/5 hover:bg-[#00ffcc]/15 transition-all cursor-pointer"
                style={{ color: isLightMode ? "#008888" : undefined, borderColor: isLightMode ? "#008888/20" : undefined }}
              >
                skills
              </button>
              <button 
                onClick={() => executeChipCommand("play")}
                className="text-[9px] text-amber-500 border border-amber-500/20 rounded px-2 py-0.5 bg-amber-500/5 hover:bg-amber-500/15 transition-all cursor-pointer"
              >
                play_game
              </button>
              <button 
                onClick={() => executeChipCommand("neofetch")}
                className="text-[9px] text-zinc-500 border border-zinc-700/40 rounded px-2 py-0.5 bg-zinc-900/10 hover:bg-zinc-800/20 transition-all cursor-pointer"
                style={{ color: isLightMode ? "#555" : undefined }}
              >
                neofetch
              </button>
            </div>

            {/* Input CLI interface line */}
            <form 
              onSubmit={handleFormSubmit} 
              className="flex items-center gap-2 border-t border-subtle p-3.5 bg-surface/40 z-20"
            >
              <span className="text-signal font-bold select-none text-[10px] md:text-xs">
                {gameState === "rpg" ? "[RPG] guest@dhruv-os:~$" : "guest@dhruv-os:~$"}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onKeyDown={handleKeyDown}
                onChange={(e) => setInputVal(e.target.value)}
                className={`flex-grow bg-transparent outline-none text-xs font-mono caret-signal placeholder-ink/20
                  ${isLightMode ? "text-zinc-800" : "text-white"}
                `}
                placeholder={gameState === "rpg" ? "type game move..." : "type command..."}
              />
              <button 
                type="submit" 
                className="text-[9px] border border-subtle px-2 py-1 rounded bg-surface hover:bg-ink hover:text-surface transition-all cursor-pointer font-bold select-none uppercase tracking-widest text-ink/75"
              >
                execute
              </button>
            </form>
          </div>

          {/* Social communication grids */}
          <div className="contact-item flex flex-wrap gap-4 mb-12 select-none">
            <MagneticButton href="mailto:dhruvnarayanbajaj@gmail.com" variant="primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4l6 4 6-4M2 4v8h12V4H2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Email Me
            </MagneticButton>

            <MagneticButton href="https://github.com/Dhuvie" variant="secondary" external>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </MagneticButton>

            <MagneticButton href="https://linkedin.com/in/dhruv-bajaj-a379b827a" variant="secondary" external>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </MagneticButton>
          </div>
        </div>

      </div>
    </section>
  );
}
