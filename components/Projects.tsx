"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SplitTextReveal from "./SplitTextReveal";
import MagneticButton from "./MagneticButton";

// Bypasses TypeScript SVG/R3F HTML <line> tag conflict
const Line = "line" as any;

// ===================================================
// Premium Glowing Concept-Aligned 3D Simulations
// ===================================================

// 1. EdgeVision: 3D Lidar Vector Scan Field
function EdgeVisionVisual({ isLightMode }: { isLightMode?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const scanPlaneRef = useRef<THREE.Mesh>(null);
  const scannerLinesRef = useRef<THREE.LineSegments>(null);
  
  const [points] = useState(() => {
    const pts = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.2 + Math.pow(Math.random(), 0.5) * 1.1;
      pts[i * 3] = Math.cos(angle) * radius;
      pts[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      pts[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pts;
  });

  const colors = useMemo(() => {
    const cols = new Float32Array(300 * 3);
    cols.fill(isLightMode ? 0.75 : 0.2);
    return cols;
  }, [isLightMode]);

  const scannerLineGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(300 * 2 * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    return geom;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const planeY = Math.sin(t * 1.8) * 1.1;
    if (scanPlaneRef.current) {
      scanPlaneRef.current.position.y = planeY;
    }
    
    if (pointsRef.current && scannerLinesRef.current) {
      pointsRef.current.rotation.y = t * 0.15;
      scannerLinesRef.current.rotation.y = pointsRef.current.rotation.y;
      
      const geom = pointsRef.current.geometry;
      const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
      const colAttr = geom.getAttribute("color") as THREE.BufferAttribute;
      
      const lineGeom = scannerLinesRef.current.geometry;
      const linePosAttr = lineGeom.getAttribute("position") as THREE.BufferAttribute;
      const linePos = linePosAttr.array as Float32Array;
      
      if (posAttr && colAttr) {
        const pos = posAttr.array as Float32Array;
        const col = colAttr.array as Float32Array;
        let lineIndex = 0;
        
        for (let i = 0; i < 300; i++) {
          const py = pos[i * 3 + 1];
          const dist = Math.abs(py - planeY);
          
          if (dist < 0.18) {
            col[i * 3] = 0.0;
            col[i * 3 + 1] = isLightMode ? 0.53 : 1.0;
            col[i * 3 + 2] = isLightMode ? 0.8 : 0.8;
            
            linePos[lineIndex * 6] = 0;
            linePos[lineIndex * 6 + 1] = -1.2;
            linePos[lineIndex * 6 + 2] = 0;
            
            linePos[lineIndex * 6 + 3] = pos[i * 3];
            linePos[lineIndex * 6 + 4] = pos[i * 3 + 1];
            linePos[lineIndex * 6 + 5] = pos[i * 3 + 2];
            lineIndex++;
          } else {
            col[i * 3] = isLightMode ? 0.75 : 0.05;
            col[i * 3 + 1] = isLightMode ? 0.75 : 0.25;
            col[i * 3 + 2] = isLightMode ? 0.8 : 0.25;
          }
        }
        colAttr.needsUpdate = true;
        linePosAttr.needsUpdate = true;
        lineGeom.setDrawRange(0, lineIndex * 2);
      }
    }
  });

  return (
    <group>
      <mesh ref={scanPlaneRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} emissive={isLightMode ? "#0088cc" : "#00ffcc"} emissiveIntensity={isLightMode ? 0.8 : 1.8} transparent opacity={isLightMode ? 0.08 : 0.12} wireframe />
      </mesh>
      
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.5, 0.04, 16, 64]} />
        <meshStandardMaterial color={isLightMode ? "#0088cc" : "#f0a000"} metalness={0.9} roughness={0.1} emissive={isLightMode ? undefined : "#f0a000"} emissiveIntensity={0.2} />
      </mesh>
      
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={300} array={points} itemSize={3} args={[points, 3]} />
          <bufferAttribute attach="attributes-color" count={300} array={colors} itemSize={3} args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.055} vertexColors sizeAttenuation transparent opacity={0.95} />
      </points>

      <lineSegments ref={scannerLinesRef} geometry={scannerLineGeom}>
        <lineBasicMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} transparent opacity={isLightMode ? 0.25 : 0.35} blending={isLightMode ? THREE.NormalBlending : THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

// 2. AutoForge: MLOps Compile Helix Reactor
function AutoForgeVisual({ isLightMode }: { isLightMode?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const linkLinesRef = useRef<THREE.LineSegments>(null);
  const [compiling, setCompiling] = useState(false);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < 120; i++) {
      const ratio = i / 120;
      const angle = ratio * Math.PI * 8;
      const isStrandA = i % 2 === 0;
      const finalAngle = isStrandA ? angle : angle + Math.PI;
      const radius = 0.72;
      const y = (ratio - 0.5) * 2.4;
      data.push({
        angle: finalAngle,
        radius,
        baseY: y,
        isStrandA,
        color: isLightMode 
          ? (isStrandA ? "#0088cc" : "#ff5500") 
          : (isStrandA ? "#f0a000" : "#00ffcc")
      });
    }
    return data;
  }, [isLightMode]);

  const connectionLinesGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(60 * 2 * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    return geom;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speedMultiplier = compiling ? 6.2 : 1.0;
    
    if (groupRef.current && linkLinesRef.current) {
      groupRef.current.rotation.y = t * 0.7 * speedMultiplier;
      groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.08;
      linkLinesRef.current.rotation.y = groupRef.current.rotation.y;
      linkLinesRef.current.rotation.z = groupRef.current.rotation.z;
      
      const children = groupRef.current.children;
      const lineGeom = linkLinesRef.current.geometry;
      const linePosAttr = lineGeom.getAttribute("position") as THREE.BufferAttribute;
      const linePos = linePosAttr.array as Float32Array;
      
      let lineIdx = 0;
      
      particles.forEach((p, i) => {
        const mesh = children[i] as THREE.Mesh;
        if (mesh) {
          let y = p.baseY + (t * 0.2 * speedMultiplier) % 2.4;
          if (y > 1.2) y -= 2.4;
          
          const rad = p.radius + (compiling ? Math.sin(t * 30 + i) * 0.08 : Math.sin(t * 2.5 + i) * 0.03);
          const px = Math.cos(p.angle + t * 0.5 * speedMultiplier) * rad;
          const pz = Math.sin(p.angle + t * 0.5 * speedMultiplier) * rad;
          mesh.position.set(px, y, pz);
          
          if (p.isStrandA && i < 118) {
            const partnerMesh = children[i + 1] as THREE.Mesh;
            if (partnerMesh && lineIdx < 60) {
              linePos[lineIdx * 6] = px;
              linePos[lineIdx * 6 + 1] = y;
              linePos[lineIdx * 6 + 2] = pz;
              
              linePos[lineIdx * 6 + 3] = partnerMesh.position.x;
              linePos[lineIdx * 6 + 4] = partnerMesh.position.y;
              linePos[lineIdx * 6 + 5] = partnerMesh.position.z;
              lineIdx++;
            }
          }
        }
      });
      linePosAttr.needsUpdate = true;
      lineGeom.setDrawRange(0, lineIdx * 2);
    }
    
    if (coreRef.current) {
      const scale = 1.0 + (compiling ? Math.sin(t * 45) * 0.2 : Math.sin(t * 3) * 0.06);
      coreRef.current.scale.setScalar(scale);
      coreRef.current.rotation.x = t * 1.5;
      coreRef.current.rotation.z = t * 0.8;
    }
  });

  return (
    <group 
      onClick={(e) => {
        e.stopPropagation();
        setCompiling(true);
        setTimeout(() => setCompiling(false), 2000);
      }}
    >
      <group ref={groupRef}>
        {particles.map((p, i) => (
          <mesh key={i} castShadow>
            <sphereGeometry args={[compiling ? 0.045 : 0.032, 8, 8]} />
            <meshStandardMaterial color={p.color} emissive={isLightMode ? undefined : p.color} emissiveIntensity={compiling ? 1.8 : 0.4} />
          </mesh>
        ))}
      </group>
      
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
        <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} transparent opacity={compiling ? 0.28 : 0.08} wireframe />
      </mesh>
      
      <lineSegments ref={linkLinesRef} geometry={connectionLinesGeom}>
        <lineBasicMaterial color={compiling ? (isLightMode ? "#ff5500" : "#ff9900") : (isLightMode ? "#0088cc" : "#00ffcc")} transparent opacity={compiling ? 0.5 : 0.2} />
      </lineSegments>
      
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={isLightMode ? "#0088cc" : "#f0a000"} metalness={isLightMode ? 0.2 : 0.9} roughness={0.1} emissive={isLightMode ? undefined : "#f0a000"} emissiveIntensity={compiling ? 3.0 : 0.5} />
      </mesh>
    </group>
  );
}

// 3. Medisync: Generative 3D ECG Heart Mesh
function MedisyncVisual({ isLightMode }: { isLightMode?: boolean }) {
  const heartGroupRef = useRef<THREE.Group>(null);
  const ecgRef = useRef<THREE.Line>(null);
  const connectionsRef = useRef<THREE.LineSegments>(null);
  
  const heartNodes = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const x = 0.8 * Math.sin(angle) * Math.sin(angle) * Math.sin(angle);
      const y = 0.7 * Math.cos(angle) - 0.25 * Math.cos(2 * angle) - 0.12 * Math.cos(3 * angle);
      const z = Math.cos(phi) * 0.35 * Math.sin(angle);
      pts.push(new THREE.Vector3(x, y + 0.15, z));
    }
    return pts;
  }, []);

  const connectionsGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(90 * 6 * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    return geom;
  }, []);

  const ecgPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 60; i++) {
      pts.push(new THREE.Vector3(i * 0.05 - 1.5, -0.9, 0));
    }
    return pts;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cycle = (t * 1.1) % 1.0;
    let scaleX = 1.0, scaleY = 1.0;
    
    if (cycle < 0.12) {
      const p = cycle / 0.12;
      scaleX = 1.0 + Math.sin(p * Math.PI) * 0.15;
      scaleY = 1.0 - Math.sin(p * Math.PI) * 0.08;
    } else if (cycle >= 0.16 && cycle < 0.28) {
      const p = (cycle - 0.16) / 0.12;
      scaleX = 1.0 + Math.sin(p * Math.PI) * 0.12;
      scaleY = 1.0 - Math.sin(p * Math.PI) * 0.06;
    }

    if (heartGroupRef.current && connectionsRef.current) {
      heartGroupRef.current.scale.set(scaleX, scaleY, scaleX);
      heartGroupRef.current.rotation.y = t * 0.5;
      connectionsRef.current.rotation.y = heartGroupRef.current.rotation.y;
      connectionsRef.current.scale.set(scaleX, scaleY, scaleX);
      
      const children = heartGroupRef.current.children;
      const lineGeom = connectionsRef.current.geometry;
      const linePosAttr = lineGeom.getAttribute("position") as THREE.BufferAttribute;
      const linePos = linePosAttr.array as Float32Array;
      
      let lineIdx = 0;
      
      for (let i = 0; i < children.length; i++) {
        const mesh = children[i] as THREE.Mesh;
        if (mesh) {
          const base = heartNodes[i];
          const offset = i * 0.2;
          const wobble = Math.sin(t * 3.0 + offset) * 0.02;
          mesh.position.set(base.x, base.y + wobble, base.z);
          
          for (let j = i + 1; j < Math.min(i + 4, children.length); j++) {
            const partner = children[j] as THREE.Mesh;
            if (partner && lineIdx < 270) {
              linePos[lineIdx * 6] = mesh.position.x;
              linePos[lineIdx * 6 + 1] = mesh.position.y;
              linePos[lineIdx * 6 + 2] = mesh.position.z;
              
              linePos[lineIdx * 6 + 3] = partner.position.x;
              linePos[lineIdx * 6 + 4] = partner.position.y;
              linePos[lineIdx * 6 + 5] = partner.position.z;
              lineIdx++;
            }
          }
        }
      }
      linePosAttr.needsUpdate = true;
      lineGeom.setDrawRange(0, lineIdx * 2);
    }

    if (ecgRef.current) {
      const geom = ecgRef.current.geometry;
      const pts = ecgPoints.map((pt, idx) => {
        const x = pt.x;
        let y = -0.9;
        const phase = (t * 2.2 + idx * 0.12) % Math.PI;
        if (phase < 0.12) {
          y = -0.9 + Math.sin((phase / 0.12) * Math.PI) * 0.08;
        } else if (phase >= 0.16 && phase < 0.20) {
          y = -0.9 - Math.sin(((phase - 0.16) / 0.04) * Math.PI) * 0.08;
        } else if (phase >= 0.20 && phase < 0.26) {
          y = -0.9 + Math.sin(((phase - 0.20) / 0.06) * Math.PI) * 0.65;
        } else if (phase >= 0.26 && phase < 0.32) {
          y = -0.9 - Math.sin(((phase - 0.26) / 0.06) * Math.PI) * 0.18;
        } else if (phase >= 0.38 && phase < 0.54) {
          y = -0.9 + Math.sin(((phase - 0.38) / 0.16) * Math.PI) * 0.12;
        }
        return new THREE.Vector3(x, y, 0);
      });
      geom.setFromPoints(pts);
    }
  });

  return (
    <group>
      <group ref={heartGroupRef}>
        {heartNodes.map((base, i) => (
          <mesh key={i} position={[base.x, base.y, base.z]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshStandardMaterial color={isLightMode ? "#cc0022" : "#ff2244"} emissive={isLightMode ? undefined : "#ff1111"} emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
      
      <lineSegments ref={connectionsRef} geometry={connectionsGeom}>
        <lineBasicMaterial color={isLightMode ? "#cc0022" : "#ff3333"} transparent opacity={isLightMode ? 0.16 : 0.25} />
      </lineSegments>

      <Line ref={ecgRef}>
        <bufferGeometry />
        <lineBasicMaterial color={isLightMode ? "#00aa22" : "#00ff66"} linewidth={2.5} transparent opacity={0.9} />
      </Line>
    </group>
  );
}

// 4. Card-Orchestration: 3D Spring-Mass Network Simulation
function CardOrchVisual({ isLightMode }: { isLightMode?: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const linksRef = useRef<THREE.LineSegments>(null);
  
  const gridDim = 8;
  const spacing = 0.25;
  const nodes = useMemo(() => {
    const list = [];
    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        list.push({
          x: (c - (gridDim - 1) / 2) * spacing,
          y: (r - (gridDim - 1) / 2) * spacing,
          z: 0,
          velocity: 0,
          disp: 0
        });
      }
    }
    return list;
  }, []);

  const linksGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(gridDim * gridDim * 4 * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    return geom;
  }, []);

  const activeWave = useRef({ x: 0, y: 0, force: 0, time: 0 });
  const [clickPos, setClickPos] = useState<{x: number, y: number} | null>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (clickPos) {
      activeWave.current = {
        x: clickPos.x,
        y: clickPos.y,
        force: 2.6,
        time: t
      };
      setClickPos(null);
    } else if (t - activeWave.current.time > 2.0) {
      activeWave.current = {
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        force: 1.5,
        time: t
      };
    }

    if (meshRef.current && linksRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.4) * 0.2;
      meshRef.current.rotation.x = 0.3;
      linksRef.current.rotation.y = meshRef.current.rotation.y;
      linksRef.current.rotation.x = meshRef.current.rotation.x;
      
      const children = meshRef.current.children;
      const lineGeom = linksRef.current.geometry;
      const linePosAttr = lineGeom.getAttribute("position") as THREE.BufferAttribute;
      const linePos = linePosAttr.array as Float32Array;
      
      let lineIdx = 0;
      const kSpring = 7.0; 
      const damping = 0.93; 

      nodes.forEach((node, idx) => {
        const mesh = children[idx] as THREE.Mesh;
        if (mesh) {
          const dx = node.x - activeWave.current.x;
          const dy = node.y - activeWave.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const dt = t - activeWave.current.time;
          const waveRadius = dt * 1.6;
          const waveThickness = 0.26;
          const waveDist = Math.abs(dist - waveRadius);
          
          let impact = 0;
          if (waveDist < waveThickness && waveRadius < 2.5) {
            impact = (Math.cos((waveDist / waveThickness) * Math.PI) + 1.0) * 0.22 * activeWave.current.force * (1.0 - waveRadius / 2.5);
          }

          const force = -kSpring * node.disp + impact * 22.0;
          node.velocity = (node.velocity + force * 0.016) * damping;
          node.disp += node.velocity * 0.016;
          
          mesh.position.set(node.x, node.y, node.disp);
        }
      });

      for (let r = 0; r < gridDim; r++) {
        for (let c = 0; c < gridDim; c++) {
          const idx1 = r * gridDim + c;
          const mesh1 = children[idx1] as THREE.Mesh;
          
          if (mesh1) {
            if (c < gridDim - 1 && lineIdx < gridDim * gridDim * 2) {
              const idx2 = r * gridDim + (c + 1);
              const mesh2 = children[idx2] as THREE.Mesh;
              
              linePos[lineIdx * 6] = mesh1.position.x;
              linePos[lineIdx * 6 + 1] = mesh1.position.y;
              linePos[lineIdx * 6 + 2] = mesh1.position.z;
              
              linePos[lineIdx * 6 + 3] = mesh2.position.x;
              linePos[lineIdx * 6 + 4] = mesh2.position.y;
              linePos[lineIdx * 6 + 5] = mesh2.position.z;
              lineIdx++;
            }
            
            if (r < gridDim - 1 && lineIdx < gridDim * gridDim * 2) {
              const idx2 = (r + 1) * gridDim + c;
              const mesh2 = children[idx2] as THREE.Mesh;
              
              linePos[lineIdx * 6] = mesh1.position.x;
              linePos[lineIdx * 6 + 1] = mesh1.position.y;
              linePos[lineIdx * 6 + 2] = mesh1.position.z;
              
              linePos[lineIdx * 6 + 3] = mesh2.position.x;
              linePos[lineIdx * 6 + 4] = mesh2.position.y;
              linePos[lineIdx * 6 + 5] = mesh2.position.z;
              lineIdx++;
            }
          }
        }
      }
      
      linePosAttr.needsUpdate = true;
      lineGeom.setDrawRange(0, lineIdx * 2);
    }
  });

  return (
    <group 
      onClick={(e) => { 
        e.stopPropagation(); 
        if (e.point) {
          setClickPos({ x: e.point.x, y: e.point.y });
        }
      }}
    >
      <group ref={meshRef}>
        {nodes.map((n, i) => (
          <mesh key={i} position={[n.x, n.y, n.z]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} emissive={isLightMode ? undefined : "#00ffcc"} emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
      
      <lineSegments ref={linksRef} geometry={linksGeom}>
        <lineBasicMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} transparent opacity={isLightMode ? 0.25 : 0.35} />
      </lineSegments>
    </group>
  );
}

// 5. Astra Ledger: 3D Cryptographic Cryptex Validator
function AstraLedgerVisual({ isLightMode }: { isLightMode?: boolean }) {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const sweepRef = useRef<THREE.Mesh>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  const [mining, setMining] = useState(false);
  const [mineTime, setMineTime] = useState(0);

  // Generate 6 blocks per ring
  const ringBlocks = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      const angle = (i * Math.PI) / 3;
      return { angle, radius: 0.72 };
    });
  }, []);

  // Gold validator block particles
  const particles = useMemo(() => {
    return [...Array(24)].map(() => ({
      x: (Math.random() - 0.5) * 0.12,
      y: -0.9,
      z: (Math.random() - 0.5) * 0.12,
      speedY: 1.6 + Math.random() * 2.2,
      speedX: (Math.random() - 0.5) * 0.4,
      speedZ: (Math.random() - 0.5) * 0.4
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;
    
    // Orbit skew based on pointer
    const skew = Math.abs(pointer.x) * 1.5;
    
    if (mining && mineTime === -1) {
      setMineTime(t);
    }

    // Dynamic rotation of 3 dials (opposite directions)
    const r1Speed = mining ? THREE.MathUtils.lerp(0.9, 0.05, Math.min(1, (t - mineTime) * 3)) : 0.8 + skew;
    const r2Speed = mining ? THREE.MathUtils.lerp(-0.6, -0.05, Math.min(1, (t - mineTime) * 3)) : -0.55 - skew;
    const r3Speed = mining ? THREE.MathUtils.lerp(0.4, 0.05, Math.min(1, (t - mineTime) * 3)) : 0.4 + skew;

    if (ring1Ref.current) ring1Ref.current.rotation.y = t * r1Speed;
    if (ring2Ref.current) ring2Ref.current.rotation.y = t * r2Speed;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * r3Speed;

    // Laser mining sweep plane logic
    if (sweepRef.current) {
      if (mining && mineTime > 0) {
        const elapsed = t - mineTime;
        const sweepY = 1.3 - elapsed * 2.6;
        sweepRef.current.position.y = sweepY;
        
        // Validation particle fountain
        if (particleGroupRef.current) {
          const children = particleGroupRef.current.children;
          particles.forEach((p, idx) => {
            const mesh = children[idx] as THREE.Mesh;
            if (mesh) {
              const py = -0.9 + elapsed * p.speedY;
              const px = p.x + elapsed * p.speedX;
              const pz = p.z + elapsed * p.speedZ;
              mesh.position.set(px, py, pz);
              mesh.scale.setScalar(Math.max(0, 1 - elapsed * 1.15));
            }
          });
        }

        if (elapsed > 1.0) {
          setMining(false);
          setMineTime(0);
        }
      } else {
        sweepRef.current.position.y = -2.5;
        // Hide particles
        if (particleGroupRef.current) {
          particleGroupRef.current.children.forEach((mesh) => {
            mesh.scale.setScalar(0);
          });
        }
      }
    }
  });

  return (
    <group 
      onClick={(e) => {
        e.stopPropagation();
        setMining(true);
        setMineTime(-1); 
      }}
    >
      {/* Central Glass Data Core Column */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.8, 16]} />
        <meshPhysicalMaterial 
          color={isLightMode ? "#0088cc" : "#00ffcc"} 
          roughness={0.05} 
          metalness={0.1}
          transparent 
          opacity={0.35} 
          transmission={0.92} 
          thickness={0.4} 
        />
      </mesh>

      {/* Cryptex Dial 1 (Top, Height: 0.5) */}
      <group ref={ring1Ref} position={[0, 0.5, 0]}>
        {ringBlocks.map((b, i) => (
          <mesh key={i} position={[Math.cos(b.angle) * b.radius, 0, Math.sin(b.angle) * b.radius]} castShadow>
            <boxGeometry args={[0.12, 0.18, 0.12]} />
            <meshStandardMaterial 
              color={isLightMode ? "#0c0c0e" : "#ffaa00"} 
              roughness={0.2} 
              metalness={0.8}
              emissive={isLightMode ? undefined : "#ffaa00"}
              emissiveIntensity={mining ? 1.5 : 0.2}
            />
          </mesh>
        ))}
        {/* Support Guide Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68, 0.72, 32]} />
          <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} transparent opacity={0.3} wireframe />
        </mesh>
      </group>

      {/* Cryptex Dial 2 (Middle, Height: 0.0) */}
      <group ref={ring2Ref} position={[0, 0.0, 0]}>
        {ringBlocks.map((b, i) => (
          <mesh key={i} position={[Math.cos(b.angle) * b.radius, 0, Math.sin(b.angle) * b.radius]} castShadow>
            <boxGeometry args={[0.12, 0.18, 0.12]} />
            <meshStandardMaterial 
              color={isLightMode ? "#0088cc" : "#00ffcc"} 
              roughness={0.2} 
              metalness={0.8}
              emissive={isLightMode ? undefined : "#00ffcc"}
              emissiveIntensity={mining ? 1.5 : 0.2}
            />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68, 0.72, 32]} />
          <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} transparent opacity={0.3} wireframe />
        </mesh>
      </group>

      {/* Cryptex Dial 3 (Bottom, Height: -0.5) */}
      <group ref={ring3Ref} position={[0, -0.5, 0]}>
        {ringBlocks.map((b, i) => (
          <mesh key={i} position={[Math.cos(b.angle) * b.radius, 0, Math.sin(b.angle) * b.radius]} castShadow>
            <boxGeometry args={[0.12, 0.18, 0.12]} />
            <meshStandardMaterial 
              color={isLightMode ? "#0c0c0e" : "#ffaa00"} 
              roughness={0.2} 
              metalness={0.8}
              emissive={isLightMode ? undefined : "#ffaa00"}
              emissiveIntensity={mining ? 1.5 : 0.2}
            />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68, 0.72, 32]} />
          <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} transparent opacity={0.3} wireframe />
        </mesh>
      </group>

      {/* Blockchain validation particles */}
      <group ref={particleGroupRef}>
        {particles.map((_, i) => (
          <mesh key={i} scale={[0, 0, 0]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2.0} />
          </mesh>
        ))}
      </group>

      {/* Scan Consensus Plane */}
      <mesh ref={sweepRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial 
          color={isLightMode ? "#ff00aa" : "#00ffcc"} 
          emissive={isLightMode ? "#ff00aa" : "#00ffcc"} 
          emissiveIntensity={2.5} 
          transparent 
          opacity={0.22} 
        />
      </mesh>
    </group>
  );
}

// 6. UPI Fraud: 3D Cryptographic Cyber Defense Shield Dome
function UPIFraudVisual({ isLightMode }: { isLightMode?: boolean }) {
  const domeRef = useRef<THREE.Mesh>(null);
  const threatsRef = useRef<THREE.Group>(null);
  const safeRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Line>(null);
  
  const [quarantineActive, setQuarantineActive] = useState(false);

  const threats = useMemo(() => {
    return [...Array(16)].map((_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const dist = 1.8 + Math.random() * 0.5;
      return {
        id: i,
        x: Math.cos(theta) * Math.cos(phi) * dist,
        y: Math.sin(phi) * dist,
        z: Math.sin(theta) * Math.cos(phi) * dist,
        speed: 0.8 + Math.random() * 0.9
      };
    });
  }, []);

  const safeNodes = useMemo(() => {
    return [...Array(25)].map(() => {
      const theta = Math.random() * Math.PI * 2;
      const radius = 0.2 + Math.random() * 0.35;
      return {
        angle: theta,
        radius,
        speed: 0.5 + Math.random() * 1.0,
        y: (Math.random() - 0.5) * 0.4
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;
    const mX = pointer.x * 1.5;
    const mY = pointer.y * 1.5;

    if (domeRef.current) {
      domeRef.current.rotation.y = t * 0.25;
      domeRef.current.rotation.x = Math.sin(t * 0.4) * 0.1;
    }

    if (safeRef.current) {
      const children = safeRef.current.children;
      safeNodes.forEach((node, idx) => {
        const mesh = children[idx] as THREE.Mesh;
        if (mesh) {
          const currentAngle = node.angle + t * node.speed;
          mesh.position.set(
            Math.cos(currentAngle) * node.radius,
            node.y + Math.sin(t * 1.5 + idx) * 0.05,
            Math.sin(currentAngle) * node.radius
          );
        }
      });
    }

    let activeLaserTarget = null;
    let closestDist = 999;
    
    if (threatsRef.current) {
      const children = threatsRef.current.children;
      threats.forEach((th, idx) => {
        const mesh = children[idx] as THREE.Mesh;
        if (mesh) {
          if (quarantineActive) {
            const wiggle = Math.sin(t * 25.0 + idx) * 0.015;
            mesh.position.set(mesh.position.x + wiggle, mesh.position.y + wiggle, mesh.position.z);
            return;
          }

          let dirX = 0 - th.x;
          let dirY = 0 - th.y;
          let dirZ = 0 - th.z;
          const len = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
          dirX /= len;
          dirY /= len;
          dirZ /= len;

          let currentDist = len - (t * 0.4 * th.speed) % 2.0;
          if (currentDist < 0.1) currentDist = 2.0;
          
          let rx = dirX * -currentDist;
          let ry = dirY * -currentDist;
          let rz = dirZ * -currentDist;

          const domeRadius = 0.62;
          if (currentDist < domeRadius) {
            const bounceFactor = 1.0 - (currentDist / domeRadius);
            rx += dirX * bounceFactor * 0.4;
            ry += dirY * bounceFactor * 0.4;
            rz += dirZ * bounceFactor * 0.4;
          }

          const dx = rx - mX;
          const dy = ry - mY;
          const cursorDist = Math.sqrt(dx*dx + dy*dy);
          if (cursorDist < 0.45) {
            const repel = (0.45 - cursorDist) / 0.45;
            rx += dx * repel * 0.5;
            ry += dy * repel * 0.5;
            
            if (cursorDist < closestDist) {
              closestDist = cursorDist;
              activeLaserTarget = new THREE.Vector3(rx, ry, rz);
            }
          }

          mesh.position.set(rx, ry, rz);
        }
      });
    }

    if (laserRef.current) {
      const geom = laserRef.current.geometry;
      if (activeLaserTarget && !quarantineActive) {
        geom.setFromPoints([
          new THREE.Vector3(mX, mY, 0.2),
          activeLaserTarget
        ]);
        laserRef.current.visible = true;
      } else {
        laserRef.current.visible = false;
      }
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); setQuarantineActive(prev => !prev); }}>
      <mesh ref={domeRef} castShadow>
        <icosahedronGeometry args={[0.62, 2]} />
        {isLightMode ? (
          <meshPhysicalMaterial 
            color="#0088cc" 
            roughness={0.1} 
            metalness={0.0}
            transparent 
            opacity={0.3} 
            transmission={0.88} 
            thickness={0.15} 
            wireframe
          />
        ) : (
          <meshStandardMaterial 
            color="#00ffcc" 
            wireframe 
            transparent 
            opacity={0.22} 
            emissive="#00ffcc" 
            emissiveIntensity={quarantineActive ? 1.5 : 0.3}
          />
        )}
      </mesh>

      <mesh>
        <icosahedronGeometry args={[0.58, 1]} />
        <meshBasicMaterial color={isLightMode ? "#eef6ff" : "#00ffcc"} transparent opacity={0.06} />
      </mesh>

      <group ref={threatsRef}>
        {threats.map((th) => (
          <mesh key={th.id} castShadow>
            <sphereGeometry args={[0.052, 8, 8]} />
            <meshStandardMaterial 
              color={quarantineActive ? "#ffaa00" : "#ff2244"} 
              emissive={quarantineActive ? "#ffaa00" : "#ff2244"} 
              emissiveIntensity={quarantineActive ? 1.8 : 0.8}
            />
          </mesh>
        ))}
      </group>

      <group ref={safeRef}>
        {safeNodes.map((_, idx) => (
          <mesh key={idx} castShadow>
            <boxGeometry args={[0.045, 0.045, 0.045]} />
            <meshStandardMaterial 
              color={isLightMode ? "#0c0c0e" : "#00ffcc"} 
              emissive={isLightMode ? undefined : "#00ffcc"} 
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </group>

      <Line ref={laserRef}>
        <bufferGeometry />
        <lineBasicMaterial color={isLightMode ? "#ff0099" : "#ff00cc"} linewidth={3.0} transparent opacity={0.85} />
      </Line>
      
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#ff00cc" />
      </mesh>
    </group>
  );
}

// 7. AgriVision: Topography wave point-cloud mapping
function AgriVisionVisual({ isLightMode }: { isLightMode?: boolean }) {
  const gridRef = useRef<THREE.Group>(null);
  const [sweepX, setSweepX] = useState(0);

  const gridDim = 10;
  const spacing = 0.22;
  const nodes = useMemo(() => {
    const list = [];
    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        list.push({
          x: (c - (gridDim - 1) / 2) * spacing,
          z: (r - (gridDim - 1) / 2) * spacing,
          y: 0
        });
      }
    }
    return list;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const planeX = Math.sin(t * 1.6) * 1.15;
    setSweepX(planeX);

    const baseColor = isLightMode ? "#0088cc" : "#00ffcc";
    const activeColor = isLightMode ? "#ff5500" : "#ffaa00";

    if (gridRef.current) {
      const children = gridRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const mesh = children[i] as THREE.Mesh;
        if (mesh) {
          const node = nodes[i];
          const height = Math.sin(node.x * 2.2 + t) * Math.cos(node.z * 2.2 + t) * 0.24;
          mesh.position.y = height;
          
          const distance = Math.abs(node.x - planeX);
          if (distance < 0.15) {
            (mesh.material as THREE.MeshStandardMaterial).color.set(activeColor);
            if (!isLightMode) {
              (mesh.material as THREE.MeshStandardMaterial).emissive.set(activeColor);
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.8;
            } else {
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
            }
          } else {
            (mesh.material as THREE.MeshStandardMaterial).color.set(baseColor);
            if (!isLightMode) {
              (mesh.material as THREE.MeshStandardMaterial).emissive.set(baseColor);
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
            } else {
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
            }
          }
        }
      }
    }
  });

  return (
    <group>
      <group ref={gridRef}>
        {nodes.map((n, i) => (
          <mesh key={i} position={[n.x, 0, n.z]} castShadow>
            <boxGeometry args={[0.05, 0.45, 0.05]} />
            <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} metalness={0.1} roughness={0.4} />
          </mesh>
        ))}
      </group>
      
      <mesh position={[sweepX, 0, 0]}>
        <boxGeometry args={[0.02, 0.65, 2.3]} />
        <meshStandardMaterial color={isLightMode ? "#ff5500" : "#ffaa00"} emissive={isLightMode ? undefined : "#ffaa00"} emissiveIntensity={2.0} />
      </mesh>
    </group>
  );
}

// 8. Adaptive Quantization: Snapping weights grid compressor
function QuantizationVisual({ isLightMode }: { isLightMode?: boolean }) {
  const pointsRef = useRef<THREE.Group>(null);
  const linksRef = useRef<THREE.LineSegments>(null);
  const [quantize, setQuantize] = useState(false);

  const weights = useMemo(() => {
    return [...Array(65)].map(() => ({
      x: (Math.random() - 0.5) * 2.2,
      y: (Math.random() - 0.5) * 2.2,
      z: (Math.random() - 0.5) * 0.8
    }));
  }, []);

  const snapLinesGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(65 * 2 * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    return geom;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointsRef.current && linksRef.current) {
      const children = pointsRef.current.children;
      const lineGeom = linksRef.current.geometry;
      const linePosAttr = lineGeom.getAttribute("position") as THREE.BufferAttribute;
      const linePos = linePosAttr.array as Float32Array;
      
      weights.forEach((w, idx) => {
        const mesh = children[idx] as THREE.Mesh;
        if (mesh) {
          const qX = Math.round(w.x * 2.5) / 2.5;
          const qY = Math.round(w.y * 2.5) / 2.5;
          
          if (quantize) {
            mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, qX, 0.12);
            mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, qY, 0.12);
          } else {
            mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, w.x + Math.sin(t * 1.8 + idx) * 0.08, 0.08);
            mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, w.y + Math.cos(t * 1.8 + idx) * 0.08, 0.08);
          }
          
          linePos[idx * 6] = mesh.position.x;
          linePos[idx * 6 + 1] = mesh.position.y;
          linePos[idx * 6 + 2] = mesh.position.z;
          
          linePos[idx * 6 + 3] = qX;
          linePos[idx * 6 + 4] = qY;
          linePos[idx * 6 + 5] = mesh.position.z;
        }
      });
      linePosAttr.needsUpdate = true;
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); setQuantize(prev => !prev); }}>
      <mesh>
        <boxGeometry args={[1.4, 1.4, 0.05]} />
        <meshStandardMaterial color={isLightMode ? "#0c0c0e" : "#222228"} metalness={0.2} roughness={0.4} wireframe />
      </mesh>
      
      <mesh>
        <gridHelper args={[2.0, 5, isLightMode ? "#0088cc" : "#ffaa00", isLightMode ? "rgba(0,136,204,0.15)" : "rgba(255,170,0,0.15)"]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>

      <group ref={pointsRef}>
        {weights.map((w, idx) => (
          <mesh key={idx} position={[w.x, w.y, w.z]} castShadow>
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshStandardMaterial 
              color={quantize ? (isLightMode ? "#0088cc" : "#ffaa00") : (isLightMode ? "#0c0c0e" : "#00ffcc")} 
              emissive={quantize ? (isLightMode ? "#0088cc" : "#ffaa00") : (isLightMode ? undefined : "#00ffcc")} 
              emissiveIntensity={0.5} 
            />
          </mesh>
        ))}
      </group>

      <lineSegments ref={linksRef} geometry={snapLinesGeom}>
        <lineBasicMaterial color={quantize ? (isLightMode ? "#0088cc" : "#ffaa00") : (isLightMode ? "#0c0c0e" : "#00ffcc")} transparent opacity={quantize ? 0.35 : 0.08} />
      </lineSegments>
    </group>
  );
}

// 9. Pac-Man: Voxel 3D Chomping Pac-Man & Ghost Chase
function PacmanVisual({ isLightMode }: { isLightMode?: boolean }) {
  const pacGroupRef = useRef<THREE.Group>(null);
  const upperJawRef = useRef<THREE.Mesh>(null);
  const lowerJawRef = useRef<THREE.Mesh>(null);
  const ghostRef = useRef<THREE.Group>(null);
  const pelletsRef = useRef<THREE.Group>(null);
  
  const ghostTentacles = useMemo(() => [
    { xOffset: -0.12, zOffset: -0.05, phase: 0 },
    { xOffset: -0.04, zOffset: 0.05, phase: Math.PI / 3 },
    { xOffset: 0.04, zOffset: -0.05, phase: (2 * Math.PI) / 3 },
    { xOffset: 0.12, zOffset: 0.05, phase: Math.PI }
  ], []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const radius = 0.95;
    
    // Pac-Man movement around the track
    const pacAngle = t * 1.3;
    const px = Math.cos(pacAngle) * radius;
    const pz = Math.sin(pacAngle) * radius;
    
    if (pacGroupRef.current) {
      pacGroupRef.current.position.set(px, 0.15, pz);
      // Face forward along circular path
      pacGroupRef.current.rotation.y = -pacAngle - Math.PI / 2;
      
      // Chomp biting animation
      const chomp = Math.abs(Math.sin(t * 16.0)) * 0.42;
      if (upperJawRef.current) upperJawRef.current.rotation.x = -chomp;
      if (lowerJawRef.current) lowerJawRef.current.rotation.x = chomp;
    }

    // Ghost Blinky chasing Pac-Man from behind
    const ghostAngle = pacAngle - 0.72;
    const gx = Math.cos(ghostAngle) * radius;
    const gz = Math.sin(ghostAngle) * radius;
    
    if (ghostRef.current) {
      ghostRef.current.position.set(gx, 0.15, gz);
      ghostRef.current.rotation.y = -ghostAngle - Math.PI / 2;
      
      // Bouncing tentacles
      const children = ghostRef.current.children;
      // Tentacle spheres are children index 5 to 8
      for (let i = 0; i < 4; i++) {
        const tentacle = children[5 + i] as THREE.Mesh;
        if (tentacle) {
          tentacle.position.y = -0.18 + Math.sin(t * 18.0 + ghostTentacles[i].phase) * 0.03;
        }
      }
    }

    // Dynamic Pellet eating detection (pop shrink/grow)
    if (pelletsRef.current) {
      const children = pelletsRef.current.children;
      const currentPacAngle = pacAngle % (Math.PI * 2);
      
      for (let i = 0; i < children.length; i++) {
        const mesh = children[i] as THREE.Mesh;
        if (mesh) {
          const pelletAngle = (i * Math.PI) / 4;
          const diff = Math.abs(currentPacAngle - pelletAngle);
          const wrapDiff = Math.min(diff, Math.PI * 2 - diff);
          
          if (wrapDiff < 0.15) {
            // Eat pellet (scale to 0)
            mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, 0.0, 0.3));
          } else {
            // Respawn pellet once Pac-man is past
            mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, 1.0, 0.05));
          }
        }
      }
    }
  });

  return (
    <group>
      {/* Dual Neon Tube track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[0.9, 0.93, 32]} />
        <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} emissive={isLightMode ? "#0088cc" : "#00ffcc"} emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[0.97, 1.0, 32]} />
        <meshStandardMaterial color={isLightMode ? "#0088cc" : "#00ffcc"} emissive={isLightMode ? "#0088cc" : "#00ffcc"} emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>

      {/* Pellets */}
      <group ref={pelletsRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const px = Math.cos(angle) * 0.95;
          const pz = Math.sin(angle) * 0.95;
          return (
            <mesh key={i} position={[px, 0.1, pz]}>
              <dodecahedronGeometry args={[0.05]} />
              <meshStandardMaterial 
                color={isLightMode ? "#ff5500" : "#ffaa00"} 
                emissive={isLightMode ? undefined : "#ffaa00"} 
                emissiveIntensity={0.6} 
              />
            </mesh>
          );
        })}
      </group>

      {/* 3D Chomping Pac-Man */}
      <group ref={pacGroupRef}>
        <group rotation={[0, Math.PI, 0]}> {/* Align jaw opening forward */}
          <mesh ref={upperJawRef}>
            <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={isLightMode ? "#ffaa00" : "#ffff00"} roughness={0.1} />
          </mesh>
          <mesh ref={lowerJawRef}>
            <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color={isLightMode ? "#ffaa00" : "#ffff00"} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 3D Red Ghost Blinky */}
      <group ref={ghostRef}>
        {/* Head */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ff2222" roughness={0.2} />
        </mesh>
        {/* Body */}
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.24, 16]} />
          <meshStandardMaterial color="#ff2222" roughness={0.2} />
        </mesh>
        {/* Left White Eye */}
        <mesh position={[-0.05, 0.08, 0.11]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
        {/* Right White Eye */}
        <mesh position={[0.05, 0.08, 0.11]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
        {/* Left Blue Pupil */}
        <mesh position={[-0.05, 0.08, 0.14]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="#0000ff" roughness={0.1} />
        </mesh>
        {/* Right Blue Pupil */}
        <mesh position={[0.05, 0.08, 0.14]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="#0000ff" roughness={0.1} />
        </mesh>
        {/* Animated Tentacle Spheres */}
        {ghostTentacles.map((t, idx) => (
          <mesh key={idx} position={[t.xOffset, -0.18, t.zOffset]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshStandardMaterial color="#ff2222" roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Visualizer Dispatcher
function ProjectVisualizer3D({ index, isExpanded, setIsExpanded }: { index: number; isExpanded: boolean; setIsExpanded: (val: boolean) => void }) {
  const [isBatteryPower, setIsBatteryPower] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

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

  useEffect(() => {
    if (typeof window !== "undefined" && "getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryStatus = () => {
          setIsBatteryPower(!battery.charging);
        };
        updateBatteryStatus();
        battery.addEventListener("chargingchange", updateBatteryStatus);
        return () => {
          battery.removeEventListener("chargingchange", updateBatteryStatus);
        };
      });
    }
  }, []);

  const canvasContent = (
    <Canvas 
      camera={{ position: [0, 0, 4.5], fov: 45 }} 
      shadows
      dpr={isBatteryPower ? 1.0 : [1, 1.5]}
      gl={{ powerPreference: "high-performance", antialias: !isBatteryPower }}
    >
      {/* Dynamic background color matching light mode white or dark mode charcoal */}
      <color attach="background" args={[isLightMode ? "#ffffff" : "#0c0c0e"]} />

      {/* Extremely Bright Studio Lighting Rig (No dark spots) */}
      <ambientLight intensity={isLightMode ? 2.2 : 1.8} />
      <directionalLight position={[5, 10, 5]} intensity={2.5} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={2.0} color="#ffffff" />
      <spotLight position={[0, 5, 0]} intensity={3.0} />
      
      {index === 0 && <EdgeVisionVisual isLightMode={isLightMode} />}
      {index === 1 && <AutoForgeVisual isLightMode={isLightMode} />}
      {index === 2 && <MedisyncVisual isLightMode={isLightMode} />}
      {index === 3 && <CardOrchVisual isLightMode={isLightMode} />}
      {index === 4 && <AstraLedgerVisual isLightMode={isLightMode} />}
      {index === 5 && <UPIFraudVisual isLightMode={isLightMode} />}
      {index === 6 && <AgriVisionVisual isLightMode={isLightMode} />}
      {index === 7 && <QuantizationVisual isLightMode={isLightMode} />}
      {index === 8 && <PacmanVisual isLightMode={isLightMode} />}
    </Canvas>
  );

  if (isExpanded) {
    if (typeof window === "undefined" || !document.body) return null;
    return createPortal(
      <div className={`fixed inset-0 w-screen h-screen z-[9999] flex flex-col items-center justify-center p-6 backdrop-blur-lg transition-colors duration-300 ${
        isLightMode ? "bg-[#f4f4f6]/98" : "bg-[#09090b]/98"
      }`}>
        {/* Holographic grid scanlines */}
        <div className={`absolute inset-0 pointer-events-none animate-scanline ${
          isLightMode 
            ? "bg-[linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)]" 
            : "bg-[linear-gradient(to_bottom,rgba(240,160,0,0.015)_1px,transparent_1px)]"
        }`} style={{ backgroundSize: "100% 4px" }} />
        <div className={`absolute inset-0 pointer-events-none ${
          isLightMode 
            ? "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.75)_100%)]" 
            : "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]"
        }`} />
        
        {/* Telemetry Header Bar (Never overlaps the canvas!) */}
        <div className="w-[90vw] flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 z-[10000] select-none">
          {/* Left: Telemetry Stats */}
          <div className="font-mono text-[10px] text-signal/70 space-y-1.5 select-none border-l border-signal/30 pl-4">
            <p className="text-ink font-bold tracking-widest text-xs uppercase">Telemetry Terminal Overlay</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-ink/75">
              <span>BUFFER_READ: CACHE_STABLE</span>
              <span>SYS_CYCLES: 48,190 FLOP/S</span>
              <span>QUANTIZATION_FACTOR: adaptive_auto</span>
              <span>FRAME_RENDER: 60_FPS // STRICT</span>
            </div>
          </div>
          
          {/* Right: Escape Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsExpanded(false)}
              className="font-mono text-xs text-[#ff3333] border border-[#ff3333]/40 bg-[#ff3333]/5 px-4 py-2 rounded-md hover:bg-[#ff3333]/15 transition-all duration-300 shadow-[0_0_15px_rgba(255,51,51,0.05)] cursor-pointer"
            >
              [ ESCAPE HOLOGRAPHIC OVERLAY ]
            </button>
          </div>
        </div>

        {/* Visualizer view */}
        <div className="w-[90vw] h-[65vh] border border-signal/20 rounded-xl overflow-hidden bg-black/45 shadow-[0_0_60px_rgba(240,160,0,0.05)] relative">
          {canvasContent}
        </div>

        <div className="mt-6 text-center select-none max-w-xl">
          <p className="font-mono text-xs text-signal/80 uppercase tracking-widest mb-1">
            Active Workspace Simulation Node {index + 1}
          </p>
          <p className="text-ink/50 text-[11px] font-mono">
            Direct WebGL overlay active. Cursor interaction controls particle velocity, model bounds, and spatial matrices in real-time.
          </p>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      {canvasContent}
      
      {/* HUD Info Labels */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 border border-white/5 rounded-full backdrop-blur-sm pointer-events-none select-none">
        <span className="w-2.5 h-2.5 rounded-full bg-[#f0a000] animate-pulse" />
        <span className="font-mono text-[9px] text-[#f0a000] uppercase tracking-widest flex items-center gap-1.5">
          SIM ENVIRONMENT // ACTIVE_MOD_{index + 1}
          <span className="text-[#ffffff]/50">// INTERACTIVE</span>
        </span>
      </div>

      <button 
        onClick={() => setIsExpanded(true)}
        className="absolute bottom-3 right-3 font-mono text-[9px] text-[#f0a000] border border-[#f0a000]/35 bg-black/75 px-3 py-1 rounded hover:bg-[#f0a000]/15 hover:text-[#ffffff] transition-all duration-300 z-30 shadow-[0_0_10px_rgba(240,160,0,0.05)] cursor-pointer"
      >
        [ EXPAND HUD OVERLAY ]
      </button>
    </div>
  );
}

// Registry containing old + newly imported projects from github.com/dhuvie
const PROJECTS = [
  {
    title: "EdgeVision",
    fileName: "edge_vision.bin",
    subtitle: "AI Image Analysis & DIP Engine",
    description: "Browser-based image editor using Gemini 2.5 Flash for semantic scene analysis. Custom client-side digital image processing engine via the Canvas 2D API. Drag on canvas to convolve pixel depths.",
    tech: ["Next.js", "Genkit", "Canvas 2D"],
    github: "https://github.com/Dhuvie/EdgeVision",
    size: "1.24 MB",
    lines: "2,845",
    status: "SYS_READY",
    logs: [
      "Initializing edge vision processing module...",
      "Binding WebGL texture shaders...",
      "Resolving Gemini AI pipeline credentials...",
      "Client-side Canvas 2D mapping engine... OK",
      "[SYSTEM] EdgeVision is listening on telemetry buffer.",
    ]
  },
  {
    title: "AutoForge",
    fileName: "auto_forge.bin",
    subtitle: "AutoML & MLOps Platform",
    description: "An AutoML & MLOps platform simulator. Upload datasets → auto EDA & profiling → 24-model parallel training → SHAP explainability → 1-click Dockerized FastAPI deployment packages. Drag 3D slider to adjust hyperparameters.",
    tech: ["Next.js 16", "FastAPI", "Docker", "XGBoost"],
    github: "https://github.com/Dhuvie/AutoForge",
    size: "5.12 MB",
    lines: "14,890",
    status: "SYS_READY",
    logs: [
      "Initializing AutoML modeling pipeline...",
      "Loading dataset CSV stream...",
      "Initiating 24-model parallel training sequence...",
      "Model SHAP explainability force-plot calculated.",
      "[DOCKER] Building FastAPI deployment container... OK",
      "[SYSTEM] AutoForge is standby on port 8000.",
    ]
  },
  {
    title: "Medisync",
    fileName: "medisync_cdss.ts",
    subtitle: "AI Clinical Decision CDSS",
    description: "An AI-powered clinical decision support system (CDSS) for triage and diagnostic reasoning. Features real-time LLM differentials, safety scoring (ESI/MEWS), and vitals radar. Click 3D red defibrillator button to shock heart.",
    tech: ["Next.js", "LangChain", "Prisma", "TailwindCSS"],
    github: "https://github.com/Dhuvie/Medisync",
    size: "2.15 MB",
    lines: "5,320",
    status: "SYS_READY",
    logs: [
      "Loading clinical CDSS reasoning parameters...",
      "Calculating patient ESI/MEWS safety scoring...",
      "Generating differential diagnosis list via LLM... OK",
      "Active triage vitals radar: NORMAL RANGE.",
      "[SYSTEM] Medical safety override rules validated.",
    ]
  },
  {
    title: "Card-Orchestration",
    fileName: "card_orch.py",
    subtitle: "CRM LangGraph Orchestration",
    description: "An AI-powered CRM orchestration platform that automatically extracts, enriches, and stores business card contacts using multimodal AI and LangGraph state machines. Hover over the card to scan contact OCR.",
    tech: ["LangGraph", "Gemini API", "FastAPI", "Python"],
    github: "https://github.com/Dhuvie/Card-Orchestration",
    size: "1.84 MB",
    lines: "4,780",
    status: "STANDBY",
    logs: [
      "Loading LangGraph state machine workflow...",
      "Processing card image/audio raw binaries...",
      "Extracting entities: Name, Org, Email, Phone... OK",
      "Enriching contact record from public metadata API...",
      "[SYSTEM] Card-Orchestration sync to CRM DB complete.",
    ]
  },
  {
    title: "Astra Ledger",
    fileName: "astra_ledger.ts",
    subtitle: "Personal Finance Dashboard",
    description: "A production-ready personal finance dashboard built with Next.js, Plaid, Prisma, and PostgreSQL, featuring budgets, goals, and analytics. Hover X/Y directly on vault safe box to allocate budget rings.",
    tech: ["Next.js", "Plaid API", "Prisma", "PostgreSQL"],
    github: "https://github.com/Dhuvie/Astra_Ledger",
    size: "3.45 MB",
    lines: "9,120",
    status: "SYS_READY",
    logs: [
      "Connecting to Plaid API secure linkage...",
      "Fetching ledger delta for active accounts...",
      "Updating budget indicators via Prisma queries... OK",
      "Recalculating recurring expenditure predictions...",
      "[SYSTEM] Financial delta engine synchronized.",
    ]
  },
  {
    title: "UPI ML Fraud Detection",
    fileName: "fraud_detect.py",
    subtitle: "Real-Time FinTech Security",
    description: "Trained 5 ML models on 6M+ UPI transactions. Deployed as a Flask REST API with batch prediction, velocity checks, and transaction sequence analysis. Click direct green transaction spheres to quarantine them.",
    tech: ["Python", "XGBoost", "Flask"],
    github: "https://github.com/Dhuvie/UPI-ML-Fraud-Detection",
    size: "4.81 MB",
    lines: "12,410",
    status: "MONITORING",
    logs: [
      "Ingesting 6.2M transaction dataset vectors...",
      "Instantiating XGBoost binary decider node...",
      "Binding API REST routing gateway on port 5000...",
      "[ALERT] Transaction sequence 9831 anomalies detected!",
      "[SYSTEM] Real-time velocity logs established.",
    ]
  },
  {
    title: "AgriVision AI",
    fileName: "agrivision_ai.ts",
    subtitle: "Agricultural Intelligence",
    description: "End-to-end AI platform for crop yield prediction, pest/disease detection, and soil analysis using the Google Gemini API. Click and drag directly on soil terrain grid to water it and grow crops.",
    tech: ["Next.js", "Gemini API", "Edge Functions"],
    github: "https://github.com/Dhuvie/agrivision-ai",
    size: "980 KB",
    lines: "3,120",
    status: "STANDBY",
    logs: [
      "Establishing connection to Multispectral SAT mapping API...",
      "Mapping local soil telemetry indices...",
      "Configuring edge yield forecast solvers...",
      "[OK] Model analysis sequence completed (100%).",
      "[SYSTEM] AgriVision ready for diagnostic prompt.",
    ]
  },
  {
    title: "Adaptive Quantization",
    fileName: "adaptive_quant.cpp",
    subtitle: "TinyML Research",
    description: "Runtime-aware adaptive quantization for ARM Cortex-M devices; achieved 3–5× energy reduction while retaining 82.8% accuracy. Drag vertical slider pin on microcontroller to adjust bit-resolution.",
    tech: ["PyTorch", "TF Lite Micro", "C"],
    github: "https://github.com/Dhuvie/Adaptive-Quantization",
    size: "420 KB",
    lines: "8,450",
    status: "OPTIMIZED",
    logs: [
      "Target: ARM Cortex-M architecture compilation...",
      "Activating dynamic weight clustering vectors...",
      "Quantizing model weights to 4-bit integer values...",
      "[METRIC] 3-5x power improvement verified...",
      "[SYSTEM] Optimized TinyML static buffer initialized.",
    ]
  },
  {
    title: "Pac-Man",
    fileName: "pacman_game.exe",
    subtitle: "C++ / OpenGL Game AI",
    description: "Modern C++17 implementation of Pac-Man with advanced AI pathfinding (Dijkstra, A*), and real-time OpenGL graphics. Click inside maze to spawn blockage obstacles.",
    tech: ["C++17", "OpenGL", "CMake"],
    github: "https://github.com/Dhuvie/Pac-man",
    size: "2.42 MB",
    lines: "6,120",
    status: "EXECUTING",
    logs: [
      "Configuring CMake compilation cache...",
      "Instantiating GLEW and GLFW canvas frame...",
      "Constructing Dijkstra pathfinding nodes...",
      "[AI] Ghost node intelligence loaded dynamically...",
      "[SYSTEM] Main OpenGL rendering cycle executing.",
    ]
  },
];

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // CLI Logs Typing Simulator
  useEffect(() => {
    if (!mounted) return;
    setTerminalLogs([]);
    let currentIndex = 0;
    const activeLogs = PROJECTS[activeIndex].logs;

    const interval = setInterval(() => {
      if (currentIndex < activeLogs.length) {
        setTerminalLogs((prev) => [...prev, activeLogs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [activeIndex, mounted]);

  // Scroll to bottom of terminal console
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const activeProject = PROJECTS[activeIndex];

  return (
    <section id="projects" ref={containerRef} className="relative overflow-hidden py-24 border-y border-signal/15 z-10 bg-bg">
      <div className="w-[96%] max-w-[1720px] mx-auto pb-12 relative z-20">
        <p className="font-mono text-sm text-signal tracking-[0.5em] uppercase mb-4" data-cursor-magnetic>
          {"// Project Workspace"}
        </p>
        <SplitTextReveal text="Things I've built." className="font-display font-semibold text-5xl md:text-7xl text-white" />
      </div>

      <div className="w-[96%] max-w-[1720px] mx-auto relative z-20">
        {/* Terminal Wrapper Card */}
        <div className="border border-signal/20 bg-surface/30 backdrop-blur-md rounded-xl overflow-hidden shadow-[0_0_50px_rgba(240,160,0,0.03)]">
          
          {/* Futuristic Terminal Title Bar */}
          <div className="border-b border-signal/20 bg-surface/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="font-mono text-xs text-white/50 ml-4 hidden md:inline">
                user@dhruv:~/workspace/portfolio/projects/
              </span>
              <span className="font-mono text-xs text-white/50 ml-2 md:hidden">
                ~/projects/
              </span>
            </div>
            <div className="font-mono text-[10px] text-signal/80 uppercase tracking-widest bg-signal/10 px-3 py-1 rounded border border-signal/20">
              SYS RUNTIME: ACTIVE
            </div>
          </div>

          {/* Main workspace layout - Three-Column Developer IDE workstation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
            
            {/* Left Column: File Navigator Sidebar (lg:col-span-4) */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-signal/20 bg-surface/20 p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-6 pb-2 border-b border-subtle flex items-center justify-between">
                  <span>PROJECT DIRECTORY</span>
                  <span>v1.0.4</span>
                </div>
                
                <div className="space-y-4">
                  <div className="font-mono text-xs text-signal/60 flex items-center gap-2 select-none">
                    <span>📁</span>
                    <span>src/portfolio/projects/</span>
                  </div>
                  
                  <nav className="pl-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {PROJECTS.map((project, idx) => (
                      <button
                        key={project.title}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-full text-left font-mono text-xs md:text-sm py-2.5 px-3.5 rounded flex items-center justify-between transition-all duration-300 border project-sidebar-btn ${
                          activeIndex === idx ? "active" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] opacity-75">
                            {activeIndex === idx ? "⚡" : "📄"}
                          </span>
                          <span className="truncate max-w-[140px] lg:max-w-none">
                            {project.fileName}
                          </span>
                        </div>
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          project.status === "MONITORING"
                            ? "text-[#ff3333] bg-[#ff3333]/10"
                            : project.status === "EXECUTING"
                            ? "text-cyan-400 bg-cyan-400/10"
                            : "text-green-400 bg-green-400/10"
                        }`}>
                          {project.status}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
 
              {/* Bottom statistics panel */}
              <div className="mt-8 pt-6 border-t border-subtle space-y-2.5 font-mono text-xs text-ink/50">
                <div className="flex items-center justify-between">
                  <span>COMPILER:</span>
                  <span className="text-ink">Clang 16.0.0-w64</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CPU PROFILE:</span>
                  <span className="text-ink">ARM Cortex-M/D1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SYSTEM PORT:</span>
                  <span className="text-ink">Telemetry Dev0</span>
                </div>
              </div>
            </div>

            {/* Center Column: Immersive 3D Simulation Viewport & Telemetry Output (lg:col-span-4) */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-signal/20 bg-black/15 p-6 flex flex-col justify-between gap-6 min-h-[450px] lg:min-h-none">
              <div className="font-mono text-xs text-ink/60 uppercase tracking-widest pb-2 border-b border-white/5 flex items-center justify-between">
                <span>SIMULATION WORKSPACE</span>
                <span>TELEMETRY_ON</span>
              </div>

              {/* 3D Visualizer block */}
              <div className="flex-grow w-full relative min-h-[300px] lg:min-h-none border border-signal/15 rounded-lg overflow-hidden bg-black/45">
                {mounted ? (
                  <ProjectVisualizer3D index={activeIndex} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center font-mono text-xs text-signal/40 gap-2">
                    <span className="animate-pulse">● SIMULATION SUSPENDED</span>
                    <span className="text-[9px] opacity-60">SCROLL TO PROJECTS TO ACTIVATE</span>
                  </div>
                )}
              </div>

              {/* Console Log Terminal */}
              <div ref={consoleContainerRef} className="bg-black/95 border border-[#00ff66]/20 rounded-lg p-4 font-mono text-[11px] text-[#00ff66] min-h-[140px] max-h-[160px] overflow-y-auto flex flex-col justify-start relative shadow-[inset_0_0_20px_rgba(0,255,102,0.03)] select-none">
                
                {/* Flashing scanline effect for console */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff66]/1 to-transparent pointer-events-none animate-scanline" />
                
                <div className="flex-grow space-y-1">
                  <div className="text-[#00ff66]/40 uppercase text-[9px] tracking-wider mb-2 border-b border-[#00ff66]/15 pb-1 flex items-center justify-between">
                    <span>CONSOLE TELEMETRY OUTPUT</span>
                    <span>STREAMING</span>
                  </div>

                  {terminalLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[#00ff66]/50">&gt;</span>
                      <p className="leading-4">{log}</p>
                    </div>
                  ))}
                  
                  {terminalLogs.length < activeProject.logs.length && (
                    <div className="flex gap-2 items-center text-[#00ff66]/60">
                      <span className="text-[#00ff66]/50">&gt;</span>
                      <div className="w-1.5 h-3 bg-[#00ff66] animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Spec Metrics & Description details (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between gap-6 bg-surface/10">
              
              <div>
                <span className="text-[10px] text-signal uppercase tracking-widest block mb-2 font-mono">
                  {"// SPECIFICATION METRICS"}
                </span>
                <h3 className="font-display font-black text-2xl lg:text-3xl text-white tracking-tight leading-none mb-1">
                  {activeProject.title}
                </h3>
                <span className="text-xs text-white/50 block mb-4 font-mono">
                  {activeProject.subtitle}
                </span>
                
                <div className="space-y-2 text-xs text-white/70 font-mono">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">EST. SOURCE SIZE:</span>
                    <span className="text-signal/90">{activeProject.size}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">LINES OF CODE:</span>
                    <span>{activeProject.lines}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-white/40">REPOS. STATUS:</span>
                    <span className="text-green-400 font-bold">STABLE</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-ink/60 uppercase tracking-widest block mb-2 font-mono">
                  DEVELOPER STACK
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeProject.tech.map((t) => (
                    <span key={t} className="text-[10px] uppercase text-signal border border-signal/20 rounded-md px-2.5 py-1 bg-signal/5 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                <p className="text-white/80 text-sm leading-relaxed">
                  {activeProject.description}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <p className="font-mono text-[10px] text-ink/60">
                  ACCESS CODE STACK:
                </p>
                <MagneticButton href={activeProject.github} variant="primary" external>
                  ACCESS REPOSITORY
                </MagneticButton>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
