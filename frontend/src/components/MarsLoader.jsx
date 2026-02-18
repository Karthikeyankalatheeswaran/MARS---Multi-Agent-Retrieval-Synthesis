import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const OrbitalLoader = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
      <Box sx={{ position: 'relative', width: 24, height: 24 }}>
        {/* Core */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: primary,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Orbit 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: secondary,
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        </motion.div>

        {/* Orbit 2 (Reverse) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{
            width: 16,
            height: 16,
            position: 'absolute',
            top: 4,
            left: 4,
          }}
        >
          <div style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: theme.palette.text.secondary,
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translate(-50%, 50%)',
          }} />
        </motion.div>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Thinking
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >...</motion.span>
      </Typography>
    </Box>
  );
};

export default OrbitalLoader;
