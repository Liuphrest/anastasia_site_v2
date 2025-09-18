import React from 'react';
import { motion } from 'framer-motion';
import { FaTelegramPlane } from 'react-icons/fa';
import SectionWrapper from '../components/SectionWrapper';
import Magnetic from '../components/Magnetic';
import { qrCodeImage } from '../data/certificates';
import { customTranslateY } from '../data/layout';

const Contact = () => {
  return (
    <SectionWrapper id="contact" auroraColor="aurora-cyan">
      <div data-progress-range className="w-full max-w-4xl mx-auto">
        <motion.div data-progress-anchor
          className="bg-[#181A2A] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/40"
          initial={{ scale: 0.96, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="text-center">
          <h2
            className="text-4xl sm:text-5xl font-bold text-white text-glow"
            style={{
              transform: `translateY(${customTranslateY.contact.h2}px)`,
              marginBottom: '16px'
            }}
          >
            Сделайте первый шаг
          </h2>
          <p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            style={{
              transform: `translateY(${customTranslateY.contact.p}px)`,
              marginBottom: '32px'
            }}
          >
            Первый урок‑знакомство — бесплатно. Определим ваш уровень, обсудим цели и составим план.
          </p>

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
      </div>
    </SectionWrapper>
  );
};

export default Contact;
