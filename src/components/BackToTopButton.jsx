import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';

const BackToTopButton = React.memo(({ isVisible }) => (
  <AnimatePresence>{isVisible && (
    <motion.button
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-400 transition-colors z-50">
      <FiArrowUp size={24} />
    </motion.button>)
  }
  </AnimatePresence>
));

export default BackToTopButton;
