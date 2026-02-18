import React from 'react';
import { motion } from 'framer-motion';
import { Box, Paper, Typography, Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import { Lightbulb, BookOpen, Quote, Hash } from 'lucide-react';

const StudyGuideRenderer = ({ cards }) => {
  const theme = useTheme();

  if (!cards || cards.length === 0) return null;

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lightbulb size={20} color={theme.palette.warning.main} />
        Study Guide: Key Concepts
      </Typography>
      
      <Grid container spacing={2}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                {/* Icon Background */}
                <Typography sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  right: -10, 
                  fontSize: '4rem', 
                  opacity: 0.05, 
                  userSelect: 'none' 
                }}>
                  {card.icon || '#'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Paper sx={{ 
                    width: 36, 
                    height: 36, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontSize: '1.2rem'
                  }}>
                    {card.icon || <Hash size={18} />}
                  </Paper>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {card.title}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 40 }}>
                  {card.definition}
                </Typography>

                <Box sx={{ 
                  bgcolor: 'action.hover', 
                  p: 1.5, 
                  borderRadius: 2,
                  mb: 1.5,
                  borderLeft: '3px solid',
                  borderColor: 'secondary.main'
                }}>
                  <Typography variant="caption" sx={{ display: 'flex', gap: 1, fontWeight: 600, color: 'secondary.main', mb: 0.5 }}>
                    <Quote size={12} /> EXAMPLE
                  </Typography>
                  <Typography variant="body2" fontSize="0.85rem">
                    {card.example}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookOpen size={14} color={theme.palette.success.main} />
                  <Typography variant="caption" fontWeight={600} color="success.main">
                    TAKEAWAY:
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {card.takeaway}
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StudyGuideRenderer;
