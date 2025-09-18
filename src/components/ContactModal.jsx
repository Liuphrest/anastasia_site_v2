import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const ContactModal = ({ isOpen, onClose, qrCodeImage }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="bg-[#181A2A] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-black/40 relative" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><FiX size={24} /></button>
          <h3 className="text-xl font-bold text-white mb-6 text-center">Свяжитесь со мной</h3>
          <div className="flex flex-col items-center mb-6">
            <motion.a
              href="tel:+79372565939"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white font-semibold text-lg mb-4 hover:text-purple-400 transition-colors cursor-pointer"
            >
              +7-937-256-59-39
            </motion.a>
            <div className="bg-white p-2 rounded-xl"><img src={qrCodeImage} alt="Telegram QR" className="w-full h-auto rounded-lg"/></div>
            <p className="text-sm text-white/50 text-center mt-4">Наведите камеру, чтобы написать в Telegram, или нажмите на кнопку ниже.</p>
          </div>
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href='https://t.me/anaprikh' target='_blank' rel="noopener noreferrer"
            className="block w-full text-center bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-400 transition-colors font-medium">Написать в Telegram</motion.a>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ContactModal;
