import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiArrowUp, FiMessageSquare } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import LetterVortex from './LetterVortex';

//================================================================================
// Reusable Components & Hooks
//================================================================================

// 3D orbiting letters (A–Z) in three rings with different speeds
const OrbitingLetters = () => {
  const letters = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);
  const ringRefs = [useRef(), useRef(), useRef()];
  const baseSpeed = 0.36; // rad/sec baseline

  useFrame((_, delta) => {
    const speeds = [baseSpeed * 0.95, baseSpeed, baseSpeed * 1.07];
    ringRefs.forEach((ref, i) => {
      if (ref.current) ref.current.rotation.z += speeds[i] * delta;
    });
  });

  const renderRing = (ringIndex) => (
    <group ref={ringRefs[ringIndex]} key={`ring-${ringIndex}`}>
      {letters.map((letter, index) => {
        if (index % 3 !== ringIndex) return null;
        const angle = (index / letters.length) * Math.PI * 2;
        const baseRadius = 0.6 + ringIndex * 0.18;
        // Compact radii and avoid canvas edge; inner/outer slightly closer
        let r = baseRadius * 0.8;
        if (ringIndex === 0 || ringIndex === 2) r *= 0.9;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = Math.sin(index) * 0.12;
        const randomOffset = (Math.sin(index * 12.9374) - 0.5) * 2 * (Math.PI / 3);
        const hue = 190 + index * 4;
        return (
          <group key={index} position={[x, y, z]} rotation={[0, 0, angle + randomOffset]}>
            <Text fontSize={0.126} anchorX="center" anchorY="middle" font="/fonts/ShadowsIntoLight-Regular.ttf">
              {letter}
              <meshStandardMaterial
                color={new THREE.Color().setHSL((hue % 360) / 360, 0.7, 0.7)}
                emissive={new THREE.Color().setHSL(((hue + 10) % 360) / 360, 0.6, 0.35)}
                emissiveIntensity={0.85}
              />
            </Text>
          </group>
        );
      })}
    </group>
  );

  return (
    <group>
      {renderRing(0)}
      {renderRing(1)}
      {renderRing(2)}
    </group>
  );
};

// Local 2D vortex matching site style, slower, used behind photo
const LocalVortexCanvas = ({ count = 280 }) => {
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
      const globalAngle = t * 0.0015; // slower
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

// Knowledge Portal: photo + 3D letters + vortex, all in one place
const KnowledgePortal = ({ profileImage }) => (
  <div className="relative w-full max-w-sm h-auto overflow-visible">
    <LetterVortex />
    {/* Profile Image */}
    <div className="relative z-10 p-3 md:p-4">
      <img
        src={profileImage}
        alt="������� ��室쪮"
        className="relative w-full h-auto object-cover rounded-full shadow-2xl shadow-black/50"
      />
    </div>
    {/* Soft radial background glow behind photo (bottom-most) */}
    <div className="absolute inset-0 -z-40 opacity-30" style={{
      background: 'radial-gradient(ellipse 85% 92% at center, rgba(124, 58, 237, 0.12) 0%, rgba(45, 212, 191, 0.08) 35%, transparent 78%)',
      borderRadius: '9999px'
    }} />
  </div>
);

// --- Brand name that changes color on scroll ---
const BrandNameChanging = () => {
  const { scrollYProgress } = useScroll();
  // page-based color stops: 0%, 30%, 65%, 100%
  const color = useTransform(
    scrollYProgress,
    [0, 0.3, 0.65, 1],
    ['#3e91f7', '#F0ABFC', '#FB923C', '#A855F7']
  );
  return (
    <motion.h1
      style={{ color }}
      className="text-xl md:text-2xl font-bold tracking-wide transition-colors duration-300 brand-glow"
    >
      <span style={{ fontFamily: 'BrandFont, Manrope, sans-serif' }}>Anastasia Prikhodko</span>
    </motion.h1>
  );
};

// --- Custom Hook for simplified scroll-based transform ---
const useScrollTransform = (ref, from, to) => {
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    return useTransform(scrollYProgress, from, to);
};

// --- Section Wrapper for background auroras ---
const SectionWrapper = ({ children, auroraColor, id }) => {
    const sectionRef = useRef(null);
    const opacity = useScrollTransform(sectionRef, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0]);

    return (
        <section id={id} ref={sectionRef} className="relative py-24 px-4 min-h-screen flex items-center">
            <motion.div
                style={{ opacity }}
                className={`absolute inset-0 z-0 ${auroraColor} pointer-events-none`}
            />
            <div className="relative z-10 w-full">
                {children}
            </div>
        </section>
    );
};

//================================================================================
// Star Canvas: медленное хаотичное вращение + мягкая пульсация у каждой "звезды"
//================================================================================
const StarsCanvas = React.memo(function StarsCanvas({ count = 240 }) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const rafRef = useRef(null);
  const startedAt = useRef(performance.now());

  // Инициализация/ресайз
  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Создаём поле звёзд
  const makeStars = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const amount = Math.round(count * Math.min(1.2, Math.max(0.7, (w * h) / (1280 * 720))));
    const arr = new Array(amount).fill(0).map(() => {
      // Случайное положение по всему экрану
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      const vx = x0 - cx;
      const vy = y0 - cy;
      const baseAngle = Math.atan2(vy, vx);
      const baseRadius = Math.hypot(vx, vy);

      // Индивидуальные параметры
      return {
        baseAngle,
        baseRadius,
        // Радиус точки + её базовая яркость
        r: 0.6 + Math.random() * 1.4,
        baseAlpha: 0.5 + Math.random() * 0.5,
        // Угловая скорость (рад/с) — очень медленно
        angVel: (0.005 + Math.random() * 0.02) * (Math.random() < 0.5 ? -1 : 1),
        // Лёгкая дрожь/орбита
        wobbleAmp: 2 + Math.random() * 6,
        wobbleFreq: 0.2 + Math.random() * 0.7,
        wobblePhase: Math.random() * Math.PI * 2,
        // Пульсация ореола
        pulseFreq: 0.5 + Math.random() * 0.8,
        pulsePhase: Math.random() * Math.PI * 2,
        // Случайная лёгкая индивидуальная скорость "вокруг центра"
        personalSpin: (Math.random() * 0.015) * (Math.random() < 0.5 ? -1 : 1),
        tint: Math.random(), // для едва заметных цветовых вариаций ореола
      };
    });
    starsRef.current = arr;
  };

  useEffect(() => {
    resize();
    makeStars();
    window.addEventListener('resize', () => { resize(); makeStars(); });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = (now) => {
      const t = (now - startedAt.current) / 1000; // секунды
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Лёгкая общая (очень медленная) ротация поля
      const globalAngle = t * 0.003; // ~0.17°/с

      for (const s of starsRef.current) {
        // Индивидуальная позиция: базовый вектор + медленный общий поворот + личный спин
        const angle = s.baseAngle + globalAngle + t * s.angVel + t * s.personalSpin;
        const wobble = s.wobbleAmp * Math.sin(t * s.wobbleFreq + s.wobblePhase);
        const r = Math.max(0, s.baseRadius + wobble);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        // Пульсация ореола вокруг точки
        const pulse = 0.7 + 0.3 * Math.sin(t * s.pulseFreq + s.pulsePhase);
        const haloR = (s.r * 6) * pulse;

        // Едва заметный цветной ореол (фиолет/бирюза)
        const hueA = 265; // фиолетовый
        const hueB = 170; // бирюзовый
        const hue = hueA * (1 - s.tint) + hueB * s.tint;

        // Ореол
        const g = ctx.createRadialGradient(x, y, 0, x, y, haloR);
        g.addColorStop(0, `hsla(${hue}, 90%, 70%, ${0.05 * s.baseAlpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Ядро звезды
        ctx.fillStyle = `rgba(255,255,255,${0.85 * s.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return <canvas className="starry-canvas" ref={canvasRef} />;
});

//================================================================================
// Pain Points — 50 штук + аккуратная раскладка
//================================================================================
const pains50 = [
  'Запутала грамматика?!', 'Не могу с th…', 'Нет слов подобрать!', 'Постоянные забывания…', 'Акцент смущает!!!',
  'Фразы непонятны??', 'Не слышу речь…', 'Экзамены пугают!?', 'Страх говорить вслух!', 'Слишком слитно…',
  'Правила сбивают.', 'Много правил, мало времени!', 'Времена не понимаю…', 'Слова путаются…', 'Где ударение?!',
  'Артикли бесят!!!', 'Phrasal verbs тяжко…', 'Скучные уроки…', 'Даже простое сложно!', 'Ошибок слишком много?!',
  'Слушаю — не слышу…', 'Пишу неуверенно…', 'Нет мотивации…', 'Сравниваю себя??', 'Живое общение пугает!',
  'Мало словаря!!!', 'Слишком быстро говорят…', 'Формальности везде…', 'Жаргон несён…', 'Не узнаю фразы…',
  'Язык кажется странным…', 'R vs L…', 'Запоминать мучение!!!', 'Другая культура…', 'Нет носителей рядом…',
  'Ложные друзья путают!', 'Английские времена страшны…', 'Постоянный барьер…', 'Спотыкаюсь, говоря…', 'Не могу спонтанно…',
  'Завишу от переводов…', 'Учить каждый день…', 'Нет обратной связи!', 'Учу — путаю…', 'Чтение скучное…',
  'Аудио слишком быстро!!!', 'В учебнике иначе…', 'С грамматикой несёт…', 'Боюсь ошибок публично…', 'Просто устал учить…'
];

// Позиции (одинаковые места на экране), 12 точек
const painPositions = [
  { top: '14%', left: '8%' },
  { top: '20%', right: '12%' },
  { top: '30%', left: '24%' },
  { top: '38%', right: '20%' },
  { top: '50%', left: '12%' },
  { top: '58%', right: '8%' },
  { top: '68%', left: '30%' },
  { top: '76%', right: '25%' },
  { top: '22%', left: '55%' },
  { top: '46%', left: '42%' },
  { top: '62%', left: '55%' },
  { top: '82%', left: '10%' },
];

const sizeCycle = ['text-xl','text-2xl','text-3xl'];

// --- Transition Component with Pain Points (показывает 12 из списка с оффсетом) ---
const PainsTransition = ({ pains = pains50, offset = 0 }) => {
  const transitionRef = useRef(null);
  const opacity = useScrollTransform(transitionRef, [0, 0.5, 1], [0, 1, 0]);
  const y = useScrollTransform(transitionRef, [0, 1], ['50%', '-50%']);

  const subset = painPositions.map((pos, i) => {
    const idx = (offset + i) % pains.length;
    return { text: pains[idx], pos, size: sizeCycle[i % sizeCycle.length] };
  });

  return (
    <div ref={transitionRef} className="relative h-[50vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, y }} className="relative w-full h-full">
          {subset.map((item, i) => (
            <span
              key={i}
              className={`absolute text-white/30 ${item.size}`}
              style={{ top: item.pos.top, left: item.pos.left, right: item.pos.right }}
            >
              {item.text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};


//================================================================================
// Main App Component
//================================================================================
const App = () => {
  // --- STATE AND DATA ---
  const [modalContent, setModalContent] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTab, setActiveTab] = useState('diplomas');

  // --- Image paths ---
  const profileImage = '/images/Profile.jpg';
  const qrCodeImage = '/images/QR.png';

  // Скрины отзывов (для галереи) - УБИРАЕМ 4 и 5
  const reviewScreens = ['/images/Review/Review1.jpg', '/images/Review/Review2.jpg', '/images/Review/Review3.jpg'];

  const certificates = ['/images/Diploma/Diploma1.jpg', '/images/Diploma/Diploma2.jpg', '/images/Diploma/Diploma3.jpg', '/images/Diploma/Diploma4.jpg', '/images/Diploma/Diploma5.jpg'];
  const academicPapers = ['/images/Academic/Academic1.jpg', '/images/Academic/Academic2.jpg', '/images/Academic/Academic3.jpg', '/images/Academic/Academic4.jpg', '/images/Academic/Academic5.jpg', '/images/Academic/Academic6.jpg', '/images/Academic/Academic7.jpg', '/images/Academic/Academic8.jpg'];

  // Превью/фото платформы (4 скрина одинакового размера)
  const platformImages = [
    '/images/Platform/Platform1.jpg',
    '/images/Platform/Platform2.jpg',
    '/images/Platform/Platform3.jpg',
    '/images/Platform/Platform4.jpg',
  ];

  // --- Text data ---
  // Сжатые текстовые отзывы (3 карточки над скринами)
  const textualTestimonials = [
    {
      name: 'Степан',
	  avatar: '/images/avatars/stepan.png',
      date: '4 сентября 2024',
      subtitle: 'Английский язык',
      quote:
        'С нуля до базовых фраз за месяц — объясняет понятно, терпеливо и по делу. Учиться увлекательно, вижу реальный прогресс.',
    },
    {
      name: 'Артём',
	  avatar: '/images/avatars/artem.png',
      date: '19 августа',
      subtitle: 'Пробный + старт',
      quote:
        'На пробном разобрали цели и уровень. Удобная платформа с заданиями, преподаватель ясно объясняет и упрощает сложное — рекомендую.',
    },
    {
      name: 'Дарья',
	  avatar: '/images/avatars/darya.png',
      date: '3 августа',
      subtitle: 'Комфорт и результат',
      quote:
        'Бесплатный пробный прошёл легко и с юмором. Атмосфера как с подругой, а не «урок». Продолжаем занятия — однозначно советую!',
    },
  ];

  // --- Animation Variants ---
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } } };

  // --- EFFECT HOOKS ---
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['home', 'about', 'method', 'testimonials', 'qualification', 'contact'];
const observer = new IntersectionObserver((entries) => {
  let visibleSections = entries.filter(entry => entry.isIntersecting);
  if (visibleSections.length > 0) {
    // Берём последнюю видимую секцию по порядку в DOM
    const lastVisible = visibleSections[visibleSections.length - 1];
    setActiveSection(lastVisible.target.id);
  }
}, { rootMargin: '-20% 0px -20% 0px' });
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => sections.forEach(id => { const el = document.getElementById(id); if (el) observer.unobserve(el); });
  }, []);

  // --- NavLink SUB COMPONENT ---
  const NavLink = ({ id, children }) => (
    <a
      href={`#${id}`}
      onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: id === 'contact' ? 'center' : 'start' }); }}
      className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium"
    >
      {children}
      {activeSection === id && (
  <motion.span
    layoutId="underline"
    className="absolute left-0 -bottom-1 w-full h-0.5 bg-cyan-400"
    initial={{ width: 0 }}
    animate={{ width: '100%' }}
    transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.5 }}
  />
)}
    </a>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap');
        .font-manrope { font-family: 'Manrope', sans-serif; }
        ::selection { background-color: #A78BFA; color: #121212; } 
        ::-webkit-scrollbar { width: 8px; } 
        ::-webkit-scrollbar-track { background: #0B0D17; } 
        ::-webkit-scrollbar-thumb { background: #A78BFA; border-radius: 10px; }
        html, body { overscroll-behavior: none; }
        
        /* STARRY NIGHT BACKGROUND */
        .starry-bg {
          background: linear-gradient(135deg, #0B0D17 0%, #1a1b3a 25%, #2a2d5f 50%, #1a1b3a 75%, #0B0D17 100%);
          position: relative;
          overflow: hidden;
        }
        
        /* Псевдо-слои оставляем очень мягкими и ОЧЕНЬ медленными, чтобы не перебивать канвас */
        .starry-bg::before,
        .starry-bg::after {
          opacity: 0.15;
          z-index: 0;
        }
        .starry-bg::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 130px 80px, #fff, transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 200px 90px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 240px 50px, #fff, transparent),
            radial-gradient(1px 1px at 280px 20px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 320px 100px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 360px 60px, #fff, transparent);
          background-repeat: repeat;
          background-size: 400px 200px;
          animation: sparkle 160s ease-in-out infinite alternate; /* было 8s -> стало 160s */
          pointer-events: none;
        }
        
        .starry-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(1px 1px at 60px 15px, rgba(167, 139, 250, 0.8), transparent),
            radial-gradient(1px 1px at 180px 45px, rgba(45, 212, 191, 0.6), transparent),
            radial-gradient(2px 2px at 300px 25px, rgba(167, 139, 250, 0.7), transparent),
            radial-gradient(1px 1px at 80px 85px, rgba(45, 212, 191, 0.8), transparent),
            radial-gradient(1px 1px at 250px 75px, rgba(167, 139, 250, 0.6), transparent);
          background-repeat: repeat;
          background-size: 350px 180px;
          animation: sparkle-color 200s ease-in-out infinite alternate; /* было 6s -> стало 200s */
          pointer-events: none;
        }
        
        @keyframes sparkle {
          0% { opacity: 0.1; transform: translateY(0px) rotate(0deg); }
          50% { opacity: 0.2; transform: translateY(-6px) rotate(6deg); }
          100% { opacity: 0.15; transform: translateY(0px) rotate(12deg); }
        }
        
        @keyframes sparkle-color {
          0% { opacity: 0.08; transform: translateX(0px) scale(1); }
          50% { opacity: 0.18; transform: translateX(-3px) scale(1.04); }
          100% { opacity: 0.1; transform: translateX(0px) scale(1); }
        }
        
        /* Канвас со звёздами — под всем контентом */
        .starry-canvas {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        
        .text-glow { 
          text-shadow: 0 0 10px rgba(229, 229, 229, 0.3), 0 0 25px rgba(167, 139, 250, 0.2); 
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #2dd4bf 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s ease-in-out infinite alternate;
        }
        .name-glow {
  color: #2dd4bf;
  text-shadow: 
    0 0 5px #2dd4bf,
    0 0 10px #2dd4bf,
    0 0 15px #2dd4bf,
    0 0 20px #2dd4bf;
  animation: pulse-glow 2s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  0% { 
    text-shadow: 
      0 0 5px #2dd4bf,
      0 0 10px #2dd4bf,
      0 0 15px #2dd4bf,
      0 0 20px #2dd4bf;
  }
  100% { 
    text-shadow: 
      0 0 8px #2dd4bf,
      0 0 16px #2dd4bf,
      0 0 24px #2dd4bf,
      0 0 32px #2dd4bf;
  }
}
        @keyframes gradient-shift {
          0% { filter: hue-rotate(0deg) brightness(1); }
          100% { filter: hue-rotate(20deg) brightness(1.2); }
        }
        
        .aurora {
            background-position: center;
            background-repeat: no-repeat;
            background-size: 100% 100%;
            transition: opacity 0.8s ease-in-out;
        }
        .aurora-purple {
            background-image: radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124, 58, 237, 0.15), transparent);
        }
        .aurora-cyan {
            background-image: radial-gradient(ellipse 80% 50% at 50% 50%, rgba(45, 212, 191, 0.15), transparent);
        }
      `}</style>

      <div className="starry-bg text-gray-200 font-manrope min-h-screen">
        {/* Фоновый канвас со звёздами */}
        <StarsCanvas count={260} />

        <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed top-0 w-full bg-[#0B0D17]/80 backdrop-blur-lg border-b border-white/10 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <motion.div
  whileHover={{ scale: 1.05 }}
  className="flex items-center cursor-pointer transition-all duration-300"
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
>
                <BrandNameChanging />
              </motion.div>
              <div className="hidden md:flex items-center space-x-8">
                <NavLink id="about">Обо мне</NavLink>
                <NavLink id="method">Методика</NavLink>
                <NavLink id="testimonials">Отзывы</NavLink>
                <NavLink id="qualification">Квалификация</NavLink>
                <NavLink id="contact">Контакты</NavLink>
              </div>
            </div>
          </div>
        </motion.nav>

        <main className="relative z-10">
          <section id="home" className="h-[140vh] relative">
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-center overflow-hidden">
                <motion.h1 
                    className="text-5xl md:text-7xl lg:text-8xl font-extrabold gradient-text mb-8"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                >
                    Английский для жизни и карьеры
                </motion.h1>
                <motion.p
                    className="text-xl md:text-2xl text-gray-300 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                >
                    Крутите вниз — впереди приключение ✨
                </motion.p>
            </div>
          </section>

          {/* 4 перехода с болью; каждый показывает новую дюжину пунктов */}
          <PainsTransition offset={0} />

          <SectionWrapper id="about" auroraColor="aurora-purple">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div className="relative flex justify-center" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, type: 'spring' }}>
                    <KnowledgePortal profileImage={profileImage} />
                </motion.div>
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                    <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold text-white mb-6 text-glow">Строим мостики между языками и культурами</motion.h2>
                    <motion.p variants={itemVariants} className="text-lg text-gray-300 leading-relaxed mb-4">Меня зовут Анастасия. Я — профессиональный педагог, преподаватель, переводчик и автор научных статей  по английскому языку.</motion.p>
                    <motion.p variants={itemVariants} className="text-lg text-gray-300 leading-relaxed">Моя задача — провести вас через хаос правил к уверенному владению языком, используя современные и прогрессивные инструменты.</motion.p>
                </motion.div>
            </div>
          </SectionWrapper>

          <PainsTransition offset={12} />

          {/* ========================= МЕТОДИКА (пересобрана) ========================= */}
          <SectionWrapper id="method" auroraColor="aurora-cyan">
            <div className="max-w-7xl mx-auto">
              <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={itemVariants}>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-glow">Методика, созданная для результата</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">Тот самый союз: мощная платформа + внимательный наставник. Быстрее прогресс, меньше стресса.</p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Левая колонка: Комплексный подход + Ваш результат */}
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="space-y-8">
                  <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Комплексный подход к языку</h3>
                    <p className="text-gray-400 mb-4">От постановки целей до уверенного применения в жизни.</p>
                    <ul className="space-y-3 text-gray-200">
                      <li>🎯 <span className="font-semibold">Индивидуальный план.</span> Программа под ваши цели: разговорная речь, грамматика, произношение.</li>
                      <li>📚 <span className="font-semibold">Восполнение пробелов.</span> Улучшим успеваемость, подготовим к экзаменам, систематизируем знания.</li>
                      <li>💪 <span className="font-semibold">Преодоление барьера.</span> Учиться легко и увлечённо, заговорите уверенно.</li>
                      <li>🗣️ <span className="font-semibold">Живое общение.</span> Комфортная атмосфера, где ошибки — часть пути.</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Ваш результат</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-200">
                      <li>🏆 Уверенное владение</li>
                      <li>🎓 Чёткая система знаний</li>
                      <li>✅ База для экзаменов</li>
                      <li>🌍 Смелость в реальных ситуациях</li>
                    </ul>
                  </motion.div>
                </motion.div>

                {/* Правая колонка: Платформа ProgressMe + галерея */}
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="space-y-8">
                  <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 h-full">
                    <h3 className="text-2xl font-bold text-white mb-2">Платформа ProgressMe</h3>
                    <p className="text-gray-400 mb-4">Интерактивная среда для увлекательного обучения — без лишних приложений.</p>
                    <ul className="space-y-3 text-gray-200">
                      <li>💻 Все материалы в одном месте — уроки, видео, аудио, словари.</li>
                      <li>🧩 Игровые задания — тесты, квесты и награды.</li>
                      <li>🎧 Развитие восприятия — аудио/видео с носителями.</li>
                      <li>💡 Мгновенная проверка — система оценивает и даёт фидбек.</li>
                      <li>🌍 Уроки прямо в браузере — никакого Zoom/Skype.</li>
                    </ul>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {platformImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Скрин платформы ${i+1}`}
                          className="w-full h-40 object-cover rounded-xl cursor-pointer border border-white/10 hover:border-purple-400/50 transition-colors"
                          onClick={() => setModalContent({ src: img, imageSet: platformImages })}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-3">Посмотрите, как выглядит процесс — всё наглядно и под рукой.</p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </SectionWrapper>

          <PainsTransition offset={24} />

          {/* ========================= ОТЗЫВЫ ========================= */}
          <SectionWrapper id="testimonials" auroraColor="aurora-purple">
            <div className="max-w-7xl mx-auto">
              <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-glow">Слова учеников говорят громче</h2>
                  <p className="text-xl text-gray-400">Их успехи — моя главная мотивация.</p>
              </motion.div>

              {/* Три текстовые карточки (выжимки) */}
              <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                {textualTestimonials.map((t, i) => (
                  <motion.div key={i} variants={itemVariants} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col">
<div className="flex items-center mb-4">
    <div className="flex-shrink-0">
        <img 
        src={t.avatar} 
        alt={`${t.name} аватар`}
        className="w-12 h-12 object-contain"
        onError={(e) => {
          // Fallback на руну если фото не загрузилось
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="w-12 h-12 flex items-center justify-center" style={{display: 'none'}}>
        <span className="text-amber-100 text-lg font-bold">{['ᚠ', 'ᚢ', 'ᚦ'][i]}</span>
      </div>
    </div>
                      <div className="ml-4">
                        <p className="font-bold text-white">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.date}{t.subtitle ? ` • ${t.subtitle}` : ''}</p>
                      </div>
                    </div>
                    <blockquote className="text-gray-300 italic flex-grow">"{t.quote}"</blockquote>
                  </motion.div>
                ))}
              </motion.div>

              {/* Три скрина с отзывами (из галереи) - убрали Review4 и Review5 */}
              <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                {reviewScreens.map((src, i) => (
                  <motion.div key={i} variants={itemVariants} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <img src={src} alt={`Отзыв скрин ${i+1}`} className="w-full h-auto object-cover rounded-lg cursor-pointer" onClick={() => setModalContent({ src, imageSet: reviewScreens })} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </SectionWrapper>

          <PainsTransition offset={36} />

          <SectionWrapper id="qualification" auroraColor="aurora-cyan">
            <div className="max-w-4xl mx-auto">
              <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
<h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-glow">
  Подтверждённая квалификация
</h2>
<p className="text-xl text-cyan-300 font-semibold">
  {getExperienceYears()} лет успешного преподавания — помогаю людям уверенно говорить по-английски
</p>
</motion.div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex border-b border-white/10">
                      <button onClick={() => setActiveTab('diplomas')} className={`flex-1 py-4 text-lg font-semibold transition-colors ${activeTab === 'diplomas' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Дипломы</button>
                      <button onClick={() => setActiveTab('papers')} className={`flex-1 py-4 text-lg font-semibold transition-colors ${activeTab === 'papers' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Научные статьи</button>
                  </div>
                  <AnimatePresence mode="wait">
                      <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {(activeTab === 'diplomas' ? certificates : academicPapers).map((item, i) => (
                              <motion.div key={i} whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={() => setModalContent({ src: item, imageSet: activeTab === 'diplomas' ? certificates : academicPapers })}>
                                  <img src={item} alt={`${activeTab} ${i+1}`} className="w-full h-auto object-cover rounded-lg shadow-lg"/>
                              </motion.div>
                          ))}
                      </motion.div>
                  </AnimatePresence>
              </div>
            </div>
          </SectionWrapper>
			
          {/* ====== ИТОГОВЫЙ БЛОК: центр экрана и без лишней прокрутки ====== */}
          <section id="contact" className="min-h-screen relative flex items-center justify-center">
            <motion.div 
                className="bg-[#181A2A] border border-white/10 rounded-3xl p-8 sm:p-12 w-full max-w-4xl shadow-2xl shadow-black/40"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <div className="text-center">
    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-glow">Сделайте первый шаг</h2>
    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Первый урок‑знакомство — бесплатно. Определим ваш уровень, обсудим цели и составим план.</p>
    
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        {/* Левая колонка с номером и кнопкой */}
        <div className="flex flex-col items-center gap-4">
            <motion.a 
                href="tel:+79372565939" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="text-white font-semibold text-xl hover:text-cyan-400 transition-colors cursor-pointer"
            >
                +7-937-256-59-39
            </motion.a>
            
            <Magnetic>
                <motion.a href="https://t.me/anaprikh" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center">
                    <FaTelegramPlane className="mr-3" /> Написать в Telegram
                </motion.a>
            </Magnetic>
        </div>
        
        {/* QR код справа */}
        <div className="bg-white p-2 rounded-2xl shadow-lg">
            <img src={qrCodeImage} alt="QR код для связи в Telegram" className="w-36 h-36 object-contain rounded-lg"/>
        </div>
    </div>
</div>
            </motion.div>
          </section>

        </main>
        
        {/* Reusable Modals and Buttons */}
        <ImageModal modalContent={modalContent} setModalContent={setModalContent} />
        <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} qrCodeImage={qrCodeImage} />
        <FloatingCTAButton onClick={() => setShowContactModal(true)} />
        <BackToTopButton isVisible={showBackToTop} />
      </div>
    </>
  );
};


//================================================================================
// Child Components
//================================================================================
const getExperienceYears = () => {
  const startYear = 2019;
  const currentYear = new Date().getFullYear();
  return currentYear - startYear + 1;
};
const Magnetic = ({ children }) => { // FIX: Renamed from MagneticEffect
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouse = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = ref.current.getBoundingClientRect();
      setPosition({ x: clientX - (left + width / 2), y: clientY - (top + height / 2) });
    };
    const reset = () => setPosition({ x: 0, y: 0 });
    return (
      <motion.div
        ref={ref} onMouseMove={handleMouse} onMouseLeave={reset}
        animate={{ x: position.x * 0.1, y: position.y * 0.1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      >
        {children}
      </motion.div>
    );
};
const FloatingCTAButton = ({ onClick }) => (
  <motion.button
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 3, type: 'spring', stiffness: 200, damping: 20 }}
    whileHover={{ scale: 1.1 }}
    onClick={onClick}
    className="fixed bottom-6 left-6 bg-purple-500 text-white w-auto h-14 px-6 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-purple-400 transition-colors">
      <FiMessageSquare size={20} className="mr-3"/>
      <span className="font-semibold">Пробный урок</span>
  </motion.button>
);
const ImageModal = ({ modalContent, setModalContent }) => {
  if (!modalContent) return null;
  return <ImageModalInternal modalContent={modalContent} setModalContent={setModalContent} />;
};
const ImageModalInternal = ({ modalContent, setModalContent }) => {
    const [direction, setDirection] = useState(0);
    useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.key === 'ArrowRight') changeImage(1);
          if (e.key === 'ArrowLeft') changeImage(-1);
          if (e.key === 'Escape') setModalContent(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalContent]);
    const { src, imageSet } = modalContent;
    const changeImage = (newDirection) => {
        setDirection(newDirection);
        const currentIndex = imageSet.indexOf(src);
        const nextIndex = (currentIndex + newDirection + imageSet.length) % imageSet.length;
        setModalContent({ ...modalContent, src: imageSet[nextIndex] });
    };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setModalContent(null)}>
        <motion.div onClick={e => e.stopPropagation()} className="relative w-full max-w-5xl h-full max-h-[90vh] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
            <motion.img key={src} src={src} alt="" custom={direction} 
                initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction < 0 ? 200 : -200, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute max-w-full max-h-full object-contain rounded-lg"/>
            </AnimatePresence>
            {modalContent.imageSet && modalContent.imageSet.length > 1 && (<>
            <button onClick={(e) => {e.stopPropagation(); changeImage(-1);}} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white border border-white/20 p-3 rounded-full hover:bg-black/80 transition-colors z-20 shadow-lg"><FiChevronLeft size={24} /></button>
            <button onClick={(e) => {e.stopPropagation(); changeImage(1);}} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white border border-white/20 p-3 rounded-full hover:bg-black/80 transition-colors z-20 shadow-lg"><FiChevronRight size={24} /></button>
            </>)}
            <motion.button whileHover={{ scale: 1.2, rotate: 90 }} onClick={() => setModalContent(null)}
            className="absolute top-4 right-4 bg-black/60 text-white border border-white/20 rounded-full p-2 z-20 shadow-lg hover:bg-black/80"><FiX size={24} /></motion.button>
        </motion.div>
        </motion.div>
  );
};
const ContactModal = ({ isOpen, onClose, qrCodeImage }) => (
    <AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="bg-[#181A2A] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-black/40 relative" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><FiX size={24} /></button>
          <h3 className="text-xl font-bold text-white mb-6 text-center">Свяжитесь со мной</h3>
          <div className="flex flex-col items-center mb-6">
            <motion.a 
              href="tel:+79372565939" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="text-white font-semibold text-lg mb-4 hover:text-purple-400 transition-colors cursor-pointer"
            >
              +7-937-256-59-39
            </motion.a>
            <div className="bg-white p-2 rounded-xl"><img src={qrCodeImage} alt="Telegram QR" className="w-full h-auto rounded-lg"/></div>
            <p className="text-sm text-white/50 text-center mt-4">Наведите камеру, чтобы написать в Telegram, или нажмите на кнопку ниже.</p>
          </div>
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href='https://t.me/anaprikh' target='_blank' rel="noopener noreferrer"
              className="block w-full text-center bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-400 transition-colors font-medium">Написать в Telegram</motion.a>
      </motion.div></motion.div>)}</AnimatePresence>
);
const BackToTopButton = ({ isVisible }) => (
  <AnimatePresence>{isVisible && (<motion.button
    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="fixed bottom-6 right-6 bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-400 transition-colors z-50">
      <FiArrowUp size={24} />
  </motion.button>)}</AnimatePresence>
);

export default App;

