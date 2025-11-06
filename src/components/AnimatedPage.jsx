// src/components/AnimatedPage.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Define the animation "variants"
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Start 20px down
  },
  in: {
    opacity: 1,
    y: 0, // Animate to original position
  },
  out: {
    opacity: 0,
    y: -20, // Exit 20px up
  },
};

// Define the "bouncy" transition
const pageTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

export default AnimatedPage;