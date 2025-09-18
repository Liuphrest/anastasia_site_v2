import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../components/SectionWrapper';
import { textualTestimonials, reviewScreens } from '../data/testimonials';
import { containerVariants, itemVariants } from '../utils/animations';
import { customTranslateY } from '../data/layout';

const Testimonials = ({ setModalContent }) => {
  return (
    <SectionWrapper id="testimonials" auroraColor="aurora-purple">
      <div data-progress-range className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
          <h2 data-progress-anchor
            className="text-4xl sm:text-5xl font-bold text-white text-glow"
            style={{
              transform: `translateY(${customTranslateY.testimonials.h2}px)`,
              marginBottom: '16px'
            }}
          >
            Слова учеников говорят громче
          </h2>
          <p
            className="text-xl text-gray-400"
            style={{ transform: `translateY(${customTranslateY.testimonials.p}px)` }}
          >
            Их успехи — моя главная мотивация.
          </p>
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
  );
};

export default Testimonials;
