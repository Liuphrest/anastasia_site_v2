import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const RING_COUNT = 3;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const RING_RADII = [1.35, 1.42, 1.5];
const RING_SPEEDS = [0.12, 0.16, 0.2];
const ELLIPSE_ASPECT = { x: 0.67, y: 1.0 };
const FONT_SIZES = [0.12, 0.15, 0.18];

// Utility functions
const getEllipsePosition = (radius, angle, aspect = ELLIPSE_ASPECT) => {
  const rx = radius * aspect.x;
  const ry = radius * aspect.y;
  return [rx * Math.cos(angle), ry * Math.sin(angle)];
};

const smoothstep = (edge0, edge1, x) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

// Orbiting Letters Component
const OrbitingLetters = ({ ringRadii, aspect }) => {
  const { mouse } = useThree();
  const ringAnglesRef = useRef([0, 0, 0]);
  const letterRefs = useRef([]);
  const letterStatesRef = useRef([]); // Store angular displacement and velocity for each letter

  // Distribute letters across rings
  const ringIndices = useMemo(() => {
    const rings = [[], [], []];
    for (let i = 0; i < LETTERS.length; i++) {
      rings[i % RING_COUNT].push(i);
    }
    return rings;
  }, []);

  // Initialize letter states
  useMemo(() => {
    letterStatesRef.current = LETTERS.map(() => ({
      angularDisplacement: 0,
      angularVelocity: 0,
      baseAngle: 0
    }));
  }, []);

  useFrame((state, delta) => {
    const mouseX = mouse.x * 2;
    const mouseY = mouse.y * 2;

    // Update ring base angles
    for (let i = 0; i < RING_COUNT; i++) {
      ringAnglesRef.current[i] = (ringAnglesRef.current[i] + RING_SPEEDS[i] * delta) % (Math.PI * 2);
    }

    // Update each letter
    for (let ring = 0; ring < RING_COUNT; ring++) {
      const indices = ringIndices[ring];
      const baseRadius = ringRadii[ring];

      for (const letterIndex of indices) {
        const letterRef = letterRefs.current[letterIndex];
        if (!letterRef) continue;

        // Calculate base position on orbit (clean orbital motion)
        const baseAngle = (letterIndex / LETTERS.length) * Math.PI * 2 + ringAnglesRef.current[ring];
        const [baseX, baseY] = getEllipsePosition(baseRadius, baseAngle, aspect);

        // Simple mouse repulsion effect
        let x = baseX;
        let y = baseY;

        const distanceToMouse = Math.hypot(baseX - mouseX, baseY - mouseY);
        const repelRadius = 1.2;

        if (distanceToMouse < repelRadius && distanceToMouse > 0) {
          // Simple repulsion - push away from mouse
          const repelStrength = (1 - distanceToMouse / repelRadius) * 0.3;
          const pushX = (baseX - mouseX) / distanceToMouse * repelStrength;
          const pushY = (baseY - mouseY) / distanceToMouse * repelStrength;

          x = baseX + pushX;
          y = baseY + pushY;
        }

        const z = Math.sin(letterIndex * 0.5) * 0.15;

        // Update letter position and rotation
        letterRef.position.set(x, y, z);

        // Unique rotation per letter + slight tangential rotation
        const uniqueSeed = ring * 1000 + letterIndex * 17.3456;
        const uniqueRotation = (Math.sin(uniqueSeed) - 0.5) * (Math.PI / 3);
        const tangentialRotation = baseAngle + Math.PI / 2;
        letterRef.rotation.set(0, 0, tangentialRotation + uniqueRotation);
      }
    }
  });

  return (
    <group>
      {ringIndices.map((indices, ring) => (
        <group key={ring}>
          {indices.map((letterIndex) => {
            const letter = LETTERS[letterIndex];
            const fontSize = FONT_SIZES[ring];
            const hue = 180 + letterIndex * 7;
            const lightness = 70 + (letterIndex % 3) * 15;

            return (
              <group
                key={letterIndex}
                ref={(el) => (letterRefs.current[letterIndex] = el)}
              >
                <Text
                  fontSize={fontSize}
                  color={`hsl(${hue}, 70%, ${lightness}%)`}
                  anchorX="center"
                  anchorY="middle"
                  font="/fonts/ShadowsIntoLight-Regular.ttf"
                >
                  {letter}
                  <meshStandardMaterial
                    emissive={new THREE.Color(`hsl(${hue}, 50%, 35%)`)}
                    emissiveIntensity={0.6}
                  />
                </Text>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
};

// Main Clean Letter Vortex Component
const CleanLetterVortex = ({ ringRadii = [1.45, 1.8, 2.2], aspect = ELLIPSE_ASPECT }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      <div
        className="absolute pointer-events-none z-20"
        style={{
          top: '50%',
          left: '50%',
          width: '350%',
          height: '350%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 48 }}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            pointerEvents: 'none'
          }}
          gl={{ alpha: true, antialias: true }}
          onCreated={(state) => {
            state.gl.setClearColor(0x000000, 0);
          }}
        >
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

export default CleanLetterVortex;