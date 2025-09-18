import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../components/SectionWrapper';
import { platformImages } from '../data/certificates';
import { containerVariants, itemVariants } from '../utils/animations';
import { customTranslateY } from '../data/layout';

const Method = ({ setModalContent }) => {
  return (
    <SectionWrapper id="method" auroraColor="aurora-cyan">
      <div data-progress-range className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={itemVariants}>
          <h2 data-progress-anchor
            className="text-4xl sm:text-5xl font-bold text-white text-glow"
            style={{
              transform: `translateY(${customTranslateY.method.h2}px)`,
              marginBottom: '16px'
            }}
          >
            Методика, созданная для результата
          </h2>
          <p
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            style={{ transform: `translateY(${customTranslateY.method.p}px)` }}
          >
            Тот самый союз: мощная платформа + внимательный наставник. Быстрее прогресс, меньше стресса.
          </p>
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
  );
};

export default Method;
