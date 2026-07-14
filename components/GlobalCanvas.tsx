"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/animations";

const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
const PARTICLE_COUNT = isMobile ? 100 : 320; // Drastically drop particle count for maximum physics loop performance

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
uniform bool uIsLightMode;
varying vec3 vColor;
void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float intensity = 1.0 - (dist * 2.0);
    intensity = pow(intensity, 1.5);
    
    vec3 mixColor = uIsLightMode ? vec3(0.0) : vec3(1.0);
    vec3 coreColor = mix(vColor, mixColor, pow(intensity, 3.0));
    
    // Proper black mode has high-density ink dots instead of blurry gray rings
    float alpha = uIsLightMode ? (intensity > 0.12 ? 0.95 : 0.0) : (intensity * 0.9);
    gl_FragColor = vec4(coreColor, alpha);
}
`;

function NeuralMatrix({ isLightMode, isBatteryPower }: { isLightMode: boolean; isBatteryPower: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();
  const maxDistance = isMobile ? 12.0 : (isLightMode ? 3.8 : 5.5);
  const maxDistanceSq = maxDistance * maxDistance;

  const lastFrameTime = useRef(0);
  const activeCount = isMobile ? 120 : (isBatteryPower ? 220 : PARTICLE_COUNT);

  const { positions, basePositions, velocities, colors, sizes, angles, radii } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const basePos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const szs = new Float32Array(PARTICLE_COUNT);
    const angs = new Float32Array(PARTICLE_COUNT);
    const rds = new Float32Array(PARTICLE_COUNT);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
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

      vel[i] = (4.0 / Math.pow(radius, 1.5)) * 0.084; 

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
      uniforms: {
        uIsLightMode: { value: false }
      },
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
  }, []);

  // Update dynamic colors and blending on theme toggle
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const colorAttr = geom.getAttribute("color") as THREE.BufferAttribute;
    if (!colorAttr) return;

    const cols = colorAttr.array as Float32Array;
    for (let i = 0; i < activeCount; i++) {
      const radius = radii[i];
      const isPhotonRing = radius < 7.0;
      if (isLightMode) {
        if (isPhotonRing) {
          // Inner core (hidden vault): deep ink black
          cols[i * 3] = 0.0;
          cols[i * 3 + 1] = 0.0;
          cols[i * 3 + 2] = 0.0;
        } else {
          // Outer vortex: deep dark blue
          cols[i * 3] = 0.0;
          cols[i * 3 + 1] = 0.20;
          cols[i * 3 + 2] = 0.66;
        }
      } else {
        if (isPhotonRing) {
          const mixVal = Math.random();
          cols[i * 3] = 1.0; 
          cols[i * 3 + 1] = mixVal > 0.5 ? 1.0 : 0.8; 
          cols[i * 3 + 2] = mixVal > 0.8 ? 0.8 : 0.2; 
        } else {
          cols[i * 3] = 1.0; 
          cols[i * 3 + 1] = 0.4 + Math.random() * 0.4; 
          cols[i * 3 + 2] = 0.0;
        }
      }
    }
    colorAttr.needsUpdate = true;

    if (pointShaderMaterial) {
      pointShaderMaterial.uniforms.uIsLightMode.value = isLightMode;
      pointShaderMaterial.blending = isLightMode ? THREE.NormalBlending : THREE.AdditiveBlending;
      pointShaderMaterial.needsUpdate = true;
    }

    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      if (mat) {
        mat.blending = isLightMode ? THREE.NormalBlending : THREE.AdditiveBlending;
        mat.needsUpdate = true;
      }
    }
  }, [isLightMode, radii, pointShaderMaterial]);

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

    if (isBatteryPower) {
      const frameDelta = time - lastFrameTime.current;
      if (frameDelta < 1 / 35) return;
      lastFrameTime.current = time;
    }

    if (!hasInteracted.current) {
      targetMouse.current.x = Math.sin(time * 0.4) * 0.4;
      targetMouse.current.y = Math.sin(time * 0.8) * 0.2;
    }

    const vector = new THREE.Vector3(targetMouse.current.x, targetMouse.current.y, 0.5);
    vector.unproject(camera);
    vector.sub(camera.position).normalize();
    const distance = (0 - camera.position.z) / vector.z;
    const mouseWorldPos = camera.position.clone().add(vector.multiplyScalar(distance));
    
    globalMouse.current.lerp(mouseWorldPos, 0.1);

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

      pointsRef.current.rotation.x = 0;
      pointsRef.current.rotation.z = 0;
      pointsRef.current.rotation.y = time * 0.035 + scrollPerc * Math.PI * 4;
      linesRef.current.rotation.x = 0;
      linesRef.current.rotation.z = 0;
      linesRef.current.rotation.y = time * 0.035 + scrollPerc * Math.PI * 4;
    } else {
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.2;
      pointsRef.current.rotation.z = Math.cos(time * 0.1) * 0.1;
      pointsRef.current.rotation.y = time * 0.021;
      linesRef.current.rotation.x = pointsRef.current.rotation.x;
      linesRef.current.rotation.z = pointsRef.current.rotation.z;
      linesRef.current.rotation.y = pointsRef.current.rotation.y;
    }

    for (let i = 0; i < activeCount; i++) {
      const i3 = i * 3;
      
      angles[i] += velocities[i];
      const r = radii[i];
      
      const turbulence = Math.sin(time * 3.0 + i) * 0.2;
      
      const px = Math.cos(angles[i]) * (r + turbulence);
      const pz = Math.sin(angles[i]) * (r + turbulence);
      
      const gravityDrop = Math.max(0, (10 - r) * 0.05);

      posArray[i3] = px;
      posArray[i3 + 1] = basePositions[i3 + 1] - gravityDrop + Math.sin(time * 2.0 + i)*0.2;
      posArray[i3 + 2] = pz;

      if (!isMobile) {
        const worldPos = new THREE.Vector3(posArray[i3], posArray[i3+1], posArray[i3+2]);
        worldPos.applyEuler(pointsRef.current.rotation);
        
        const dx = globalMouse.current.x - worldPos.x;
        const dy = globalMouse.current.y - worldPos.y;
        const dz = globalMouse.current.z - worldPos.z;
        const distToMouseSq = dx * dx + dy * dy + dz * dz;
        
        if (distToMouseSq < 144.0) { 
          const distToMouse = Math.sqrt(distToMouseSq);
          const force = (12.0 - distToMouse) / 12.0;
          
          const toMouse = new THREE.Vector3(dx, dy, dz).normalize();
          const up = new THREE.Vector3(0, 1, 0);
          const tangent = new THREE.Vector3().crossVectors(toMouse, up).normalize();
          
          const localToMouse = toMouse.clone().applyEuler(new THREE.Euler(-pointsRef.current.rotation.x, -pointsRef.current.rotation.y, -pointsRef.current.rotation.z));
          const localTangent = tangent.clone().applyEuler(new THREE.Euler(-pointsRef.current.rotation.x, -pointsRef.current.rotation.y, -pointsRef.current.rotation.z));
          
          posArray[i3] += (localToMouse.x * 0.8 + localTangent.x * 2.5) * force;
          posArray[i3 + 1] += (localToMouse.y * 0.8 + localTangent.y * 2.5) * force;
          posArray[i3 + 2] += (localToMouse.z * 0.8 + localTangent.z * 2.5) * force;
        }
        
        if (clickWave.current.active) {
          const dxClick = clickWave.current.origin.x - worldPos.x;
          const dzClick = clickWave.current.origin.z - worldPos.z;
          const distToClick = Math.sqrt(dxClick * dxClick + dzClick * dzClick);
          const waveDist = Math.abs(distToClick - clickWave.current.radius);
          
          if (waveDist < 3.5) {
             const rippleIntensity = (Math.cos((waveDist / 3.5) * Math.PI) + 1.0) * 0.5;
             posArray[i3 + 1] += rippleIntensity * 2.5; // Smoothly lift them up
          }
        }
      }

      for (let j = i + 1; j < activeCount; j++) {
        const j3 = j * 3;
        
        const dx2 = posArray[i3] - posArray[j3];
        if (Math.abs(dx2) > maxDistance) continue;
        
        const dy2 = posArray[i3 + 1] - posArray[j3 + 1];
        if (Math.abs(dy2) > maxDistance) continue;
        
        const dz2 = posArray[i3 + 2] - posArray[j3 + 2];
        if (Math.abs(dz2) > maxDistance) continue;

        const distSq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;

        if (distSq < maxDistanceSq) {
          const dist = Math.sqrt(distSq);
          
          const pulse = (Math.sin(time * 3.0 + i * 0.1) + 1.0) * 0.5 + 0.2;
          const maxAlpha = isLightMode ? 0.56 : 0.8;
          const alpha = (1.0 - dist / maxDistance) * pulse * maxAlpha;
          
          linePositions[lineIndex * 3] = posArray[i3];
          linePositions[lineIndex * 3 + 1] = posArray[i3 + 1];
          linePositions[lineIndex * 3 + 2] = posArray[i3 + 2];
          
          if (isLightMode) {
            lineColors[lineIndex * 3] = 1.0 - (1.0 - colors[i3]) * alpha;
            lineColors[lineIndex * 3 + 1] = 1.0 - (1.0 - colors[i3 + 1]) * alpha;
            lineColors[lineIndex * 3 + 2] = 1.0 - (1.0 - colors[i3 + 2]) * alpha;
          } else {
            lineColors[lineIndex * 3] = colors[i3] * alpha;
            lineColors[lineIndex * 3 + 1] = colors[i3 + 1] * alpha;
            lineColors[lineIndex * 3 + 2] = colors[i3 + 2] * alpha;
          }
          lineIndex++;
 
          linePositions[lineIndex * 3] = posArray[j3];
          linePositions[lineIndex * 3 + 1] = posArray[j3 + 1];
          linePositions[lineIndex * 3 + 2] = posArray[j3 + 2];
          
          if (isLightMode) {
            lineColors[lineIndex * 3] = 1.0 - (1.0 - colors[j3]) * alpha;
            lineColors[lineIndex * 3 + 1] = 1.0 - (1.0 - colors[j3 + 1]) * alpha;
            lineColors[lineIndex * 3 + 2] = 1.0 - (1.0 - colors[j3 + 2]) * alpha;
          } else {
            lineColors[lineIndex * 3] = colors[j3] * alpha;
            lineColors[lineIndex * 3 + 1] = colors[j3 + 1] * alpha;
            lineColors[lineIndex * 3 + 2] = colors[j3 + 2] * alpha;
          }
          lineIndex++;
        }
      }
    }

    positionsAttr.needsUpdate = true;
    pointsRef.current.geometry.setDrawRange(0, activeCount);
    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
    lineGeometry.setDrawRange(0, lineIndex);
    
    if (isMobile) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.1);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 28, 0.1);
      camera.lookAt(0, 0, 0);
    } else {
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
        <lineBasicMaterial vertexColors transparent opacity={isLightMode ? 0.52 : 0.4} blending={isLightMode ? THREE.NormalBlending : THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

const getShapes = () => {
  const grid = [];
  for(let i=0; i<64; i++) {
     const r = Math.floor(i/8);
     const c = i%8;
     grid.push({ x: (c-3.5)*22, y: (r-3.5)*22, r: 45 });
  }

  const question = [];
  for(let i=0; i<8; i++) {
     const a = (i/8)*Math.PI*2;
     question.push({ x: Math.cos(a)*6, y: 35 + Math.sin(a)*6, r: 0 });
  }
  for(let i=0; i<16; i++) {
     question.push({ x: 0, y: 15 - (25*i/15), r: 0 });
  }
  for(let i=0; i<10; i++) {
     const a = Math.PI + (Math.PI/2 * i/9);
     question.push({ x: 20 + Math.cos(a)*20, y: -10 + Math.sin(a)*20, r: 45 });
  }
  for(let i=0; i<30; i++) {
     const a = 0 - (Math.PI * i/29);
     question.push({ x: Math.cos(a)*20, y: -30 + Math.sin(a)*20, r: 0 });
  }

  const brackets = [];
  for(let i=0; i<16; i++) brackets.push({ x: -40 + (-30*i/15), y: -40 + (40*i/15), r: -45 });
  for(let i=0; i<16; i++) brackets.push({ x: -70 + (30*i/15), y: 0 + (40*i/15), r: 45 });
  for(let i=0; i<16; i++) brackets.push({ x: 40 + (30*i/15), y: -40 + (40*i/15), r: 45 });
  for(let i=0; i<16; i++) brackets.push({ x: 70 + (-30*i/15), y: 0 + (40*i/15), r: -45 });

  const crown = [];
  for(let i=0; i<16; i++) crown.push({ x: -50 + (100*i/15), y: 40, r: 0 }); // base
  for(let i=0; i<8; i++) crown.push({ x: -50 + (10*i/7), y: 40 + (-60*i/7), r: 80 }); // left up
  for(let i=0; i<8; i++) crown.push({ x: -40 + (25*i/7), y: -20 + (40*i/7), r: -45 }); // left down
  for(let i=0; i<8; i++) crown.push({ x: -15 + (15*i/7), y: 20 + (-70*i/7), r: 75 }); // center up
  for(let i=0; i<8; i++) crown.push({ x: 0 + (15*i/7), y: -50 + (70*i/7), r: -75 }); // center down
  for(let i=0; i<8; i++) crown.push({ x: 15 + (25*i/7), y: 20 + (-40*i/7), r: 45 }); // right up
  for(let i=0; i<8; i++) crown.push({ x: 40 + (10*i/7), y: -20 + (60*i/7), r: -80 }); // right down

  const cert = [];
  for(let i=0; i<16; i++) cert.push({ x: -35 + (70*i/15), y: -45, r: 0 }); // Top
  for(let i=0; i<12; i++) cert.push({ x: 35, y: -45 + (75*i/11), r: 90 }); // Right
  for(let i=0; i<16; i++) cert.push({ x: 35 - (70*i/15), y: 30, r: 0 }); // Bottom
  for(let i=0; i<12; i++) cert.push({ x: -35, y: 30 - (75*i/11), r: 90 }); // Left
  for(let i=0; i<8; i++) {
     const a = (i/8)*Math.PI*2;
     cert.push({ x: 20 + Math.cos(a)*10, y: 20 + Math.sin(a)*10, r: 0 }); // Seal
  }

  const atom = [];
  for(let i=0; i<16; i++) {
     const a = (i/16)*Math.PI*2;
     const tangent = Math.atan2(Math.cos(a)*15, -Math.sin(a)*40);
     atom.push({ x: Math.cos(a)*40, y: Math.sin(a)*15, r: tangent*180/Math.PI });
  }
  for(let i=0; i<16; i++) {
     const a = (i/16)*Math.PI*2;
     const x0 = Math.cos(a)*40;
     const y0 = Math.sin(a)*15;
     const x = x0*Math.cos(Math.PI/3) - y0*Math.sin(Math.PI/3);
     const y = x0*Math.sin(Math.PI/3) + y0*Math.cos(Math.PI/3);
     const tangent = Math.atan2(Math.cos(a)*15, -Math.sin(a)*40);
     atom.push({ x, y, r: (tangent + Math.PI/3)*180/Math.PI });
  }
  for(let i=0; i<16; i++) {
     const a = (i/16)*Math.PI*2;
     const x0 = Math.cos(a)*40;
     const y0 = Math.sin(a)*15;
     const x = x0*Math.cos(-Math.PI/3) - y0*Math.sin(-Math.PI/3);
     const y = x0*Math.sin(-Math.PI/3) + y0*Math.cos(-Math.PI/3);
     const tangent = Math.atan2(Math.cos(a)*15, -Math.sin(a)*40);
     atom.push({ x, y, r: (tangent - Math.PI/3)*180/Math.PI });
  }
  for(let i=0; i<16; i++) {
     const a = (i/16)*Math.PI*2;
     atom.push({ x: Math.cos(a)*8, y: Math.sin(a)*8, r: (a*180/Math.PI)+90 });
  }

  const phone = [];
  for(let i=0; i<8; i++) phone.push({ x: -15 + (30*i/7), y: -10, r: 0 }); // top grip
  for(let i=0; i<4; i++) phone.push({ x: 15 + (10*i/3), y: -10 - (15*i/3), r: 45 }); // right stem inner
  for(let i=0; i<4; i++) phone.push({ x: 25 + (20*i/3), y: -25 + (10*i/3), r: -30 }); // right ear top
  for(let i=0; i<10; i++) {
     const a = -0.5 + (Math.PI/2 * i/9);
     phone.push({ x: 35 + Math.cos(a)*18, y: 0 + Math.sin(a)*18, r: a*180/Math.PI + 90 }); // right arc
  }
  for(let i=0; i<4; i++) phone.push({ x: 40 - (20*i/3), y: 15 - (10*i/3), r: 45 }); // right stem outer
  for(let i=0; i<8; i++) phone.push({ x: 20 - (40*i/7), y: 5, r: 0 }); // bottom grip
  for(let i=0; i<4; i++) phone.push({ x: -20 - (20*i/3), y: 5 + (10*i/3), r: -45 }); // left stem outer
  for(let i=0; i<10; i++) {
     const a = (Math.PI - 0.5) - (Math.PI/2 * i/9); 
     phone.push({ x: -35 + Math.cos(a)*18, y: 0 + Math.sin(a)*18, r: a*180/Math.PI + 90 }); // left arc
  }
  for(let i=0; i<4; i++) phone.push({ x: -45 + (20*i/3), y: -15 - (10*i/3), r: 30 }); // left ear top
  for(let i=0; i<4; i++) phone.push({ x: -25 + (10*i/3), y: -25 + (15*i/3), r: -45 }); // left stem inner
  for(let i=0; i<4; i++) phone.push({ x: (i%2===0 ? -5 : 5), y: 15 + (12*i), r: -45 }); // cord hanging down

  return [grid, question, brackets, crown, cert, atom, phone];
};

const MobileAnimeGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const shards = useMemo(() => {
    const allShapes = getShapes();
    const items = [];
    for (let i = 0; i < 64; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      const distFromCenter = Math.sqrt(Math.pow(col - 3.5, 2) + Math.pow(row - 3.5, 2));
      const delay = (1 - distFromCenter / 5); // 0.0 to 1.0 (Outer edge is 0, Center is 1)

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
      
      const numTransitions = 6;
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
        
        const explodeStart = s.delay * 0.15; // 0.0 to 0.15
        const explodeEnd = explodeStart + 0.3; // 0.3 to 0.45
        const assembleStart = 0.5 + s.delay * 0.15; // 0.5 to 0.65
        const assembleEnd = assembleStart + 0.3; // 0.8 to 0.95
        
        let tx = 0, ty = 0, tz = 0, tr = 0, op = 1;

        if (progress < explodeStart) {
            tx = shape1.x; ty = shape1.y; tz = 0; tr = shape1.r;
        } else if (progress < explodeEnd) {
            let local = (progress - explodeStart) / (explodeEnd - explodeStart);
            let ease = local * local * local; // Cubic ease in
            tx = shape1.x + s.rx * 300 * ease;
            ty = shape1.y + s.ry * 300 * ease;
            tz = s.rz * 400 * ease;
            tr = shape1.r + s.rRot * ease;
            op = 1 - (ease * 0.85); // Fade heavily during chaos
        } else if (progress < assembleStart) {
            tx = shape1.x + s.rx * 300;
            ty = shape1.y + s.ry * 300;
            tz = s.rz * 400;
            tr = shape1.r + s.rRot;
            op = 0.15;
        } else if (progress < assembleEnd) {
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
    <div className="fixed inset-0 w-full h-full bg-[#ffffff] overflow-hidden pointer-events-none" style={{ zIndex: 0, perspective: '1000px' }}>
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#eef3f9] via-[#ffffff] to-[#ffffff] opacity-100" />

      <div 
        className="absolute top-1/2 left-1/2 w-[250px] h-[250px] rounded-full blur-[80px]"
        style={{
           background: 'radial-gradient(circle, rgba(0,51,170,0.06) 0%, rgba(0,0,0,0) 70%)',
           transform: 'translate(-50%, -50%)',
         }}
      />

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
              backgroundColor: s.isOrange ? '#000000' : '#0033aa',
              boxShadow: s.isOrange ? '0 0 6px rgba(0,0,0,0.1)' : '0 0 6px rgba(0,51,170,0.15)',
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

  if (isMobile) {
    return <MobileAnimeGrid />;
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500" 
      style={{ zIndex: 0, opacity: isLightMode ? 0.98 : 0.55 }} 
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={isBatteryPower ? 1.0 : [1, 1.2]}
      >
        <NeuralMatrix isLightMode={isLightMode} isBatteryPower={isBatteryPower} />
      </Canvas>
    </div>
  );
}
