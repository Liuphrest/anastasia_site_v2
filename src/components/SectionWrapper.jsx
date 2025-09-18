import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Custom Hook for simplified scroll-based transform
const useScrollTransform = (ref, from, to) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  return useTransform(scrollYProgress, from, to);
};

// Section Wrapper for background auroras
const SectionWrapper = ({ children, auroraColor, id }) => {
  const sectionRef = useRef(null);
  const opacity = useScrollTransform(sectionRef, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0]);

  return (
    <section id={id} ref={sectionRef} className="relative py-24 px-4 min-h-screen flex items-center">
      <motion.div
        style={{ opacity }}
        className={`absolute inset-0 z-0 ${auroraColor} pointer-events-none`}
      />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;