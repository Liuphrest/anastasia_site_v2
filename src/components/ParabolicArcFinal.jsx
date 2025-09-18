import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const ParabolicArcFinal = ({ className = '', debug = false }) => {
  const svgRef = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(svgRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Путь основанный на ваших координатах, но сглаженный
  const createPath = () => {
    // Адаптируем под реальное расположение (фото слева, текст справа)
    // Инвертируем X координаты и корректируем под layout
    return `
      M 12,41
      C 11,40.5 10.5,41 10.5,42.5
      C 10.5,44 11,45.5 12,46.5
      C 13,47.5 14,48 16,48.5
      C 19,49 23,48.5 27,47.5
      C 31,46.5 35,45.5 39,45
      C 43,44.5 47,44 51,44
      C 54,44 56,43.5 56.5,41
      L 56.5,34
    `;
  };

  const pathVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0 
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          duration: 2.5, 
          ease: [0.4, 0, 0.2, 1] // Custom easing
        },
        opacity: { 
          duration: 0.3 
        }
      }
    }
  };

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        // Позиционируем относительно контейнера секции
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'visible'
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ 
          zIndex: 1,
          // Убираем лишние трансформации
        }}
      >
        <defs>
          {/* Основной градиент */}
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {/* Начало - резкое появление */}
            <stop offset="0%" stopColor="#FFD4A3" stopOpacity="0.05" />
            <stop offset="3%" stopColor="#FFD4A3" stopOpacity="0.7" />
            <stop offset="5%" stopColor="#FFC68A" stopOpacity="1" />
            
            {/* Яркая видимая часть */}
            <stop offset="15%" stopColor="#FFB871" stopOpacity="1" />
            <stop offset="25%" stopColor="#FFAA58" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FF9C3F" stopOpacity="0.9" />
            
            {/* Начало затухания с 40% */}
            <stop offset="40%" stopColor="#FFB871" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#FFC68A" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FFD4A3" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#FFE2BC" stopOpacity="0.15" />
            <stop offset="85%" stopColor="#FFF0D5" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          
          {/* Свечение */}
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Мягкое свечение для ореола */}
          <filter id="arcSoftGlow">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>

        {/* Фоновое мягкое свечение */}
        <motion.path
          d={createPath()}
          stroke="#FFB871"
          strokeWidth="1.2"
          fill="none"
          filter="url(#arcSoftGlow)"
          opacity="0.2"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 0.2,
              transition: { duration: 0.5 }
            }
          }}
        />

        {/* Основная линия */}
        <motion.path
          d={createPath()}
          stroke="url(#mainGradient)"
          strokeWidth="0.5"
          fill="none"
          filter="url(#arcGlow)"
          initial="hidden"
          animate={controls}
          variants={pathVariants}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Анимированное пульсирование */}
        <motion.path
          d={createPath()}
          stroke="#FFC68A"
          strokeWidth="0.3"
          fill="none"
          opacity="0"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: [0, 0.4, 0],
              transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }
            }
          }}
          style={{ filter: 'blur(2px)' }}
        />

        {/* Debug точки, если включен режим отладки */}
        {debug && (
          <g opacity="0.5">
            <circle cx="12" cy="41" r="1" fill="red" />
            <circle cx="10.5" cy="42.5" r="1" fill="red" />
            <circle cx="12" cy="46.5" r="1" fill="red" />
            <circle cx="27" cy="47.5" r="1" fill="red" />
            <circle cx="51" cy="44" r="1" fill="red" />
            <circle cx="56.5" cy="41" r="1" fill="red" />
            <circle cx="56.5" cy="34" r="1" fill="red" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default ParabolicArcFinal;