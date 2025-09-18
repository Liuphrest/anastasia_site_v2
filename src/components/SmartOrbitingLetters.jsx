import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Helpers
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (x, edge0, edge1) => {
  const t = clamp((x - edge0) / Math.max(1e-6, (edge1 - edge0)), 0, 1);
  return t * t * (3 - 2 * t);
};
const len2 = (x, y) => Math.hypot(x, y);
const norm2 = (x, y) => {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
};

export const DEFAULT_ORBIT_ASPECT = { x: 0.67, y: 1.0 };
const DEFAULT_RADII = [1.45, 1.8, 2.2];

const getEllipseXY = (radius, angle, aspect) => {
  const rx = radius * aspect.x;
  const ry = radius * aspect.y;
  return [rx * Math.cos(angle), ry * Math.sin(angle)];
};

// Elliptical normalized radius (approx band check): r_ell ~ 1.0 on ellipse boundary
const getEllipticalR = (x, y, radius, aspect) => {
  const rx = radius * aspect.x;
  const ry = radius * aspect.y;
  return Math.hypot(x / rx, y / ry);
};

// Smart Orbiting Letters with mouse repulsion only
const SmartOrbitingLetters = ({
  lettersString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ringRadii = DEFAULT_RADII,
  aspect = DEFAULT_ORBIT_ASPECT,
  ringSpeeds = [0.12, 0.16, 0.2],
  // Repulsion from cursor (single effect)
  repulseRadius = 4.0,
  repulseStrength = 0.9,
  showDebug = false,
}) => {
  const letters = useMemo(() => lettersString.split(''), [lettersString]);
  const { mouse: threeMouse } = useThree();
  const ringAnglesRef = useRef([0, 0, 0]);
  const letterPrevPosRef = useRef([]); // for velocity (if needed later)
  const letterDispRef = useRef([]); // persistent displacement for spring-back
  const letterRefs = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const ringIndices = useMemo(() => {
    const r0 = [], r1 = [], r2 = [];
    for (let i = 0; i < letters.length; i++) {
      if (i % 3 === 0) r0.push(i);
      else if (i % 3 === 2) r1.push(i);
      else r2.push(i);
    }
    return [r0, r1, r2];
  }, [letters.length]);

  // base font sizes per ring
  const baseFontSizes = [0.12, 0.15, 0.18];

  useFrame((state, delta) => {
    // Simple NDC-to-world mapping in our unit scale
    mouseRef.current.x = threeMouse.x * 2;
    mouseRef.current.y = threeMouse.y * 2;

    const ringAngles = ringAnglesRef.current;
    for (let r = 0; r < 3; r++) ringAngles[r] = (ringAngles[r] + ringSpeeds[r] * delta) % (Math.PI * 2);

    const mouse = mouseRef.current;
    const totalLen = letters.length;

    for (let ring = 0; ring < 3; ring++) {
      const indices = ringIndices[ring];
      const baseR = ringRadii[ring] ?? ringRadii[ring % ringRadii.length];
      for (let idx = 0; idx < indices.length; idx++) {
        const index = indices[idx];
        const baseAngle = (index / totalLen) * Math.PI * 2 + ringAngles[ring];
        const [bx, by] = getEllipseXY(baseR, baseAngle, aspect);
        // Persistent displacement from base (spring behavior)
        let dx = 0, dy = 0;
        const stored = letterDispRef.current[index];
        if (stored) { dx = stored[0]; dy = stored[1]; }
        let x = bx + dx, y = by + dy;

        // Repulsion from cursor in larger zone
        const dxm = x - mouse.x;
        const dym = y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < repulseRadius) {
          const w = smoothstep(dm, repulseRadius, 0); // stronger near
          const k = repulseStrength * w;
          const nx = dxm / (dm || 1);
          const ny = dym / (dm || 1);
          dx += nx * k;
          dy += ny * k;
          x = bx + dx;
          y = by + dy;
        }

        // Spring back to base (gentle)
        const restore = 1.0; // per-second restore rate (gentle)
        const damping = 0.98; // light damping to keep response
        dx = lerp(dx, 0, clamp(restore * delta, 0, 1));
        dy = lerp(dy, 0, clamp(restore * delta, 0, 1));
        dx *= damping;
        dy *= damping;
        letterDispRef.current[index] = [dx, dy];
        x = bx + dx;
        y = by + dy;

        // Update trail from velocity
        const prev = letterPrevPosRef.current[index] || [x, y];
        const vx = x - prev[0];
        const vy = y - prev[1];
        const speed = Math.hypot(vx, vy);
        letterPrevPosRef.current[index] = [x, y];

        const g = letterRefs.current[index];
        if (g) {
          g.position.set(x, y, Math.sin(index) * 0.15);
          // unique rotation + facing tangentially a bit
          const uniqueSeed = ring * 1000 + index * 17.3456;
          const uniqueRot = (Math.sin(uniqueSeed) - 0.5) * (Math.PI / 3);
          const tangential = baseAngle + Math.PI / 2;
          g.rotation.set(0, 0, tangential + uniqueRot);
        }
        // Trails removed per feedback

        // Apply font size to Text
        const text = g?.children?.[0];
        if (text && text.isMesh) {
          // handled via props on Text below; here we keep group-level transforms only
        }
      }
    }
  });

  return (
    <group>
      {showDebug && (
        <mesh position={[mouseRef.current.x || 0, mouseRef.current.y || 0, 0]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.6} />
        </mesh>
      )}
      {ringIndices.map((indices, ring) => (
        <group key={ring}>
          {indices.map((index) => {
            const letter = letters[index];
            const totalLen = letters.length;
            const baseAngle = (index / totalLen) * Math.PI * 2;
            const baseR = ringRadii[ring] ?? ringRadii[ring % ringRadii.length];
            const [bx, by] = getEllipseXY(baseR, baseAngle, aspect);
            const baseFontSizes = [0.12, 0.15, 0.18];
            const fontSize = baseFontSizes[ring] || baseFontSizes[baseFontSizes.length - 1];
            const hue = 180 + index * 7;
            const light = 70 + (index % 3) * 15;
            return (
              <group ref={(el) => (letterRefs.current[index] = el)} key={index} position={[bx, by, Math.sin(index) * 0.15]}>
                <Text
                  fontSize={fontSize}
                  color={`hsl(${hue}, 70%, ${light}%)`}
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

export default SmartOrbitingLetters;
