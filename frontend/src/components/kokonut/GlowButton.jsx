import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function GlowButton({ children, onClick, className }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-flex items-center justify-center p-0.5 rounded-full overflow-hidden group ${className}`}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
      <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/50 to-primary/0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-full" />
      
      <div className="relative flex items-center gap-3 bg-white text-black font-semibold rounded-full pl-6 pr-2 py-2 shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-active:scale-[0.98]">
        {children}
      </div>
    </motion.button>
  );
}
