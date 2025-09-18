// Централизованные значения отступов и смещений для всех секций сайта
// Все значения translateY/margin/padding собраны в одном месте для удобства поддержки

// Найденные существующие отступы в коде (для сохранения текущего вида)
export const existingSpacing = {
  // Из Header.jsx
  header: {
    brandTranslateY: 8, // translate-y-[8px]
  },

  // Из секций (margin bottom классы)
  common: {
    mb2: 8,   // mb-2 = 8px
    mb4: 16,  // mb-4 = 16px
    mb6: 24,  // mb-6 = 24px
    mb8: 32,  // mb-8 = 32px
    mb10: 40, // mb-10 = 40px
    mb16: 64, // mb-16 = 64px
    py4: 16,  // py-4 = 16px
    py24: 96, // py-24 = 96px (SectionWrapper)
  },

  // Из ImageModal.jsx
  modal: {
    buttonTranslateY: '-50%', // -translate-y-1/2
  }
};

// Специфические translateY значения для каждой секции (скорректированы для визуальной связности)
export const customTranslateY = {
  home: {
    h1: 0,  // Обнулено для корректного позиционирования
    p: 0
  },
  about: {
    h2: 0,  // Обнулено для корректного позиционирования
    p: 0
  },
  method: {
    h2: 0,  // Было -357px, обнулено для связности с контентом
    p: 0    // Было -357px, обнулено для связности с контентом
  },
  testimonials: {
    h2: 0,  // Было -443px, обнулено для связности с контентом
    p: 0    // Было -389px, обнулено для связности с контентом
  },
  qualification: {
    h2: 0,  // Было -384px, обнулено для связности с контентом
    p: 0    // Было -350px, обнулено для связности с контентом
  },
  contact: {
    h2: 0,  // Было -118px, обнулено для связности с контентом
    p: 0    // Было -64px, обнулено для связности с контентом
  }
};

// Общие отступы для секций (стандартизированные)
export const sectionSpacing = {
  container: {
    paddingY: existingSpacing.common.py24, // py-24
    paddingX: 16, // px-4
    minHeight: '100vh',
  },

  header: {
    marginBottom: existingSpacing.common.mb16, // mb-16
  },

  content: {
    maxWidth: '1280px', // max-w-7xl для большинства секций
    margin: '0 auto',
  },

  grid: {
    gap: 32, // gap-8
    gapLarge: 48, // gap-12 (About section)
  }
};

// Анимационные настройки для framer-motion
export const animationConfig = {
  // Базовые варианты для контейнеров
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  },

  // Базовые варианты для элементов
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  },

  // Стандартные начальные смещения
  initialOffset: {
    y: 50,
    opacity: 0
  },

  // Конечные позиции
  finalPosition: {
    y: 0,
    opacity: 1
  }
};

// Настройки визуального прогресса по секциям (можно подстроить под макет)
export const progressTuning = {
  thresholdVh: 0.5,      // доля высоты вьюпорта вокруг якоря (фоллбэк)
  rangePaddingPx: 96,    // смягчение краёв диапазона секции (шире окно)
  centerOffsetPx: 20,     // общая визуальная поправка центра (пиксели)
  inflateVh: 0.4,       // расширение диапазона секции от начала/конца (% от высоты окна)
  perSection: {
    // точечные поправки
    about: {
      inflateVh: 0.5,      // расширенный диапазон для секции "Обо мне"
      centerOffsetPx: 10
    },
    contact: {
      centerOffsetPx: -24, // центр немного выше
      inflateVh: 0.2
    }
  }
};
