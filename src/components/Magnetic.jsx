import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Magnetic = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const element = ref.current;
    if (!element) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = element.getBoundingClientRect();
    setPosition({ x: clientX - (left + width / 2), y: clientY - (top + height / 2) });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x * 0.1, y: position.y * 0.1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
