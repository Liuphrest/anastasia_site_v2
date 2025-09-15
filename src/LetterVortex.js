import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Local Vortex Canvas (style like StarsCanvas, slower)
const LocalVortexCanvas = ({ count = 200 }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const startedAt = useRef(performance.now());

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect?.width || 320));
    const h = Math.max(1, Math.floor(rect?.height || 320));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const makeStars = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const amount = Math.round(count);
    const arr = new Array(amount).fill(0).map(() => {
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      const vx = x0 - cx;
      const vy = y0 - cy;
      const baseAngle = Math.atan2(vy, vx);
      const baseRadius = Math.hypot(vx, vy);
      return {
        baseAngle,
        baseRadius,
        r: 0.5 + Math.random() * 1.2,
        baseAlpha: 0.45 + Math.random() * 0.45,
        angVel: (0.003 + Math.random() * 0.012) * (Math.random() < 0.5 ? -1 : 1),
        wobbleAmp: 1.6 + Math.random() * 3.5,
        wobbleFreq: 0.18 + Math.random() * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        pulseFreq: 0.35 + Math.random() * 0.6,
        pulsePhase: Math.random() * Math.PI * 2,
        personalSpin: (Math.random() * 0.01) * (Math.random() < 0.5 ? -1 : 1),
        tint: Math.random(),
      };
    });
    starsRef.current = arr;
  };

  React.useEffect(() => {
    resize();
    makeStars();
    const onResize = () => { resize(); makeStars(); };
    window.addEventListener('resize', onResize);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    const render = (now) => {
      const t = (now - startedAt.current) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);
      const globalAngle = t * 0.0015; // slower than page bg
      for (const s of starsRef.current) {
        const angle = s.baseAngle + globalAngle + t * s.angVel + t * s.personalSpin;
        const wobble = s.wobbleAmp * Math.sin(t * s.wobbleFreq + s.wobblePhase);
        const r = Math.max(0, s.baseRadius + wobble);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const pulse = 0.6 + 0.4 * Math.sin(t * s.pulseFreq + s.pulsePhase);
        const c1 = `rgba(76,29,149,${0.08 * s.baseAlpha * pulse})`;
        const c2 = `rgba(124,58,237,${0.12 * s.baseAlpha * pulse})`;
        ctx.fillStyle = Math.random() < s.tint ? c2 : c1;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// Orbiting Letters Component
const OrbitingLetters = () => {
  const groupRef = useRef();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.006;
    }
  });

  return (
    <group ref={groupRef}>
      {letters.map((letter, index) => {
        const angle = (index / letters.length) * Math.PI * 2;
        const radius = 0.7 + (index % 3) * 0.2; // Smaller orbits to avoid clipping
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (Math.sin(index) * 0.15); // Slight Z variation

        // Fixed random rotation offset from -60 to +60 degrees (using index as seed)
        const randomRotationOffset = (Math.sin(index * 12.9374) - 0.5) * 2 * (Math.PI / 3); // +60 degrees in radians

        return (
          <group
            key={letter}
            position={[x, y, z]}
            rotation={[0, 0, angle + randomRotationOffset]}
          >
            <Text
              fontSize={0.19}
              color={`hsl(${180 + index * 7}, 70%, ${70 + (index % 3) * 15}%)`} // Cyan to purple gradient
              anchorX="center"
              anchorY="middle"
              font="/fonts/ShadowsIntoLight-Regular.ttf"
            >
              {letter}
              <meshStandardMaterial
                emissive={new THREE.Color(`hsl(${180 + index * 7}, 50%, 30%)`)}
                emissiveIntensity={0.35}
              />
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Main Letter Vortex Component
const LetterVortex = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ left: '-50%', top: '-50%', width: '200%', height: '200%' }}>
      {/* 3D Canvas Background - vortex */}
      <div
        className="absolute pointer-events-none -z-15"
        style={{ top: '15%', left: '15%', width: '70%', height: '70%' }}
      >
        <LocalVortexCanvas count={300} />
      </div>

      {/* 3D Letters Canvas (larger viewport to avoid clipping) */}
      <div className="absolute pointer-events-none -z-10 overflow-visible" style={{ top: '-50%', left: '-50%', width: '200%', height: '200%' }}>
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 48 }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
          gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
          onCreated={(state) => {
            state.gl.setClearColor(0x000000, 0);
            state.gl.domElement.style.background = 'transparent';
          }}
        >
          <ambientLight intensity={0.32} />
          <pointLight position={[8, 8, 10]} intensity={0.55} />
          <group scale={[0.95, 0.95, 0.95]}>
            <OrbitingLetters />
          </group>
        </Canvas>
      </div>
    </div>
  );
};

export default LetterVortex;
