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

      // Brighter Colors & Larger Sizes for Mobile (to compensate for no Bloom)
      const sizeMultiplier = isMobile ? 1.8 : 1.0;
      
      const isPhotonRing = radius < 7.0;
      if (isPhotonRing) {
        const mixVal = Math.random();
        cols[i * 3] = 1.0; 
        cols[i * 3 + 1] = mixVal > 0.5 ? 1.0 : 0.8; 
        cols[i * 3 + 2] = mixVal > 0.8 ? 0.8 : 0.2; 
        szs[i] = (Math.random() * 6.0 + 4.0) * sizeMultiplier; // Larger glow nodes
      } else {
        cols[i * 3] = 1.0; 
        cols[i * 3 + 1] = 0.4 + Math.random() * 0.4; 
        cols[i * 3 + 2] = 0.0;  
        szs[i] = (Math.random() * 4.0 + 1.5) * sizeMultiplier; 
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

    if (isMobile) {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollPerc = scrollY / maxScroll;

      // Mobile: Lock flat (edge-on) and spin. Twist the pillar based on scroll depth!
      pointsRef.current.rotation.x = 0;
      pointsRef.current.rotation.z = 0;
      pointsRef.current.rotation.y = time * 0.035 + scrollPerc * Math.PI * 4;
      linesRef.current.rotation.x = 0;
      linesRef.current.rotation.z = 0;
      linesRef.current.rotation.y = time * 0.035 + scrollPerc * Math.PI * 4;
    } else {
      // Desktop: Slowly tilt the entire accretion disk over time
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.2;
      pointsRef.current.rotation.z = Math.cos(time * 0.1) * 0.1;
      pointsRef.current.rotation.y = time * 0.021;
      linesRef.current.rotation.x = pointsRef.current.rotation.x;
      linesRef.current.rotation.z = pointsRef.current.rotation.z;
      linesRef.current.rotation.y = pointsRef.current.rotation.y;
    }

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
    
    if (isMobile) {
      // Mobile: Fixed camera to prevent scroll lag. Looking straight at the edge.
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.1);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 28, 0.1);
      camera.lookAt(0, 0, 0);
    } else {
      // Desktop: Scroll Parallax Camera - The Seamless Wormhole Orbit
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollPerc = scrollY / maxScroll;
      
      const orbitAngle = scrollPerc * Math.PI * 2;
      const targetOrbitX = Math.sin(orbitAngle) * 25;
      const targetOrbitZ = Math.cos(orbitAngle) * 25;
      const targetOrbitY = 4 + Math.cos(orbitAngle * 2) * 4;
  
      let diveFactor = 0;
      const achSection = document.getElementById("achievements");
  
      if (achSection) {
         const rect = achSection.getBoundingClientRect();
         const windowHeight = window.innerHeight;
         let fadeIn = (windowHeight - rect.top) / (windowHeight * 0.2); 
         let fadeOut = (rect.bottom + windowHeight * 0.5) / (windowHeight * 0.5);
         diveFactor = Math.min(1.0, Math.max(0.0, fadeIn));
         diveFactor = Math.min(diveFactor, Math.max(0.0, fadeOut));
         diveFactor = Math.pow(diveFactor, 1.2); 
      }
  
      diveTarget.current = THREE.MathUtils.lerp(diveTarget.current, diveFactor, 0.08);
      const arcHeight = Math.sin(diveTarget.current * Math.PI) * 12.0;
  
      camera.position.x = THREE.MathUtils.lerp(targetOrbitX, 0.0, diveTarget.current);
      camera.position.y = THREE.MathUtils.lerp(targetOrbitY, 0.1, diveTarget.current) + arcHeight;
      camera.position.z = THREE.MathUtils.lerp(targetOrbitZ, 0.1, diveTarget.current);
  
      const baseLookAtY = THREE.MathUtils.lerp(0, -2.0, diveTarget.current);
      const cavePanX = targetMouse.current.x * 2.5 * diveTarget.current;
      const cavePanY = targetMouse.current.y * 1.5 * diveTarget.current;
  
      camera.lookAt(cavePanX, baseLookAtY + cavePanY, 0);
    }
  });

  return (
    <group rotation-z={isMobile ? Math.PI / 2 : 0}>
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

const getShapes = () => {
  // Shape 0: Grid (8x8)
  const grid = [];
  for(let i=0; i<64; i++) {
     const r = Math.floor(i/8);
     const c = i%8;
     grid.push({ x: (c-3.5)*22, y: (r-3.5)*22, r: 45 });
  }

  // Shape 1: Diamond (About / Experience)
  const diamond = [];
  for(let i=0; i<16; i++) diamond.push({ x: 0 - (40*i/15), y: -60 + (60*i/15), r: 50 });
  for(let i=0; i<16; i++) diamond.push({ x: -40 + (40*i/15), y: 0 + (60*i/15), r: -50 });
  for(let i=0; i<16; i++) diamond.push({ x: 0 + (40*i/15), y: 60 - (60*i/15), r: -50 });
  for(let i=0; i<16; i++) diamond.push({ x: 40 - (40*i/15), y: 0 - (60*i/15), r: 50 });

  // Shape 2: Code Brackets < > (Projects)
  const brackets = [];
  for(let i=0; i<16; i++) brackets.push({ x: -40 + (-30*i/15), y: -40 + (40*i/15), r: -45 });
  for(let i=0; i<16; i++) brackets.push({ x: -70 + (30*i/15), y: 0 + (40*i/15), r: 45 });
  for(let i=0; i<16; i++) brackets.push({ x: 40 + (30*i/15), y: -40 + (40*i/15), r: 45 });
  for(let i=0; i<16; i++) brackets.push({ x: 70 + (-30*i/15), y: 0 + (40*i/15), r: -45 });

  // Shape 3: Crown (Achievements / Skills)
  const crown = [];
  for(let i=0; i<16; i++) crown.push({ x: -50 + (100*i/15), y: 40, r: 0 }); // base
  for(let i=0; i<8; i++) crown.push({ x: -50 + (10*i/7), y: 40 + (-60*i/7), r: 80 }); // left up
  for(let i=0; i<8; i++) crown.push({ x: -40 + (25*i/7), y: -20 + (40*i/7), r: -45 }); // left down
  for(let i=0; i<8; i++) crown.push({ x: -15 + (15*i/7), y: 20 + (-70*i/7), r: 75 }); // center up
  for(let i=0; i<8; i++) crown.push({ x: 0 + (15*i/7), y: -50 + (70*i/7), r: -75 }); // center down
  for(let i=0; i<8; i++) crown.push({ x: 15 + (25*i/7), y: 20 + (-40*i/7), r: 45 }); // right up
  for(let i=0; i<8; i++) crown.push({ x: 40 + (10*i/7), y: -20 + (60*i/7), r: -80 }); // right down

  // Shape 4: Mobile Phone (Contact)
  const phone = [];
  for(let i=0; i<12; i++) phone.push({ x: -30 + (60*i/11), y: -60, r: 0 }); // top
  for(let i=0; i<18; i++) phone.push({ x: 30, y: -60 + (120*i/17), r: 90 }); // right
  for(let i=0; i<12; i++) phone.push({ x: 30 - (60*i/11), y: 60, r: 0 }); // bottom
  for(let i=0; i<18; i++) phone.push({ x: -30, y: 60 - (120*i/17), r: 90 }); // left
  for(let i=0; i<4; i++) phone.push({ x: -6 + (12*i/3), y: 45, r: 0 }); // home button notch

  return [grid, diamond, brackets, crown, phone];
};

const MobileAnimeGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pre-calculate all geometric points and exploded chaos vectors so the GPU has zero math to do during scroll
  const shards = useMemo(() => {
    const allShapes = getShapes();
    const items = [];
    for (let i = 0; i < 64; i++) {
      // Stagger logic based on distance from center of the initial grid
      const row = Math.floor(i / 8);
      const col = i % 8;
      const distFromCenter = Math.sqrt(Math.pow(col - 3.5, 2) + Math.pow(row - 3.5, 2));
      const delay = (1 - distFromCenter / 5); // 0.0 to 1.0 (Outer edge is 0, Center is 1)

      // Random explosion vectors
      const rx = (Math.random() - 0.5) * 2;
      const ry = (Math.random() - 0.5) * 2;
      const rz = (Math.random() - 0.5) * 2;
      const rRot = (Math.random() - 0.5) * 1080;
      
      const positions = allShapes.map(shape => shape[i]);
      const isOrange = Math.random() > 0.4;

      items.push({ positions, delay, rx, ry, rz, rRot, isOrange });
    }
    return items;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      
      // We have 5 shapes, so 4 transitions spanning the whole page
      const numTransitions = 4;
      const rawPerc = Math.min(1, Math.max(0, scrollY / maxScroll));
      const scaledPerc = rawPerc * numTransitions;
      const segment = Math.min(numTransitions - 1, Math.floor(scaledPerc));
      const progress = scaledPerc - segment; // 0.0 to 1.0 within the current transition segment
      
      if (!containerRef.current) return;
      const children = containerRef.current.children;
      
      for (let i = 0; i < 64; i++) {
        const s = shards[i];
        const el = children[i] as HTMLElement;
        
        const shape1 = s.positions[segment];
        const shape2 = s.positions[segment + 1];
        
        // Stagger timelines: Outer edges explode first, assemble first.
        const explodeStart = s.delay * 0.15; // 0.0 to 0.15
        const explodeEnd = explodeStart + 0.3; // 0.3 to 0.45
        const assembleStart = 0.5 + s.delay * 0.15; // 0.5 to 0.65
        const assembleEnd = assembleStart + 0.3; // 0.8 to 0.95
        
        let tx = 0, ty = 0, tz = 0, tr = 0, op = 1;

        if (progress < explodeStart) {
            // Stable Assembled State 1
            tx = shape1.x; ty = shape1.y; tz = 0; tr = shape1.r;
        } else if (progress < explodeEnd) {
            // Exploding into chaos!
            let local = (progress - explodeStart) / (explodeEnd - explodeStart);
            let ease = local * local * local; // Cubic ease in
            tx = shape1.x + s.rx * 300 * ease;
            ty = shape1.y + s.ry * 300 * ease;
            tz = s.rz * 400 * ease;
            tr = shape1.r + s.rRot * ease;
            op = 1 - (ease * 0.85); // Fade heavily during chaos
        } else if (progress < assembleStart) {
            // Suspended in deep space mid-air
            tx = shape1.x + s.rx * 300;
            ty = shape1.y + s.ry * 300;
            tz = s.rz * 400;
            tr = shape1.r + s.rRot;
            op = 0.15;
        } else if (progress < assembleEnd) {
            // Magnetizing into State 2!
            let local = (progress - assembleStart) / (assembleEnd - assembleStart);
            let ease = 1 - Math.pow(1 - local, 3); // Cubic ease out
            
            const chaosX = shape2.x + s.rx * 300;
            const chaosY = shape2.y + s.ry * 300;
            const chaosZ = s.rz * 400;
            const chaosR = shape2.r + s.rRot;
            
            tx = chaosX + (shape2.x - chaosX) * ease;
            ty = chaosY + (shape2.y - chaosY) * ease;
            tz = chaosZ + (0 - chaosZ) * ease;
            tr = chaosR + (shape2.r - chaosR) * ease;
            op = 0.15 + (ease * 0.85);
        } else {
            // Stable Assembled State 2
            tx = shape2.x; ty = shape2.y; tz = 0; tr = shape2.r;
        }

        el.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotate(${tr}deg)`;
        el.style.opacity = op.toFixed(2);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shards]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0d0b08] overflow-hidden pointer-events-none" style={{ zIndex: 0, perspective: '1000px' }}>
      
      {/* Background Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1205] via-[#0d0b08] to-[#050300] opacity-100" />

      {/* Constant Breathing Background Core */}
      <div 
        className="absolute top-1/2 left-1/2 w-[250px] h-[250px] rounded-full blur-[80px]"
        style={{
           background: 'radial-gradient(circle, rgba(240,160,0,0.12) 0%, rgba(122,81,0,0.05) 50%, rgba(0,0,0,0) 100%)',
           transform: 'translate(-50%, -50%)',
        }}
      />

      {/* The 3D Matrix Container */}
      <div 
        ref={containerRef}
        className="absolute top-[45%] left-1/2" // Slightly higher than center
        style={{ transformStyle: 'preserve-3d' }}
      >
        {shards.map((s, i) => (
          <div 
            key={i}
            className="absolute"
            style={{
              width: '14px',
              height: '3px',
              marginLeft: '-7px',
              marginTop: '-1.5px',
              backgroundColor: s.isOrange ? '#f0a000' : '#f0e8d0',
              boxShadow: s.isOrange ? '0 0 10px rgba(240,160,0,0.8)' : '0 0 8px rgba(240,232,208,0.5)',
              borderRadius: '2px',
              willChange: 'transform, opacity',
              transform: `translate3d(${s.positions[0].x}px, ${s.positions[0].y}px, 0px) rotate(${s.positions[0].r}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function GlobalCanvas() {
  if (isMobile) {
    return <MobileAnimeGrid />;
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
        dpr={[1, 1.5]}
      >
        <NeuralMatrix />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={4.0} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
