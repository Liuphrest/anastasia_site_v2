import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const CustomParabolicArc = ({ className = '' }) => {
  const svgRef = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(svgRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Создаем плавную параболическую кривую на основе ваших точек
  const createPath = () => {
    // Очищенные и оптимизированные точки траектории
    // Начинаем справа сверху, идем влево-вниз, затем плавно вправо
    const path = `
      M 56.5,34.4
      C 56.5,38 56.3,42 56,45
      C 55.5,48 54.5,51 52,52.5
      C 50,53.5 47,53.8 44,53.8
      C 40,53.8 36,52.5 32,50
      C 28,48 24,46 20,44.5
      C 17,43.5 14,42 12,41
      C 11,40.5 10.5,40.8 10.5,42
      C 10.5,43.5 10.8,45 11.5,46.5
      C 12,47.5 13,48 15,48.5
      C 18,49 22,48.5 26,47.5
      C 30,46.5 34,45.5 38,45
      C 42,44.5 46,44 50,44
      C 53,44 55.5,44 56.3,43
      L 56.5,40
    `;
    
    return path;
  };

  // Альтернативный более простой путь, основанный на ключевых точках
  const createSimplePath = () => {
    return `
      M 56.5,34
      C 56,40 55,48 53,52
      Q 48,54 42,53
      C 35,52 28,48 20,44
      Q 15,42 11,41
      C 10,40.5 10,42 11,46
      Q 12,48 20,48
      C 30,47 45,44 56,40
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
          duration: 3, 
          ease: "easeInOut" 
        },
        opacity: { 
          duration: 0.5 
        }
      }
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ 
          zIndex: 1,
          transform: 'scaleX(-1)' // Зеркалим, так как фото слева, текст справа
        }}
      >
        <defs>
          {/* Градиент с резким появлением и плавным затуханием */}
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {/* Резкое появление в начале */}
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
            <stop offset="2%" stopColor="#FFD700" stopOpacity="0.6" />
            <stop offset="5%" stopColor="#FFA500" stopOpacity="1" />
            
            {/* Яркая часть */}
            <stop offset="20%" stopColor="#FFB347" stopOpacity="1" />
            <stop offset="35%" stopColor="#FFCC66" stopOpacity="0.9" />
            
            {/* Плавное затухание начинается с 40% */}
            <stop offset="40%" stopColor="#FFD700" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FFE4B5" stopOpacity="0.3" />
            <stop offset="75%" stopColor="#FFF0D4" stopOpacity="0.15" />
            <stop offset="90%" stopColor="#FFF8E7" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          
          {/* Фильтр свечения */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Более мягкое свечение для внешнего ореола */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="softBlur"/>
            <feMerge>
              <feMergeNode in="softBlur"/>
            </feMerge>
          </filter>
        </defs>

        {/* Внешнее свечение (более размытое) */}
        <motion.path
          d={createSimplePath()}
          stroke="#FFD700"
          strokeWidth="0.8"
          fill="none"
          filter="url(#softGlow)"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 0.3,
              transition: {
                duration: 1,
                delay: 0.5
              }
            }
          }}
        />

        {/* Основная линия */}
        <motion.path
          d={createSimplePath()}
          stroke="url(#arcGradient)"
          strokeWidth="0.4"
          fill="none"
          filter="url(#glow)"
          initial="hidden"
          animate={controls}
          variants={pathVariants}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Пульсирующее свечение */}
        <motion.path
          d={createSimplePath()}
          stroke="#FFA500"
          strokeWidth="0.6"
          fill="none"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: [0, 0.5, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }
            }
          }}
          style={{ filter: 'blur(3px)' }}
        />

        {/* Движущаяся точка по траектории (опционально) */}
        <motion.circle
          r="0.5"
          fill="#FFFFFF"
          filter="url(#glow)"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: [0, 1, 1, 0],
              transition: {
                duration: 3,
                times: [0, 0.1, 0.9, 1],
                delay: 0.5
              }
            }
          }}
        >
          <animateMotion
            dur="3s"
            begin="0.5s"
            fill="freeze"
          >
            <mpath href="#animPath" />
          </animateMotion>
        </motion.circle>
        
        {/* Скрытый путь для анимации */}
        <path
          id="animPath"
          d={createSimplePath()}
          fill="none"
          stroke="none"
        />
      </svg>
    </div>
  );
};

export default CustomParabolicArc;