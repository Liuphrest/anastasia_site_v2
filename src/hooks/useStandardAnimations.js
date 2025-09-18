import { useMemo } from 'react';
import { CONFIG } from '../constants/config';

export const useStandardAnimations = () => {
  return useMemo(() => ({
    containerVariants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: CONFIG.ANIMATION_DURATION,
          staggerChildren: 0.2,
          ease: CONFIG.TRANSITIONS.EASE_OUT
        }
      }
    },

    itemVariants: {
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: CONFIG.ANIMATION_DURATION,
          ease: CONFIG.TRANSITIONS.EASE_OUT
        }
      }
    },

    fadeInVariants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: CONFIG.ANIMATION_DURATION }
      }
    },

    slideUpVariants: {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: CONFIG.ANIMATION_DURATION,
          ease: CONFIG.TRANSITIONS.EASE_OUT
        }
      }
    },

    scaleVariants: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: CONFIG.ANIMATION_DURATION,
          ease: CONFIG.TRANSITIONS.EASE_OUT
        }
      }
    },

    springVariants: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: CONFIG.TRANSITIONS.SPRING
      }
    }
  }), []);
};

export const useCustomTranslateY = () => {
  return useMemo(() => ({
    initial: { opacity: 0, y: 100 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: {
        duration: CONFIG.ANIMATION_DURATION * 1.5,
        ease: CONFIG.TRANSITIONS.EASE_OUT
      }
    },
    viewport: { once: true, margin: '-100px' }
  }), []);
};

export default useStandardAnimations;