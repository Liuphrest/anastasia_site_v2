import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { pains50, painPositions, sizeCycle } from '../data/pains';

// Custom Hook for simplified scroll-based transform
const useScrollTransform = (ref, from, to) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  return useTransform(scrollYProgress, from, to);
};

// Transition Component with Pain Points (показывает 12 из списка с оффсетом)
const PainsTransition = ({ pains = pains50, offset = 0, heightVh = 50 }) => {
  const transitionRef = useRef(null);
  const opacity = useScrollTransform(transitionRef, [0, 0.5, 1], [0, 1, 0]);
  const y = useScrollTransform(transitionRef, [0, 1], ['50%', '-50%']);

  const subset = painPositions.map((pos, i) => {
    const idx = (offset + i) % pains.length;
    return { text: pains[idx], pos, size: sizeCycle[i % sizeCycle.length] };
  });

  return (
    <div ref={transitionRef} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, y }} className="relative w-full h-full">
          {subset.map((item, i) => (
            <span
              key={i}
              className={`absolute text-white/30 ${item.size}`}
              style={{ top: item.pos.top, left: item.pos.left, right: item.pos.right }}
            >
              {item.text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PainsTransition;