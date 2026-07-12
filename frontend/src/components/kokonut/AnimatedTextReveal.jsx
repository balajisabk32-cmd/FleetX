import React from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export function AnimatedTextReveal({ text, className }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const mainControls = useAnimation();

  React.useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} className={className}>
      <motion.span
        variants={{
          hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
          visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              staggerChildren: 0.04,
              ease: [0.32, 0.72, 0, 1],
              duration: 1
            }
          }
        }}
        initial="hidden"
        animate={mainControls}
        aria-hidden="true"
        className="inline-block"
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
              visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
            }}
            transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.8 }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </div>
  );
}
