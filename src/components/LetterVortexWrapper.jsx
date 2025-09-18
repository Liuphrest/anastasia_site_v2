import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import VortexBackgroundCanvas from './VortexBackgroundCanvas.jsx';
import OrbitingLetters from './OrbitingLetters.jsx';

// Компонент для постоянного обновления сцены
const ForceRender = () => {
  useFrame(() => {
    // Просто существует чтобы заставить рендер работать
  });
  return null;
};

// Main Letter Vortex Component (composes background + letters)
const LetterVortex = ({ ringRadii = [1.35, 1.42, 1.5], aspect }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      {/* 3D Canvas Background - vortex */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          top: '50%',
          left: '50%',
          width: '240%',
          height: '240%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <VortexBackgroundCanvas count={300} />
      </div>

      {/* 3D Letters Canvas */}
      <div
        className="absolute z-20"
        style={{
          top: '50%',
          left: '50%',
          width: '350%',
          height: '350%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 48 }}
          style={{ width: '100%', height: '100%', background: 'transparent', backgroundColor: 'transparent' }}
          gl={{ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
          }}
          frameloop="always"
          dpr={[1, 2]}
        >
          <ForceRender />
          <ambientLight intensity={0.32} />
          <pointLight position={[8, 8, 10]} intensity={0.55} />
          <group scale={[0.8, 0.8, 0.8]}>
            <OrbitingLetters ringRadii={ringRadii} aspect={aspect} />
          </group>
        </Canvas>
      </div>
    </div>
  );
};

export default LetterVortex;