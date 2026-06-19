"use client";

import { useRef, useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap-register";
import { prefersReducedMotion } from "@/lib/animations";

// ─── Vertex shader (trivial full-screen quad) ─────────────────────────────────
const VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

// ─── Fragment shader — ray-marched neural cluster ─────────────────────────────
const FRAG = `#version 300 es
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_scroll;
uniform vec2  u_mouse; // normalised 0..1

out vec4 fragColor;

// ── Hash / noise ───────────────────────────────────────────────────────────────
float hash(float n) { return fract(sin(n) * 43758.5453); }
float hash2(vec2 p)  { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f*f*(3.0-2.0*f);
  float n = i.x + i.y*57.0 + 113.0*i.z;
  return mix(mix(mix(hash(n     ),hash(n+  1.0),f.x),
                 mix(hash(n+ 57.0),hash(n+ 58.0),f.x),f.y),
             mix(mix(hash(n+113.0),hash(n+114.0),f.x),
                 mix(hash(n+170.0),hash(n+171.0),f.x),f.y),f.z);
}
float fbm(vec3 p) {
  return noise3(p)*0.500 + noise3(p*2.02)*0.250
       + noise3(p*4.04)*0.125 + noise3(p*8.08)*0.0625;
}

// ── SDF primitives ─────────────────────────────────────────────────────────────
float sdSphere (vec3 p, float r)            { return length(p) - r; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 ab=b-a, ap=p-a;
  float t=clamp(dot(ap,ab)/dot(ab,ab),0.0,1.0);
  return length(ap-ab*t)-r;
}
float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz)-t.x, p.y);
  return length(q)-t.y;
}
float smin(float a, float b, float k) {
  float h=max(k-abs(a-b),0.0)/k;
  return min(a,b)-h*h*h*k*(1.0/6.0);
}

// ── Node positions (6 orbiting satellites) ────────────────────────────────────
vec3 nodePos(int idx, float t) {
  float base = float(idx) * 1.04720; // 60° apart
  float speed = 0.38 + float(idx) * 0.028;
  float a = base + t * speed;
  float orbitR  = 2.5 + sin(float(idx)*2.1 + t*0.35)*0.40;
  float orbitY  = sin(float(idx)*1.3) * 0.65;
  float wobble  = sin(t*0.5 + float(idx)) * 0.25;
  return vec3(cos(a)*orbitR, orbitY+wobble, sin(a)*orbitR);
}

// ── Scene SDF → returns vec2(dist, materialID) ────────────────────────────────
vec2 map(vec3 p, float t) {
  // Core neural cluster — bumpy organic sphere
  float bump = fbm(p*2.4 + vec3(t*0.08, t*0.06, t*0.10)) * 0.22;
  float core = sdSphere(p, 1.15 + bump);
  vec2 res = vec2(core, 1.0);

  // Equatorial ring
  float ring = sdTorus(p, vec2(1.6, 0.04));
  if (ring < res.x) res = vec2(ring, 9.0);

  // 6 orbiting tech nodes + tendrils
  for (int i = 0; i < 6; i++) {
    vec3 np = nodePos(i, t);

    // Node sphere
    float r = 0.21 + sin(float(i)*1.9 + t*1.1)*0.05;
    float node = sdSphere(p - np, r);
    if (node < res.x) res = vec2(node, 2.0 + float(i));

    // Tendril connecting core to node
    float tend = sdCapsule(p, vec3(0.0), np, 0.032 + sin(float(i)+t)*0.008);
    if (tend < res.x) res = vec2(tend, 8.0);

    // Mini ring around each node
    vec3 lp = p - np;
    float angle = float(i) * 0.52;
    vec3 rotLP = vec3(
      lp.x*cos(angle) - lp.z*sin(angle),
      lp.y,
      lp.x*sin(angle) + lp.z*cos(angle)
    );
    float nr = sdTorus(rotLP, vec2(0.32, 0.018));
    if (nr < res.x) res = vec2(nr, 9.0);
  }

  return res;
}

// ── Soft shadow ────────────────────────────────────────────────────────────────
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k, float t) {
  float res = 1.0;
  float ph  = 1e20;
  for (float ts = mint; ts < maxt;) {
    float h = map(ro + rd*ts, t).x;
    if (h < 0.001) return 0.0;
    float y = h*h/(2.0*ph);
    float d = sqrt(h*h-y*y);
    res = min(res, k*d/max(0.0,ts-y));
    ph  = h; ts += h;
  }
  return clamp(res, 0.0, 1.0);
}

// ── Normal ────────────────────────────────────────────────────────────────────
vec3 calcNormal(vec3 p, float t) {
  const float e = 0.0012;
  return normalize(vec3(
    map(p+vec3(e,0,0),t).x - map(p-vec3(e,0,0),t).x,
    map(p+vec3(0,e,0),t).x - map(p-vec3(0,e,0),t).x,
    map(p+vec3(0,0,e),t).x - map(p-vec3(0,0,e),t).x
  ));
}

// ── Ambient occlusion ─────────────────────────────────────────────────────────
float calcAO(vec3 pos, vec3 nor, float t) {
  float occ=0.0, sca=1.0;
  for (int i=0; i<6; i++) {
    float h = 0.01 + 0.14*float(i)/5.0;
    occ += (h - map(pos+h*nor, t).x) * sca;
    sca *= 0.94;
  }
  return clamp(1.0 - 2.2*occ, 0.0, 1.0);
}

// ── Palette by material ────────────────────────────────────────────────────────
vec3 palette(float matID, vec3 pos, vec3 nor, float t) {
  if (matID < 1.5) {
    // Core: deep pulsing green
    float p2 = fbm(pos*5.0 + t*0.12)*0.5+0.5;
    return mix(vec3(0.02,0.14,0.08), vec3(0.08,0.55,0.28), p2);
  }
  if (matID > 7.5) {
    // Tendrils + rings: bright signal green
    return vec3(0.22, 1.0, 0.53);
  }
  // Nodes 0-5: hue shift from green→teal→cyan
  float idx = matID - 2.0;
  vec3 a = vec3(0.02, 0.80, 0.50);
  vec3 b = vec3(0.10, 0.60, 1.00);
  return mix(a, b, idx/5.0);
}

// ── Main ──────────────────────────────────────────────────────────────────────
void main() {
  vec2 fc  = gl_FragCoord.xy;
  vec2 uv  = (fc - u_res*0.5) / u_res.y;

  float t  = u_time * 0.5;

  // ── Camera: orbit + scroll zoom-in ────────────────────────────────────────
  float scrollA = u_scroll * 4.712; // 1.5π sweep
  float camR = mix(8.5, 4.5, u_scroll);
  float camY = sin(u_scroll * 3.14159) * 2.2;

  // Mouse-driven gentle tilt
  vec2 mOff = (u_mouse - 0.5) * vec2(0.6, 0.4);

  vec3 ro = vec3(
    cos(t*0.10 + scrollA) * camR,
    camY + mOff.y * camR * 0.25 + sin(t*0.07)*1.0,
    sin(t*0.10 + scrollA) * camR
  );
  vec3 ta  = vec3(0.0, camY*0.15, 0.0);
  vec3 ww  = normalize(ta - ro);
  vec3 uu  = normalize(cross(ww, vec3(0.0,1.0,0.0)));
  vec3 vv  = cross(uu, ww);
  float fov = mix(2.4, 1.8, u_scroll);
  vec3 rd  = normalize((uv.x + mOff.x*0.15)*uu + uv.y*vv + fov*ww);

  // ── Sky / background ────────────────────────────────────────────────────────
  float skyT = 0.5 + 0.5*rd.y;
  vec3 sky = mix(vec3(0.04,0.07,0.05), vec3(0.01,0.03,0.02), skyT);

  // Star field
  vec2 starUV = rd.xz / (abs(rd.y)+0.001);
  float star = smoothstep(0.97, 1.0, hash2(floor(starUV*120.0)));
  sky += vec3(0.4,1.0,0.6) * star * 0.6 * clamp(abs(rd.y)*3.0,0.0,1.0);

  vec3 col = sky;

  // ── Ray march ───────────────────────────────────────────────────────────────
  float dist  = 0.15;
  float matID = -1.0;
  for (int i = 0; i < 110; i++) {
    vec2 res = map(ro + rd*dist, t);
    if (res.x < 0.0008*dist) { matID = res.y; break; }
    dist += res.x * 0.92;
    if (dist > 22.0) break;
  }

  // ── Shading ─────────────────────────────────────────────────────────────────
  if (matID > 0.0) {
    vec3 pos = ro + rd*dist;
    vec3 nor = calcNormal(pos, t);
    float ao  = calcAO(pos, nor, t);

    vec3 lig1 = normalize(vec3(0.6, 0.9, 0.4));
    vec3 lig2 = normalize(vec3(-0.5,-0.4,-0.6));

    float dif1 = clamp(dot(nor, lig1), 0.0, 1.0);
    float dif2 = clamp(dot(nor, lig2), 0.0, 1.0) * 0.25;
    float sha  = softShadow(pos, lig1, 0.02, 5.0, 18.0, t);
    float spe  = pow(clamp(dot(reflect(rd,nor), lig1),0.0,1.0), 40.0);
    float fre  = pow(1.0 - clamp(dot(-rd,nor),0.0,1.0), 4.0);

    vec3 matCol = palette(matID, pos, nor, t);

    col  = matCol * (dif1*sha + dif2 + 0.12) * ao;
    col += vec3(0.5, 1.0, 0.65) * spe * sha * ao;
    col += vec3(0.6, 1.0, 0.7)  * fre * 0.7 * ao;
  }

  // ── Volumetric core glow (analytical sphere glow) ────────────────────────
  {
    vec3  oc = ro;
    float b  = dot(oc, rd);
    float c  = dot(oc,oc) - 2.2*2.2;
    float h  = b*b - c;
    if (h > 0.0) {
      float len = sqrt(max(0.0, 2.2*2.2 - (length(oc + rd*(-b)) * length(oc + rd*(-b)))));
      col += vec3(0.0, 0.08, 0.04) * len * 0.6;
    }
    // Lens flare-like halo toward core
    float ang = max(0.0, dot(rd, normalize(-ro)));
    col += vec3(0.0, 0.18, 0.08) * pow(ang, 6.0) * 2.5;
  }

  // ── Node halos ───────────────────────────────────────────────────────────
  for (int i = 0; i < 6; i++) {
    vec3 np = nodePos(i, t);
    float ang2 = max(0.0, dot(rd, normalize(np - ro)));
    float idx  = float(i) / 5.0;
    vec3 haloCol = mix(vec3(0.0,0.7,0.4), vec3(0.1,0.5,1.0), idx);
    col += haloCol * pow(ang2, 14.0) * 0.6;
  }

  // ── Tone map + gamma ────────────────────────────────────────────────────
  col  = col * 1.2 / (1.0 + col * 0.9);
  col  = pow(max(col, 0.0), vec3(0.4545));

  // ── Vignette ─────────────────────────────────────────────────────────────
  float vig = 1.0 - dot(uv*0.7, uv*0.7);
  col *= clamp(vig, 0.0, 1.0);

  // Semi-transparent so portfolio text is fully readable
  float alpha = mix(0.55, 0.80, dot(col, vec3(0.3)));
  fragColor = vec4(col, alpha);
}`;

// ─── WebGL helpers ────────────────────────────────────────────────────────────
function mkShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error("GLSL: " + (gl.getShaderInfoLog(s) ?? ""));
  return s;
}

function mkProg(gl: WebGL2RenderingContext, vert: string, frag: string): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, mkShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, mkShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error("Link: " + (gl.getProgramInfoLog(p) ?? ""));
  return p;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NeuralOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // WebGL2 required for GLSL ES 3.0
    const gl = canvas.getContext("webgl2", {
      alpha: true, premultipliedAlpha: false,
      antialias: false, powerPreference: "high-performance",
    });
    if (!gl) {
      console.warn("WebGL2 not available — NeuralOrbit disabled");
      return;
    }

    // ── Program ─────────────────────────────────────────────────────────────
    let prog: WebGLProgram;
    try { prog = mkProg(gl, VERT, FRAG); }
    catch (e) { console.error(e); return; }

    const loc = {
      pos:    gl.getAttribLocation (prog, "a_pos"),
      res:    gl.getUniformLocation(prog, "u_res"),
      time:   gl.getUniformLocation(prog, "u_time"),
      scroll: gl.getUniformLocation(prog, "u_scroll"),
      mouse:  gl.getUniformLocation(prog, "u_mouse"),
    };

    // ── Full-screen quad ────────────────────────────────────────────────────
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    // ── State ───────────────────────────────────────────────────────────────
    let scroll = 0;
    let mouse  = [0.5, 0.5];
    let animId = 0;
    let start  = performance.now();

    const resize = () => {
      // Render at half res for perf, CSS scales up
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width  = Math.floor(window.innerWidth  * dpr * 0.6);
      canvas.height = Math.floor(window.innerHeight * dpr * 0.6);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouse = [e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight];
    };
    window.addEventListener("mousemove", handleMouse);

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top", end: "bottom bottom",
      onUpdate: (s) => { scroll = s.progress; },
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // ── Render loop ─────────────────────────────────────────────────────────
    const render = () => {
      const t = (performance.now() - start) * 0.001;

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc.pos);
      gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(loc.res,    canvas.width, canvas.height);
      gl.uniform1f(loc.time,   t);
      gl.uniform1f(loc.scroll, scroll);
      gl.uniform2f(loc.mouse,  mouse[0], mouse[1]);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      st.kill();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
