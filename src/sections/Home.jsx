import React from 'react';
import { motion } from 'framer-motion';
import { customTranslateY } from '../data/layout';

const Home = () => {
  return (
    <section id="home" className="h-screen relative">
      <div className="h-full flex flex-col items-center justify-center text-center overflow-hidden">
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight md:tracking-[-0.02em] lg:tracking-[-0.03em] hero-gradient-text hero-title-font"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{
            transform: `translateY(${customTranslateY.home.h1}px)`,
            marginBottom: '32px'
          }}
        >
          Английский для жизни и карьеры
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-300 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          style={{ transform: `translateY(${customTranslateY.home.p}px)` }}
        >
          Крутите вниз — впереди приключение ✨
        </motion.p>
      </div>
    </section>
  );
};

export default Home;
