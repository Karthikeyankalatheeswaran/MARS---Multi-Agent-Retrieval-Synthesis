import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const Typewriter = ({ text, delay = 10, onComplete, ...props }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return (
    <Typography {...props}>
      {currentText}
      {currentIndex < text.length && (
        <span style={{ borderRight: '2px solid currentColor', marginLeft: '2px', animation: 'blink 1s step-end infinite' }} />
      )}
      <style>
        {`@keyframes blink { 50% { border-color: transparent; } }`}
      </style>
    </Typography>
  );
};

export default Typewriter;
