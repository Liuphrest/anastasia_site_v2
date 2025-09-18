import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Константы
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const RING_COUNT = 3;
const RING_SPEEDS = [0.12, 0.16, 0.2];
const FONT_SIZES = [0.12, 0.15, 0.18];
export const DEFAULT_ORBIT_ASPECT = { x: 0.67, y: 1.0 };

// Утилиты
export const getEllipsePosition = (radius, angle, aspect = DEFAULT_ORBIT_ASPECT) => {
  const rx = radius * aspect.x;
  const ry = radius * aspect.y;
  return [rx * Math.cos(angle), ry * Math.sin(angle)];
};

// Компонент отдельной буквы с физикой
const Letter = ({ 
  letter, 
  index, 
  ring, 
  radius, 
  baseAngle, 
  fontSize,
  mouseWorldPos 
}) => {
  const meshRef = useRef();
  const velocityRef = useRef({ x: 0, y: 0 });
  const displacementRef = useRef({ x: 0, y: 0 });
  
  // Цвета
  const hue = 180 + index * 7;
  const lightness = 70 + (index % 3) * 15;
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Базовая позиция на орбите
    const [baseX, baseY] = getEllipsePosition(radius, baseAngle, DEFAULT_ORBIT_ASPECT);
    const baseZ = Math.sin(index) * 0.15;
    
    // Получаем 3D позицию мыши
    const mouseX = mouseWorldPos.current.x;
    const mouseY = mouseWorldPos.current.y;
    
    // Текущая позиция с учетом смещения
    const currentX = baseX + displacementRef.current.x;
    const currentY = baseY + displacementRef.current.y;
    
    // Расстояние до курсора
    const distToMouse = Math.sqrt(
      Math.pow(currentX - mouseX, 2) + 
      Math.pow(currentY - mouseY, 2)
    );
    
    // Параметры отталкивания
    const repelRadius = 0.8; // Радиус влияния курсора
    const repelStrength = 1.5; // Сила отталкивания
    
    // Силы
    let forceX = 0;
    let forceY = 0;
    
    // Отталкивание от курсора
    if (distToMouse < repelRadius && distToMouse > 0.01) {
      const pushForce = (1 - distToMouse / repelRadius) * repelStrength;
      const dirX = (currentX - mouseX) / distToMouse;
      const dirY = (currentY - mouseY) / distToMouse;
      
      forceX += dirX * pushForce;
      forceY += dirY * pushForce;
    }
    
    // Пружина возврата на орбиту
    const springK = 3.0; // Жесткость пружины
    const damping = 0.85; // Демпфирование
    
    forceX -= displacementRef.current.x * springK;
    forceY -= displacementRef.current.y * springK;
    
    // Обновляем скорость и позицию (интеграция Эйлера)
    velocityRef.current.x += forceX * delta;
    velocityRef.current.y += forceY * delta;
    
    // Применяем демпфирование
    velocityRef.current.x *= damping;
    velocityRef.current.y *= damping;
    
    // Обновляем смещение
    displacementRef.current.x += velocityRef.current.x * delta;
    displacementRef.current.y += velocityRef.current.y * delta;
    
    // Ограничиваем максимальное смещение
    const maxDisplacement = 1.0;
    const dispMag = Math.sqrt(
      displacementRef.current.x ** 2 + 
      displacementRef.current.y ** 2
    );
    if (dispMag > maxDisplacement) {
      displacementRef.current.x = (displacementRef.current.x / dispMag) * maxDisplacement;
      displacementRef.current.y = (displacementRef.current.y / dispMag) * maxDisplacement;
    }
    
    // Финальная позиция
    const finalX = baseX + displacementRef.current.x;
    const finalY = baseY + displacementRef.current.y;
    
    // Устанавливаем позицию
    meshRef.current.position.set(finalX, finalY, baseZ);
    
    // Вращение
    const uniqueSeed = ring * 1000 + index * 17.3456;
    const randomRotation = (Math.sin(uniqueSeed) - 0.5) * (Math.PI / 3);
    const tangentialRotation = baseAngle + Math.PI / 2;
    meshRef.current.rotation.set(0, 0, tangentialRotation + randomRotation);
  });
  
  return (
    <group ref={meshRef}>
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
};

// Компонент для форсирования анимационного цикла
const AnimationForcer = () => {
  useFrame(() => {
    // Этот компонент просто запускает анимационный цикл
    // Без него Canvas не обновляется
  });
  return null;
};

// Основной компонент OrbitingLetters
const OrbitingLetters = ({ 
  ringRadii = [1.35, 1.42, 1.5], 
  aspect = DEFAULT_ORBIT_ASPECT 
}) => {
  const { camera, mouse } = useThree();
  const ringAnglesRef = useRef([0, 0, 0]);
  const mouseWorldPos = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());
  const mousePlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  
  // Распределение букв по кольцам
  const ringIndices = useMemo(() => {
    const rings = [[], [], []];
    for (let i = 0; i < LETTERS.length; i++) {
      rings[i % RING_COUNT].push(i);
    }
    return rings;
  }, []);
  
  useFrame((state, delta) => {
    // Обновляем углы колец
    for (let i = 0; i < RING_COUNT; i++) {
      ringAnglesRef.current[i] = (ringAnglesRef.current[i] + RING_SPEEDS[i] * delta) % (Math.PI * 2);
    }
    
    // Преобразуем координаты мыши в мировые координаты
    raycaster.current.setFromCamera(mouse, camera);
    
    // Находим пересечение с плоскостью z=0
    const intersectPoint = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(mousePlane.current, intersectPoint);
    
    // Сохраняем мировые координаты мыши
    if (intersectPoint) {
      mouseWorldPos.current.x = intersectPoint.x;
      mouseWorldPos.current.y = intersectPoint.y;
    }
  });
  
  return (
    <group>
      <AnimationForcer />
      {ringIndices.map((indices, ring) => (
        <group key={ring}>
          {indices.map((letterIndex) => {
            const baseAngle = (letterIndex / LETTERS.length) * Math.PI * 2 + ringAnglesRef.current[ring];
            
            return (
              <Letter
                key={letterIndex}
                letter={LETTERS[letterIndex]}
                index={letterIndex}
                ring={ring}
                radius={ringRadii[ring]}
                baseAngle={baseAngle}
                fontSize={FONT_SIZES[ring]}
                mouseWorldPos={mouseWorldPos}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
};

export default OrbitingLetters;