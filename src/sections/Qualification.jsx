import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from '../components/SectionWrapper';
import { certificates, academicPapers } from '../data/certificates';
import { itemVariants } from '../utils/animations';
import { getExperienceYears } from '../utils/helpers';
import { customTranslateY } from '../data/layout';

const Qualification = ({ setModalContent, activeTab, setActiveTab }) => {
  // Preload qualification images to avoid jank on tab switch
  useEffect(() => {
    const preload = (arr) => arr.forEach(src => { const img = new Image(); img.src = src; });
    preload(certificates);
    preload(academicPapers);
  }, []);

  return (
    <SectionWrapper id="qualification" auroraColor="aurora-cyan">
      <div data-progress-range className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
          <h2 data-progress-anchor
            className="text-4xl sm:text-5xl font-bold text-white text-glow"
            style={{
              transform: `translateY(${customTranslateY.qualification.h2}px)`,
              marginBottom: '16px'
            }}
          >
            Подтверждённая квалификация
          </h2>
          <p
            className="text-xl text-cyan-300 font-semibold"
            style={{ transform: `translateY(${customTranslateY.qualification.p}px)` }}
          >
            {getExperienceYears()} лет успешного преподавания — помогаю людям уверенно говорить по-английски
          </p>
        </motion.div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('diplomas')}
              className={`flex-1 py-4 text-lg font-semibold transition-all duration-300 ${
                activeTab === 'diplomas'
                  ? 'text-white border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Дипломы
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`flex-1 py-4 text-lg font-semibold transition-all duration-300 ${
                activeTab === 'papers'
                  ? 'text-white border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Научные статьи
            </button>
          </div>

          {/* Фиксированный контейнер для предотвращения дёрганий */}
          <div className="relative overflow-hidden" style={{ minHeight: '680px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'diplomas' ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'diplomas' ? 50 : -50 }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1] // Плавная кубическая кривая
                }}
                className="absolute inset-0 p-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(activeTab === 'diplomas' ? certificates : academicPapers).map((item, i) => (
                    <motion.div
                      key={`${activeTab}-${i}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer"
                      onClick={() => setModalContent({
                        src: item,
                        imageSet: activeTab === 'diplomas' ? certificates : academicPapers
                      })}
                    >
                      <img
                        src={item}
                        alt={`${activeTab} ${i+1}`}
                        className="w-full h-auto object-cover rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Qualification;
