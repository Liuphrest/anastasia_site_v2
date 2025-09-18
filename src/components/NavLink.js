import React from 'react';
import { motion } from 'framer-motion';
import { useSectionProgress } from '../hooks/useSectionProgress';
import { progressTuning } from '../data/layout';

// Функция для получения CSS градиента для конкретной секции
const getSectionGradient = (sectionId) => {
  const sectionOrder = ['about', 'method', 'testimonials', 'qualification', 'contact'];
  const sectionIndex = sectionOrder.indexOf(sectionId);

  if (sectionIndex === -1) return 'linear-gradient(90deg, #06b6d4, #0891b2)'; // fallback

  // Те же цвета что у Anastasia Prikhodko
  const colors = ['#3e91f7', '#F0ABFC', '#FB923C', '#A855F7'];

  // Каждая секция получает свою часть общего градиента
  const sectionsCount = sectionOrder.length;

  // Для равномерного распределения градиента по секциям
  const segmentSize = 1 / (sectionsCount - 1);
  const gradientStart = sectionIndex * segmentSize;
  const gradientEnd = Math.min((sectionIndex + 1) * segmentSize, 1);

  // Интерполяция для получения цвета в любой позиции градиента
  const getColorAtPosition = (position) => {
    const clampedPos = Math.min(Math.max(position, 0), 1);
    const scaledPos = clampedPos * (colors.length - 1);
    const colorIndex = Math.floor(scaledPos);
    const t = scaledPos - colorIndex;

    if (colorIndex >= colors.length - 1) return colors[colors.length - 1];

    const fromColor = colors[colorIndex];
    const toColor = colors[colorIndex + 1];

    const from = {
      r: parseInt(fromColor.slice(1, 3), 16),
      g: parseInt(fromColor.slice(3, 5), 16),
      b: parseInt(fromColor.slice(5, 7), 16)
    };
    const to = {
      r: parseInt(toColor.slice(1, 3), 16),
      g: parseInt(toColor.slice(3, 5), 16),
      b: parseInt(toColor.slice(5, 7), 16)
    };

    return `rgb(${Math.round(from.r + (to.r - from.r) * t)}, ${Math.round(from.g + (to.g - from.g) * t)}, ${Math.round(from.b + (to.b - from.b) * t)})`;
  };

  const startColor = getColorAtPosition(gradientStart);
  const endColor = getColorAtPosition(gradientEnd);

  return `linear-gradient(90deg, ${startColor}, ${endColor})`;
};

const NavLink = ({ id, children, active, progress, direction = 'ltr' }) => {
  // If progress isn't provided by parent, compute locally from scroll
  const per = (progressTuning.perSection && progressTuning.perSection[id]) || {};
  const local = useSectionProgress(
    { [id]: {
      rangeContainer: `#${id} [data-progress-range]`,
      start: `#${id} [data-progress-start]`,
      end: `#${id} [data-progress-end]`,
      selector: `#${id} [data-progress-anchor]`,
    } },
    {
      thresholdVh: progressTuning.thresholdVh,
      rangePaddingPx: progressTuning.rangePaddingPx,
      centerOffsetPx: per.centerOffsetPx ?? progressTuning.centerOffsetPx,
      inflateVh: per.inflateVh ?? progressTuning.inflateVh,
    }
  );
  const entry = local[id] || { progress: 0, phase: 0 };
  const p = typeof progress === 'number' ? progress : entry.progress;
  const s = entry.phase;

  // Compute forward-emptying segment: before center fill [0..w], after center keep right-anchored [1-w..1]
  let width = 0;
  let left = 0;
  if (s <= 0.5) {
    width = Math.max(0, Math.min(1, 2 * s));
    left = 0;
  } else {
    width = Math.max(0, Math.min(1, 2 * (1 - s)));
    left = 1 - width;
  }

  // Получаем градиент для этой секции
  const sectionGradient = getSectionGradient(id);

  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: 'smooth', block: id === 'contact' ? 'center' : 'start' });
      }}
      className={`relative text-gray-300 hover:text-white transition-colors duration-300 font-medium text-base ${
        active ? 'text-white' : ''
      }`}
    >
      {children}
      {/* Progress track */}
      <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-[2px]  rounded-full overflow-hidden">
        <motion.span
          className="absolute inset-y-0"
          style={{
            background: sectionGradient,
            ...(direction === 'rtl' ? { right: `${left * 100}%`, width: `${width * 100}%` } : { left: `${left * 100}%`, width: `${width * 100}%` })
          }}
          animate={{ opacity: p > 0 ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        />
      </div>
    </a>
  );
};

export default NavLink;