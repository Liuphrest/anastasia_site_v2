import React from 'react';
import { motion } from 'framer-motion';
import NavLink from './NavLink';
import BrandNameChanging from './BrandNameChanging';
import { existingSpacing } from '../data/layout';

const Header = ({ activeSection, setShowContactModal }) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 w-full bg-[#0B0D17]/80 backdrop-blur-lg border-b border-white/10 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-end cursor-pointer transition-all duration-300 ml-[15ch]"
            style={{ transform: `translateY(${existingSpacing.header.brandTranslateY}px)` }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <BrandNameChanging />
          </motion.div>
          <div className="hidden md:flex items-center space-x-6 relative">
            <NavLink id="about" active={activeSection==="about"}>Обо мне</NavLink>
            <NavLink id="method" active={activeSection==="method"}>Методика</NavLink>
            <NavLink id="testimonials" active={activeSection==="testimonials"}>Отзывы</NavLink>
            <NavLink id="qualification" active={activeSection==="qualification"}>Квалификация</NavLink>
            <NavLink id="contact" active={activeSection==="contact"}>Контакты</NavLink>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowContactModal(true)}
              className="pointer-events-auto px-7 py-3 cta-button text-lg tracking-wide focus:outline-none"
              aria-label="Пробный урок"
            >
              <span className="cta-gradient-text font-bold italic font-cta">Пробный урок</span>
            </motion.button>
          </div>
        </div>

      </div>
    </motion.nav>
  );
};

export default Header;
