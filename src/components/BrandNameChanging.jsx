import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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
      style={{ color, fontFamily: 'BrandFont, Manrope, sans-serif' }}
      className="text-4xl leading-none tracking-wide transition-colors duration-300 brand-glow"
    >
      Anastasia Prikhodko
    </motion.h1>
  );
};

export default BrandNameChanging;