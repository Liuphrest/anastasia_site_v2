import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ImageModal = React.memo(({ modalContent, setModalContent }) => {
  if (!modalContent) return null;
  return <ImageModalInternal modalContent={modalContent} setModalContent={setModalContent} />;
});

const ImageModalInternal = React.memo(({ modalContent, setModalContent }) => {
  const [direction, setDirection] = useState(0);
  const { src, imageSet = [] } = modalContent;

  const changeImage = useCallback((delta) => {
    if (!imageSet.length) return;
    setDirection(delta);
    const currentIndex = imageSet.indexOf(src);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (safeIndex + delta + imageSet.length) % imageSet.length;
    setModalContent((prev) => (prev ? { ...prev, src: imageSet[nextIndex] } : prev));
  }, [imageSet, setModalContent, src]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalContent(null);
        return;
      }
      if (imageSet.length < 2) return;
      if (e.key === 'ArrowRight') changeImage(1);
      if (e.key === 'ArrowLeft') changeImage(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeImage, imageSet.length, setModalContent]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={() => setModalContent(null)}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-full max-h-[90vh] flex items-center justify-center"
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={src}
            src={src}
            alt=""
            custom={direction}
            initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction < 0 ? 200 : -200, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute max-w-full max-h-full object-contain rounded-lg"
          />
        </AnimatePresence>
        {imageSet.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                changeImage(-1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white border border-white/20 p-3 rounded-full hover:bg-black/80 transition-colors z-20 shadow-lg"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                changeImage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white border border-white/20 p-3 rounded-full hover:bg-black/80 transition-colors z-20 shadow-lg"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}
        <motion.button
          whileHover={{ scale: 1.2, rotate: 90 }}
          onClick={() => setModalContent(null)}
          className="absolute top-4 right-4 bg-black/60 text-white border border-white/20 rounded-full p-2 z-20 shadow-lg hover:bg-black/80"
        >
          <FiX size={24} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
});

export default ImageModal;
