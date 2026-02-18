import React from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, useTheme, Chip, Divider
} from '@mui/material';
import {
  BookOpen, Code, Brain, Database, Sparkles,
  Globe, Search, FileText, Cpu, Settings, ShieldCheck, Zap,
  Server, Network, Lock, Layers
} from 'lucide-react';

const capabilities = [
  { 
    icon: Search, 
    title: 'Semantic Search', 
    desc: 'High-precision Pinecone vector retrieval with cosine similarity. Searches archives like arXiv & Google Scholar for academic research.',
    color: '#60A5FA'
  },
  { 
    icon: Brain, 
    title: 'Agent Council', 
    desc: 'Collaborative 5-agent architecture: Planner → Scout → Analyst → Scribe → Critic.',
    color: '#A78BFA'
  },
  { 
    icon: Code, 
    title: 'Cited Responses', 
    desc: 'Research mode appends verifiable inline citations [1], [2] linked directly to external knowledge bases.',
    color: '#34D399'
  },
  { 
    icon: FileText, 
    title: 'PDF Ingestion', 
    desc: 'Advanced PyPDF2 extraction pipeline with recursive chunking and high-dimensional embedding generation.',
    color: '#F472B6'
  },
  { 
    icon: Globe, 
    title: 'Web Integration', 
    desc: 'Tavily API integration for real-time web search and structured content extraction.',
    color: '#FBBF24'
  },
  { 
    icon: ShieldCheck, 
    title: 'Quality Control', 
    desc: 'Safety Protocol agent validates answer fidelity (0-100%) against grounded source material.',
    color: '#F87171'
  },
];

const techStack = [
  { name: 'React + Vite', desc: 'Frontend Core', icon: Code, color: '#61DAFB' },
  { name: 'Django + DRF', desc: 'Backend Systems', icon: Server, color: '#092E20' },
  { name: 'LangGraph', desc: 'Agent Logic', icon: Network, color: '#E11D48' },
  { name: 'Pinecone', desc: 'Vector Store', icon: Database, color: '#3B82F6' },
  { name: 'OpenRouter', desc: 'LLM Gateway', icon: Cpu, color: '#7C3AED' },
  { name: 'Tavily', desc: 'Search Node', icon: Globe, color: '#2563EB' },
];

export default function DocsTab() {
  const theme = useTheme();

  return (
    <Box sx={{ py: 6, px: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Avatar sx={{ 
          width: 80, 
          height: 80, 
          mx: 'auto', 
          mb: 3, 
          bgcolor: 'transparent',
          border: '1px solid',
          borderColor: 'primary.main',
          boxShadow: `0 0 30px ${theme.palette.primary.main}40`
        }}>
          <BookOpen size={40} color={theme.palette.primary.main} />
        </Avatar>
        <Typography variant="h3" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.03em', background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          System Capabilities
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontFamily: '"JetBrains Mono", monospace' }}>
          MARS Assistant Architecture // v2.0
        </Typography>
      </Box>

      {/* Capabilities Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
          <Zap size={24} color={theme.palette.warning.main} /> 
          Core Capabilities
        </Typography>
        
        <Grid container spacing={3}>
          {capabilities.map((cap, index) => (
            <Grid item xs={12} md={6} key={cap.title}>
              <Card 
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    borderColor: cap.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 30px -10px ${cap.color}30`,
                    '& .icon-glow': { opacity: 0.2 }
                  }
                }}
              >
                {/* Glow Effect */}
                <Box className="icon-glow" sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 100, 
                  height: 100, 
                  bgcolor: cap.color, 
                  filter: 'blur(50px)', 
                  opacity: 0, 
                  transition: 'opacity 0.3s',
                  zIndex: 0
                }} />

                <CardContent sx={{ display: 'flex', gap: 2.5, p: 3, position: 'relative', zIndex: 1 }}>
                  <Avatar sx={{ 
                    bgcolor: `${cap.color}15`, 
                    color: cap.color,
                    borderRadius: 3,
                    width: 48, 
                    height: 48,
                    border: `1px solid ${cap.color}30`
                  }}>
                    <cap.icon size={24} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: '1.1rem' }}>
                      {cap.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {cap.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tech Stack Section */}
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
          <Layers size={24} color={theme.palette.info.main} /> 
          Technology Stack
        </Typography>
        <Grid container spacing={2}>
          {techStack.map((tech, index) => (
            <Grid item xs={6} sm={4} key={tech.name}>
              <Card 
                component={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                elevation={0} 
                sx={{ 
                  textAlign: 'center', 
                  height: '100%', 
                  borderRadius: 3, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: tech.color,
                    bgcolor: `${tech.color}05`
                  }
                }}
              >
                <CardContent>
                  <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: `${tech.color}15`, color: tech.color, width: 40, height: 40 }}>
                    <tech.icon size={20} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {tech.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {tech.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
