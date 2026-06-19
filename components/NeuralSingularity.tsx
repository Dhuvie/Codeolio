"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/animations";

const PARTICLE_COUNT = 500000;

const vertexShader = `
uniform float uTime;
uniform vec3 uMouse;
attribute float aRandom;

varying vec3 vColor;

void main() {
    vec3 pos = position;
    
    // 1. Organic Swirling Motion
    float distFromCenter = length(pos);
    float angle = uTime * 0.5 * (1.0 / (distFromCenter + 1.0)) + aRandom * 6.28;
    
    float s = sin(angle);
    float c = cos(angle);
    
    vec3 rotatedPos = pos;
    rotatedPos.x = pos.x * c - pos.z * s;
    rotatedPos.z = pos.x * s + pos.z * c;
    
    // Breathing/wavy effect
    rotatedPos.y += sin(uTime * 2.0 + distFromCenter) * 0.5 * aRandom;
    
    // 2. GPU Mouse Repulsion (Instantaneous)
    vec3 dir = rotatedPos - uMouse;
    float distToMouse = length(dir);
    // Huge repulsion radius of 12.0
    float force = max(0.0, 12.0 - distToMouse) / 12.0; 
    
    // Push violently outward
    vec3 displacement = normalize(dir) * force * 8.0; 
    
    vec3 finalPos = rotatedPos + displacement;
    
    // 3. Coloring based on density, position, and heat
    vec3 colorCore = vec3(1.0, 0.95, 0.6);   // Blinding white/yellow
    vec3 colorEdge = vec3(0.94, 0.62, 0.0);  // Amber signal
    vec3 colorDark = vec3(0.05, 0.02, 0.0);  // Deep burnt orange
    
    // Fade out as it gets further from the core
    float mixRatio = clamp(distFromCenter / 8.0, 0.0, 1.0);
    vec3 baseColor = mix(colorCore, colorEdge, mixRatio);
    baseColor = mix(baseColor, colorDark, clamp((distFromCenter - 8.0) / 6.0, 0.0, 1.0));
    
    // If it is being violently pushed by the mouse, it heats up to pure white
    vec3 heatColor = vec3(1.0, 1.0, 1.0);
    vColor = mix(baseColor, heatColor, force * 1.5);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    
    // Dynamic size attenuation
    gl_PointSize = (12.0 * aRandom + 2.0) * (15.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vColor;

void main() {
    // Soft circular particle with a glowing edge
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Exponential falloff for soft glow
    float alpha = 1.0 - (dist * 2.0);
    alpha = pow(alpha, 1.5);
    
    gl_FragColor = vec4(vColor, alpha * 0.6);
}
`;

function QuantumShader() {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { size, camera } = useThree();

  // Generate 500,000 points in a massive galactic torus shape
  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const rand = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Gaussian-like distribution to cluster points heavily in the center and ring
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Radius distribution: dense core, fading out to a massive 15 unit radius
      const r = Math.pow(Math.random(), 2) * 15;

      // Squish the sphere into a thick disk/torus
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.3; // flattened
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      rand[i] = Math.random();
    }

    return { positions: pos, randoms: rand };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(999, 999, 999) } // start off-screen
  }), []);

  const globalMouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      globalMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      globalMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Frame Loop
  useFrame((state) => {
    if (!shaderRef.current || !groupRef.current || prefersReducedMotion()) return;

    const time = state.clock.getElapsedTime();
    shaderRef.current.uniforms.uTime.value = time;

    // Scroll Hijack
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollProgress = Math.min(scrollY / (window.innerHeight * 0.8), 1);
    
    // Zoom out slightly as you scroll
    groupRef.current.position.y = scrollProgress * 10;
    const breathe = 1 + Math.sin(time * 2) * 0.02;
    groupRef.current.scale.setScalar((1 - scrollProgress * 0.3) * breathe);
    
    // Rotate the entire galaxy
    groupRef.current.rotation.y = time * 0.05;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.2; // Slight tilt

    // --- ACCURATE MOUSE UNPROJECTION TO LOCAL SPACE ---
    const targetZ = -5;
    const mouseVec = new THREE.Vector3(globalMouse.current.x, globalMouse.current.y, 0.5);
    mouseVec.unproject(camera);
    mouseVec.sub(camera.position).normalize();
    const distance = (targetZ - camera.position.z) / mouseVec.z;
    const worldMousePos = camera.position.clone().add(mouseVec.multiplyScalar(distance));

    // Convert world mouse into the group's local coordinate space
    // Since the group is scaled and rotated, we use Three.js worldToLocal!
    groupRef.current.worldToLocal(worldMousePos);
    
    shaderRef.current.uniforms.uMouse.value.copy(worldMousePos);
  });

  return (
    <group ref={groupRef} position={[8, 0, -5]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} args={[positions, 3]} />
          <bufferAttribute attach="attributes-aRandom" count={PARTICLE_COUNT} array={randoms} itemSize={1} args={[randoms, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={shaderRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function NeuralSingularity() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <QuantumShader />
      </Canvas>
    </div>
  );
}
