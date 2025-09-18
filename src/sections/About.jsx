import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../components/SectionWrapper';
import KnowledgePortal from '../components/KnowledgePortal';
import BezierArc from '../components/BezierArc';
import { profileImage } from '../data/certificates';
import { containerVariants, itemVariants } from '../utils/animations';
import { customTranslateY } from '../data/layout';

const About = () => {
  return (
    <SectionWrapper id="about" auroraColor="aurora-purple">
      <div data-progress-range className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
        {/* Параболическая дуга - позади контента */}
        <BezierArc className="z-0" debug={false} />
        
        {/* Фото слева */}
        <motion.div
          data-progress-anchor
          className="relative flex justify-center origin-center z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <KnowledgePortal profileImage={profileImage} />
        </motion.div>
        
        {/* Текст справа */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.5 }}
          className="relative z-10"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold text-white text-glow"
            style={{
              transform: `translateY(${customTranslateY.about.h2}px)`,
              marginBottom: '24px'
            }}
          >
            Строим мостики между языками и культурами
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-300 leading-relaxed"
            style={{
              transform: `translateY(${customTranslateY.about.p}px)`,
              marginBottom: '16px'
            }}
          >
            Меня зовут Анастасия. Я — профессиональный педагог, преподаватель, переводчик и автор научных статей по английскому языку.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-300 leading-relaxed"
            style={{ transform: `translateY(${customTranslateY.about.p}px)` }}
          >
            Моя задача — провести вас через хаос правил к уверенному владению языком, используя современные и прогрессивные инструменты.
          </motion.p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default About;
