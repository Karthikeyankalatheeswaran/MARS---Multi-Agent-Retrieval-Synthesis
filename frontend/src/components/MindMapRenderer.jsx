import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Paper, useTheme, Tooltip } from '@mui/material';
import { Hub as HubIcon } from '@mui/icons-material';

const MindMapRenderer = ({ data }) => {
  const theme = useTheme();

  if (!data || !data.nodes) return null;

  const { center, nodes } = data;

  return (
    <Box sx={{ mt: 4, mb: 4, position: 'relative', minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ 
        position: 'absolute', 
        top: -30, 
        left: 0, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        <HubIcon size={20} color="primary" />
        Conceptual Map
      </Typography>

      {/* Central Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ zIndex: 2 }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: '50%',
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#fff',
            boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
            border: '4px solid rgba(255,255,255,0.2)'
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} lineHeight={1.2}>
            {center}
          </Typography>
        </Paper>
      </motion.div>

      {/* Branching Nodes */}
      {nodes.map((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        const radius = 160;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <React.Fragment key={node.id}>
            {/* Connection Line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: radius, opacity: 0.2 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
              style={{
                position: 'absolute',
                height: 2,
                background: theme.palette.primary.main,
                transformOrigin: 'left center',
                left: '50%',
                top: '50%',
                rotate: `${(angle * 180) / Math.PI}deg`,
                zIndex: 1
              }}
            />

            {/* Branch Node */}
            <motion.div
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x, y, opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1, type: 'spring' }}
              style={{ position: 'absolute' }}
            >
              <Tooltip title={node.description} arrow placement="top">
                <Paper
                  sx={{
                    p: 1.5,
                    px: 2,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'help',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  <Typography variant="caption" fontWeight={700} noWrap>
                    {node.label}
                  </Typography>
                </Paper>
              </Tooltip>
            </motion.div>
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default MindMapRenderer;
