"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/animations";

const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
const PARTICLE_COUNT = isMobile ? 120 : 600; // Drastically drop particle count on mobile for maximum physics performance
const MAX_DISTANCE = isMobile ? 12.0 : 5.5; // Huge connection distance on mobile so it still forms a cohesive web
const MAX_DISTANCE_SQ = MAX_DISTANCE * MAX_DISTANCE;

// Custom shader for ultra-premium glowing data nodes
const pointVertexShader = `
attribute float aSize;
varying vec3 vColor;
void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (35.0 / -mvPosition.z); // Perspective scaling
    gl_Position = projectionMatrix * mvPosition;
}
`;

const pointFragmentShader = `
varying vec3 vColor;
void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Core glow falloff
    float intensity = 1.0 - (dist * 2.0);
    intensity = pow(intensity, 1.5);
    
    // Add a hot white core
    vec3 coreColor = mix(vColor, vec3(1.0), pow(intensity, 3.0));
    gl_FragColor = vec4(coreColor, intensity * 0.9);
}
`;

function NeuralMatrix() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();

  // Initialize Particles into a Massive Spinning Accretion Disk
  const { positions, basePositions, velocities, colors, sizes, angles, radii } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const basePos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const szs = new Float32Array(PARTICLE_COUNT);
    const angs = new Float32Array(PARTICLE_COUNT);
    const rds = new Float32Array(PARTICLE_COUNT);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // ACCRETION DISK: Massive spinning spiral
      const radius = 5.0 + Math.pow(Math.random(), 2) * 35.0; 
      const angle = Math.random() * Math.PI * 2;
      
      const thickness = (radius - 5.0) * 0.15; 
      const py = (Math.random() - 0.5) * thickness;
      
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      
      pos[i * 3] = px; pos[i * 3 + 1] = py; pos[i * 3 + 2] = pz;
      basePos[i * 3] = px; basePos[i * 3 + 1] = py; basePos[i * 3 + 2] = pz;

      angs[i] = angle;
      rds[i] = radius;

      // Make it spin at exactly 1.4x the original slow speed
      vel[i] = (4.0 / Math.pow(radius, 1.5)) * 0.084; 

      // Brighter Colors
      const isPhotonRing = radius < 7.0;
      if (isPhotonRing) {
        const mixVal = Math.random();
        cols[i * 3] = 1.0; 
        cols[i * 3 + 1] = mixVal > 0.5 ? 1.0 : 0.8; 
        cols[i * 3 + 2] = mixVal > 0.8 ? 0.8 : 0.2; 
        szs[i] = Math.random() * 6.0 + 4.0; // Larger glow nodes
      } else {
        cols[i * 3] = 1.0; 
        cols[i * 3 + 1] = 0.4 + Math.random() * 0.4; 
        cols[i * 3 + 2] = 0.0;  
        szs[i] = Math.random() * 4.0 + 1.5; 
      }
    }
    
    return { positions: pos, basePositions: basePos, velocities: vel, colors: cols, sizes: szs, angles: angs, radii: rds };
  }, []);

  // Pre-allocate BufferGeometry for lines to prevent GC pauses
  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const maxConnections = PARTICLE_COUNT * 20 * 3; // safe buffer
    const lPos = new Float32Array(maxConnections);
    const lCol = new Float32Array(maxConnections);
    
    geom.setAttribute('position', new THREE.BufferAttribute(lPos, 3).setUsage(THREE.DynamicDrawUsage));
    geom.setAttribute('color', new THREE.BufferAttribute(lCol, 3).setUsage(THREE.DynamicDrawUsage));
    return geom;
  }, []);

  const pointShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
  }, []);

  const globalMouse = useRef(new THREE.Vector3(0, 0, 0));
  const targetMouse = useRef(new THREE.Vector2(0, 0));
  const clickWave = useRef({ active: false, radius: 0, origin: new THREE.Vector3() });
  const hasInteracted = useRef(false);
  const diveTarget = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      hasInteracted.current = true;
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      targetMouse.current.x = (clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(clientY / window.innerHeight) * 2 + 1;
    };
    const handleClick = () => {
      clickWave.current = { active: true, radius: 0, origin: globalMouse.current.clone() };
    };

    window.addEventListener("mousemove", handleMove);
    if (!isMobile) {
      window.addEventListener("touchmove", handleMove, { passive: true });
      window.addEventListener("touchstart", (e) => {
        handleMove(e);
      }, { passive: true });
    }
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        handleClick();
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (!isMobile) {
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchstart", handleMove);
      }
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current || prefersReducedMotion()) return;

    const time = state.clock.getElapsedTime();

    // Idle Wandering if no interaction yet
    if (!hasInteracted.current) {
      // Cinematic slow figure-8
      targetMouse.current.x = Math.sin(time * 0.4) * 0.4;
      targetMouse.current.y = Math.sin(time * 0.8) * 0.2;
    }

    // Smoothly unproject mouse to 3D world space
    const vector = new THREE.Vector3(targetMouse.current.x, targetMouse.current.y, 0.5);
    vector.unproject(camera);
    vector.sub(camera.position).normalize();
    const distance = (0 - camera.position.z) / vector.z;
    const mouseWorldPos = camera.position.clone().add(vector.multiplyScalar(distance));
    
    // Lerp global mouse for smoothness
    globalMouse.current.lerp(mouseWorldPos, 0.1);

    // Update Shockwave
    if (clickWave.current.active) {
      clickWave.current.radius += 0.08; // Very slow and majestic expansion
      if (clickWave.current.radius > 40) clickWave.current.active = false;
    }

    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positionsAttr.array as Float32Array;
    
    const linePosAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
    const lineColAttr = lineGeometry.attributes.color as THREE.BufferAttribute;
    const linePositions = linePosAttr.array as Float32Array;
    const lineColors = lineColAttr.array as Float32Array;
    
    let lineIndex = 0;

    // Slowly tilt the entire accretion disk over time
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.2;
    pointsRef.current.rotation.z = Math.cos(time * 0.1) * 0.1;
    linesRef.current.rotation.x = pointsRef.current.rotation.x;
    linesRef.current.rotation.z = pointsRef.current.rotation.z;

    // Add exactly 1.4x the original global spin to the entire group
    pointsRef.current.rotation.y = time * 0.021;
    linesRef.current.rotation.y = time * 0.021;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Accretion Disk Animation
      angles[i] += velocities[i];
      const r = radii[i];
      
      const turbulence = Math.sin(time * 3.0 + i) * 0.2;
      
      const px = Math.cos(angles[i]) * (r + turbulence);
      const pz = Math.sin(angles[i]) * (r + turbulence);
      
      const gravityDrop = Math.max(0, (10 - r) * 0.05);

      posArray[i3] = px;
      posArray[i3 + 1] = basePositions[i3 + 1] - gravityDrop + Math.sin(time * 2.0 + i)*0.2;
      posArray[i3 + 2] = pz;

      // -----------------------------------------
      // MOUSE INTERACTION (Mini Gravity Well)
      // -----------------------------------------
      if (!isMobile) {
        // We must account for group rotation when calculating distance to mouse.
        // Easiest hack: transform local pos to world, check distance, apply local force.
        const worldPos = new THREE.Vector3(posArray[i3], posArray[i3+1], posArray[i3+2]);
        worldPos.applyEuler(pointsRef.current.rotation);
        
        const dx = globalMouse.current.x - worldPos.x;
        const dy = globalMouse.current.y - worldPos.y;
        const dz = globalMouse.current.z - worldPos.z;
        const distToMouseSq = dx * dx + dy * dy + dz * dz;
        
        // Increased interaction radius from 6.0 to 12.0
        if (distToMouseSq < 144.0) { 
          const distToMouse = Math.sqrt(distToMouseSq);
          const force = (12.0 - distToMouse) / 12.0;
          
          // Create a whirlpool effect by taking the cross product
          const toMouse = new THREE.Vector3(dx, dy, dz).normalize();
          const up = new THREE.Vector3(0, 1, 0);
          const tangent = new THREE.Vector3().crossVectors(toMouse, up).normalize();
          
          // Inverse transform forces back to local space
          const localToMouse = toMouse.clone().applyEuler(new THREE.Euler(-pointsRef.current.rotation.x, -pointsRef.current.rotation.y, -pointsRef.current.rotation.z));
          const localTangent = tangent.clone().applyEuler(new THREE.Euler(-pointsRef.current.rotation.x, -pointsRef.current.rotation.y, -pointsRef.current.rotation.z));
          
          // Pull particles in (Gravity) AND swirl them around (Vortex)
          posArray[i3] += (localToMouse.x * 0.8 + localTangent.x * 2.5) * force;
          posArray[i3 + 1] += (localToMouse.y * 0.8 + localTangent.y * 2.5) * force;
          posArray[i3 + 2] += (localToMouse.z * 0.8 + localTangent.z * 2.5) * force;
        }
        
        // Click Wave Interaction - Smooth Cosine Ripple from Click Origin
        if (clickWave.current.active) {
          const dxClick = clickWave.current.origin.x - worldPos.x;
          const dzClick = clickWave.current.origin.z - worldPos.z;
          const distToClick = Math.sqrt(dxClick * dxClick + dzClick * dzClick);
          const waveDist = Math.abs(distToClick - clickWave.current.radius);
          
          if (waveDist < 3.5) {
             // Smooth bell curve displacement (1.0 at wave center, 0.0 at wave edge)
             const rippleIntensity = (Math.cos((waveDist / 3.5) * Math.PI) + 1.0) * 0.5;
             posArray[i3 + 1] += rippleIntensity * 2.5; // Smoothly lift them up
          }
        }
      }

      // Check connections
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const j3 = j * 3;
        
        // QUICK REJECTS: Avoid expensive distance checks if they are far apart on any axis
        const dx2 = posArray[i3] - posArray[j3];
        if (Math.abs(dx2) > MAX_DISTANCE) continue;
        
        const dy2 = posArray[i3 + 1] - posArray[j3 + 1];
        if (Math.abs(dy2) > MAX_DISTANCE) continue;
        
        const dz2 = posArray[i3 + 2] - posArray[j3 + 2];
        if (Math.abs(dz2) > MAX_DISTANCE) continue;

        const distSq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;

        if (distSq < MAX_DISTANCE_SQ) {
          const dist = Math.sqrt(distSq);
          
          const pulse = (Math.sin(time * 3.0 + i * 0.1) + 1.0) * 0.5 + 0.2;
          const alpha = (1.0 - dist / MAX_DISTANCE) * pulse * 0.8;
          
          linePositions[lineIndex * 3] = posArray[i3];
          linePositions[lineIndex * 3 + 1] = posArray[i3 + 1];
          linePositions[lineIndex * 3 + 2] = posArray[i3 + 2];
          
          lineColors[lineIndex * 3] = colors[i3] * alpha;
          lineColors[lineIndex * 3 + 1] = colors[i3 + 1] * alpha;
          lineColors[lineIndex * 3 + 2] = colors[i3 + 2] * alpha;
          lineIndex++;

          linePositions[lineIndex * 3] = posArray[j3];
          linePositions[lineIndex * 3 + 1] = posArray[j3 + 1];
          linePositions[lineIndex * 3 + 2] = posArray[j3 + 2];
          
          lineColors[lineIndex * 3] = colors[j3] * alpha;
          lineColors[lineIndex * 3 + 1] = colors[j3 + 1] * alpha;
          lineColors[lineIndex * 3 + 2] = colors[j3 + 2] * alpha;
          lineIndex++;
        }
      }
    }

    positionsAttr.needsUpdate = true;
    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
    lineGeometry.setDrawRange(0, lineIndex);
    
    // Scroll Parallax Camera - The Seamless Wormhole Orbit
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollPerc = scrollY / maxScroll;
    
    // Instead of linear movement (which cuts when loop wraps 1 -> 0),
    // we use a 360-degree orbit so scrollPerc 0 and 1 resolve to the exact same position!
    const orbitAngle = scrollPerc * Math.PI * 2;
    
    // Target normal orbit
    const targetOrbitX = Math.sin(orbitAngle) * 25;
    const targetOrbitZ = Math.cos(orbitAngle) * 25;
    const targetOrbitY = 4 + Math.cos(orbitAngle * 2) * 4; // Bobs between 0 and 8

    // VORTEX DIVE MATH (Hidden Cave)
    let diveFactor = 0;
    const achSection = document.getElementById("achievements");

    if (achSection) {
       const rect = achSection.getBoundingClientRect();
       const windowHeight = window.innerHeight;
       
       let fadeIn = (windowHeight - rect.top) / (windowHeight * 0.2); 
       
       // Fade out starts ONLY when Achievements is completely off screen (rect.bottom <= 0)
       let fadeOut = (rect.bottom + windowHeight * 0.5) / (windowHeight * 0.5);
       
       diveFactor = Math.min(1.0, Math.max(0.0, fadeIn));
       diveFactor = Math.min(diveFactor, Math.max(0.0, fadeOut));
       diveFactor = Math.pow(diveFactor, 1.2); 
    }

    // Smoothly track dive target
    diveTarget.current = THREE.MathUtils.lerp(diveTarget.current, diveFactor, 0.08);

    // Arc over the disk during transition so it doesn't slice through the camera
    const arcHeight = Math.sin(diveTarget.current * Math.PI) * 12.0;

    // Apply Dive interpolation
    camera.position.x = THREE.MathUtils.lerp(targetOrbitX, 0.0, diveTarget.current);
    camera.position.y = THREE.MathUtils.lerp(targetOrbitY, 0.1, diveTarget.current) + arcHeight;
    camera.position.z = THREE.MathUtils.lerp(targetOrbitZ, 0.1, diveTarget.current);

    // Look at origin, but tilt down slightly when in the cave to frame pure darkness
    const baseLookAtY = THREE.MathUtils.lerp(0, -2.0, diveTarget.current);
    
    // Add immersive mouse panning ONLY when inside the cave
    const cavePanX = targetMouse.current.x * 2.5 * diveTarget.current;
    const cavePanY = targetMouse.current.y * 1.5 * diveTarget.current;

    camera.lookAt(cavePanX, baseLookAtY + cavePanY, 0);
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} args={[colors, 3]} />
          <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} args={[sizes, 1]} />
        </bufferGeometry>
        <primitive object={pointShaderMaterial} attach="material" />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

const MobileScrollTunnel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);

  useEffect(() => {
    // We run the event listener on window but calculate based on document height
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScroll.current = scrollY / maxScroll;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    let animationFrameId: number;
    const loop = () => {
       // Super smooth lerp for the CSS variables
       currentScroll.current += (targetScroll.current - currentScroll.current) * 0.08; 
       if (containerRef.current) {
          containerRef.current.style.setProperty('--scroll', currentScroll.current.toString());
       }
       animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
       window.removeEventListener("scroll", handleScroll);
       cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden pointer-events-none" 
      style={{ zIndex: 0, perspective: '800px' }}
      ref={containerRef}
    >
      {/* Deep Space Void Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d001a] via-[#050505] to-[#000000] opacity-100" />
      
      {/* Dynamic 3D Neon Tunnel */}
      <div 
        className="absolute top-1/2 left-1/2 w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          // Tilt it flat and move the camera "forward" and "up" as we scroll
          transform: 'translate(-50%, -50%) rotateX(75deg) translateY(calc(var(--scroll) * -800px)) translateZ(calc(var(--scroll) * 500px))',
        }}
      >
         {Array.from({ length: 25 }).map((_, i) => (
           <div 
             key={i}
             className="absolute top-1/2 left-1/2 rounded-full mix-blend-screen"
             style={{
                width: `${300 + i * 150}px`,
                height: `${300 + i * 150}px`,
                marginTop: `-${(300 + i * 150) / 2}px`,
                marginLeft: `-${(300 + i * 150) / 2}px`,
                // Alternating neon borders for a cyber-matrix effect
                borderTop: '3px solid rgba(160, 50, 255, 0.8)',
                borderRight: '3px solid rgba(50, 150, 255, 0.2)',
                borderBottom: '3px solid rgba(160, 50, 255, 0.2)',
                borderLeft: '3px solid rgba(50, 150, 255, 0.8)',
                boxShadow: '0 0 40px rgba(160, 50, 255, 0.4), inset 0 0 40px rgba(50, 150, 255, 0.4)',
                // Twisting rings: each ring rotates in alternating directions based on scroll!
                transform: `translateZ(${i * -200 + 400}px) rotateZ(calc(var(--scroll) * ${i % 2 === 0 ? 360 : -360}deg))`,
                opacity: Math.max(0, 1 - (i / 22)),
             }}
           />
         ))}
      </div>

      {/* Center Core that reacts to scroll depth */}
      <div 
        className="absolute top-1/2 left-1/2 w-[250px] h-[250px] rounded-full blur-[80px]"
        style={{
           background: 'radial-gradient(circle, rgba(160,50,255,0.7) 0%, rgba(50,150,255,0.3) 50%, rgba(0,0,0,0) 100%)',
           transform: 'translate(-50%, -50%) scale(calc(1 + var(--scroll) * 1.5))',
        }}
      />
    </div>
  );
};

export default function GlobalCanvas() {
  if (isMobile) {
    return <MobileScrollTunnel />;
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 0, opacity: 0.8 }} 
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={isMobile ? 1 : [1, 1.5]} // Force 1x resolution on mobile to save GPU
      >
        <NeuralMatrix />
        {!isMobile && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={4.0} mipmapBlur />
            <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
            <Noise opacity={0.03} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
