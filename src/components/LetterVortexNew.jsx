import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import VortexBackgroundCanvas from './VortexBackgroundCanvas.jsx';

// Константы
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const RING_COUNT = 3;
const RING_SPEEDS = [0.12, 0.16, 0.2];
const FONT_SIZES = [0.12, 0.15, 0.18];
const DEFAULT_ORBIT_ASPECT = { x: 0.67, y: 1.0 };

// Утилиты
const getEllipsePosition = (radius, angle, aspect = DEFAULT_ORBIT_ASPECT) => {
  const rx = radius * aspect.x;
  const ry = radius * aspect.y;
  return [rx * Math.cos(angle), ry * Math.sin(angle)];
};

// Все буквы в одном компоненте для оптимизации
const AllLetters = ({ ringRadii = [1.35, 1.42, 1.5] }) => {
  const { camera, mouse, gl } = useThree();
  const groupRef = useRef();
  const ringAngles = useRef([0, 0, 0]);
  const mouseWorld = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  
  // Состояния для каждой буквы
  const letterStates = useRef(
    LETTERS.map(() => ({
      velocity: { x: 0, y: 0 },
      displacement: { x: 0, y: 0 }
    }))
  );
  
  // Распределение букв по кольцам
  const ringIndices = useMemo(() => {
    const rings = [[], [], []];
    for (let i = 0; i < LETTERS.length; i++) {
      rings[i % RING_COUNT].push(i);
    }
    return rings;
  }, []);
  
  // Форсируем постоянный рендеринг
  useEffect(() => {
    if (gl) {
      gl.setAnimationLoop(() => {});
    }
  }, [gl]);
  
  useFrame((state, delta) => {
    // Обновляем углы колец
    for (let i = 0; i < RING_COUNT; i++) {
      ringAngles.current[i] += RING_SPEEDS[i] * delta;
    }
    
    // Получаем позицию мыши в мировых координатах
    raycaster.current.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, intersect);
    if (intersect) {
      mouseWorld.current.x = intersect.x;
      mouseWorld.current.y = intersect.y;
    }
    
    // Обновляем каждую букву
    if (!groupRef.current) return;
    
    let letterIndex = 0;
    for (let ring = 0; ring < RING_COUNT; ring++) {
      const indices = ringIndices[ring];
      const radius = ringRadii[ring];
      
      for (const idx of indices) {
        const letter = groupRef.current.children[letterIndex];
        if (!letter) {
          letterIndex++;
          continue;
        }
        
        const state = letterStates.current[idx];
        const baseAngle = (idx / LETTERS.length) * Math.PI * 2 + ringAngles.current[ring];
        const [baseX, baseY] = getEllipsePosition(radius, baseAngle);
        
        // Текущая позиция с учетом смещения
        const currentX = baseX + state.displacement.x;
        const currentY = baseY + state.displacement.y;
        
        // Расстояние до мыши
        const dx = currentX - mouseWorld.current.x;
        const dy = currentY - mouseWorld.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Силы
        let forceX = 0, forceY = 0;
        
        // Отталкивание от мыши
        const repelRadius = 0.8;
        if (dist < repelRadius && dist > 0.01) {
          const strength = (1 - dist / repelRadius) * 1.5;
          forceX += (dx / dist) * strength;
          forceY += (dy / dist) * strength;
        }
        
        // Возврат на орбиту (пружина)
        forceX -= state.displacement.x * 3.0;
        forceY -= state.displacement.y * 3.0;
        
        // Обновляем физику
        state.velocity.x += forceX * delta;
        state.velocity.y += forceY * delta;
        state.velocity.x *= 0.85;
        state.velocity.y *= 0.85;
        
        state.displacement.x += state.velocity.x * delta;
        state.displacement.y += state.velocity.y * delta;
        
        // Ограничение смещения
        const dispMag = Math.sqrt(state.displacement.x ** 2 + state.displacement.y ** 2);
        if (dispMag > 1.0) {
          state.displacement.x = (state.displacement.x / dispMag) * 1.0;
          state.displacement.y = (state.displacement.y / dispMag) * 1.0;
        }
        
        // Применяем позицию и вращение
        letter.position.x = baseX + state.displacement.x;
        letter.position.y = baseY + state.displacement.y;
        letter.position.z = Math.sin(idx) * 0.15;
        
        const uniqueSeed = ring * 1000 + idx * 17.3456;
        const randomRot = (Math.sin(uniqueSeed) - 0.5) * (Math.PI / 3);
        letter.rotation.z = baseAngle + Math.PI / 2 + randomRot;
        
        letterIndex++;
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      {ringIndices.map((indices, ring) =>
        indices.map((idx) => {
          const hue = 180 + idx * 7;
          const lightness = 70 + (idx % 3) * 15;
          const fontSize = FONT_SIZES[ring];
          
          return (
            <Text
              key={idx}
              fontSize={fontSize}
              color={`hsl(${hue}, 70%, ${lightness}%)`}
              anchorX="center"
              anchorY="middle"
              font="/fonts/ShadowsIntoLight-Regular.ttf"
            >
              {LETTERS[idx]}
              <meshStandardMaterial
                emissive={new THREE.Color(`hsl(${hue}, 50%, 35%)`)}
                emissiveIntensity={0.6}
              />
            </Text>
          );
        })
      )}
    </group>
  );
};

// Новый компонент LetterVortex все-в-одном
const LetterVortexNew = React.memo(({ ringRadii = [1.35, 1.42, 1.5] }) => {
  const canvasRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);

  // Задержка для плавного появления при первой отрисовке
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Поддерживаем transform и прозрачность канваса после обновлений
  useEffect(() => {
    const applyTransform = () => {
      if (!canvasRef.current) {
        return;
      }
      canvasRef.current.style.transform = 'translate(-50%, -50%) translateZ(0)';
      canvasRef.current.style.backgroundColor = 'transparent';
    };

    applyTransform();
    const interval = window.setInterval(applyTransform, 250);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-visible z-20"
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {/* Background vortex */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          top: '50%',
          left: '50%',
          width: '240%',
          height: '240%',
          transform: 'translate(-50%, -50%)',
          background: 'transparent'
        }}
      >
        <VortexBackgroundCanvas count={300} />
      </div>

      {/* 3D Letters */}
      <div
        ref={canvasRef}
        className="absolute z-20"
        style={{
          top: '50%',
          left: '50%',
          width: '350%',
          height: '350%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
          willChange: 'transform',
          background: 'transparent'
        }}
      >
        <Canvas
          mode="concurrent"
          camera={{ position: [0, 0, 4.2], fov: 48 }}
          style={{ 
            width: '100%', 
            height: '100%', 
            background: 'transparent'
          }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            premultipliedAlpha: false
          }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor('transparent', 0);
            gl.setClearAlpha(0);
            if (gl.domElement?.style) {
              gl.domElement.style.backgroundColor = 'transparent';
            }
            scene.background = null;
          }}
        >
          <ambientLight intensity={0.32} />
          <pointLight position={[8, 8, 10]} intensity={0.55} />
          <group scale={[0.8, 0.8, 0.8]}>
            <AllLetters ringRadii={ringRadii} />
          </group>
        </Canvas>
      </div>
    </div>
  );
});

export default LetterVortexNew;