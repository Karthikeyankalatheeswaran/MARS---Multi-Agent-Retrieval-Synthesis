import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const dots = [
  { color: '#4285F4', delay: 0 },    // Blue
  { color: '#EA4335', delay: 0.15 }, // Red
  { color: '#FBBC04', delay: 0.3 },  // Yellow
  { color: '#34A853', delay: 0.45 }, // Green
];

const dotVariants = {
  animate: {
    y: [0, -8, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function GeminiLoader() {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 2 }}>
      {dots.map((dot, index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          animate="animate"
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: dot.color,
          }}
          transition={{
            delay: dot.delay,
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </Box>
  );
}
