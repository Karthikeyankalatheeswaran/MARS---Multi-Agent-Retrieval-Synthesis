import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, TextField, IconButton, Fab, Paper, Avatar,
  Grid, Card, CardActionArea, CardContent, Chip, Tooltip,
  Collapse, Button, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  AutoAwesome as SparklesIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Lightbulb as LightbulbIcon,
  Create as CreateIcon,
  CompareArrows as CompareIcon,
  MenuBook as BookIcon,
  Science as ScienceIcon,
  ExpandMore as ExpandMoreIcon,
  Description as FileIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  RocketLaunch as MarsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import MarsLoader from './MarsLoader';
import { generateStudyCards } from '../api/client';
import StudyGuideRenderer from './StudyGuideRenderer';
import MindMapRenderer from './MindMapRenderer';
import { Hub as HubIcon } from '@mui/icons-material';
import { Tooltip as MuiTooltip } from '@mui/material';

// --- Typewriter Component ---
const Typewriter = ({ text, onComplete, delay = 5 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      onComplete && onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return <ReactMarkdown>{currentText}</ReactMarkdown>;
};

// --- Message Component ---
const Message = ({ msg, isLast, lastResponse, mode }) => {
  const theme = useTheme();
  const isUser = msg.role === 'user';
  const [showTrace, setShowTrace] = useState(false);
  const [typingComplete, setTypingComplete] = useState(!isLast);
  const [studyCards, setStudyCards] = useState(null);
  const [generatingCards, setGeneratingCards] = useState(false);

  useEffect(() => {
    if (!isLast) setTypingComplete(true);
  }, [isLast]);

  const handleGenerateCards = async () => {
    if (generatingCards) return;
    setGeneratingCards(true);
    try {
      const result = await generateStudyCards(msg.content);
      if (result && result.cards) {
        setStudyCards(result.cards);
        // Store mind map in metadata for the renderer to pick up
        msg.metadata = { ...msg.metadata, mind_map: result.mind_map };
      }
    } catch (error) {
      console.error("Failed to generate visualizations:", error);
    } finally {
      setGeneratingCards(false);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mb: 4,
        maxWidth: '100%',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        width: '100%'
      }}
    >
      {/* Sender Label */}
      <Typography variant="caption" sx={{ 
        fontWeight: 600, 
        color: 'text.secondary', 
        ml: isUser ? 0 : 2, 
        mr: isUser ? 2 : 0,
        letterSpacing: '0.05em'
      }}>
        {isUser ? 'YOU' : 'ASSISTANT'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, maxWidth: isUser ? '85%' : '100%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: isUser ? 'transparent' : 'primary.main',
            color: isUser ? 'text.secondary' : '#fff',
            width: 36,
            height: 36,
            mt: 0.5,
            boxShadow: isUser ? 'none' : theme.shadows[2]
          }}
          src={isUser ? undefined : undefined} 
        >
          {isUser ? <PersonIcon /> : <MarsIcon fontSize="small" />}
        </Avatar>

        {/* Bubble */}
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: isUser 
                ? (theme.palette.mode === 'light' ? '#F1F5F9' : '#1E293B') 
                : 'background.paper',
              border: isUser ? 'none' : `1px solid ${theme.palette.divider}`,
              borderRadius: isUser ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
              boxShadow: isUser ? 'none' : theme.shadows[1],
              maxWidth: '100%'
            }}
          >
            {isUser ? (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {msg.content}
              </Typography>
            ) : (
              <Box>
                {/* Typewriter text or Static content */}
                <Typography component="div" variant="body1" sx={{ 
                  '& p': { mb: 2, lineHeight: 1.7 },
                  '& ul, & ol': { mb: 2, pl: 3 },
                  '& li': { mb: 0.5 },
                  '& code': { 
                    fontFamily: '"JetBrains Mono", monospace', 
                    bgcolor: 'action.hover', 
                    p: 0.5, 
                    borderRadius: 1,
                    fontSize: '0.9em',
                    color: 'primary.main'
                  },
                  '& pre': { 
                    bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#0F172A', 
                    p: 2, 
                    borderRadius: 2, 
                    overflowX: 'auto',
                    my: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }
                }}>
                  {isLast && !typingComplete ? (
                    <Typewriter 
                      text={msg.content} 
                      onComplete={() => setTypingComplete(true)} 
                      delay={1} 
                    />
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </Typography>

                {/* Citations / Sources */}
                {msg.metadata?.retrieved_sources?.length > 0 && typingComplete && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      SOURCES
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {msg.metadata.retrieved_sources.slice(0, 3).map((src, i) => (
                        <Chip
                          key={i}
                          icon={<FileIcon fontSize="small" />}
                          label={src.source}
                          variant="outlined"
                          clickable
                          component="a"
                          href={src.url || '#'}
                          target="_blank"
                          size="small"
                          sx={{ borderRadius: 1.5, borderColor: 'divider' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Visualizations Renderer */}
                <AnimatePresence>
                  {studyCards && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <MindMapRenderer data={msg.metadata?.mind_map || { center: 'Topic', nodes: [] }} />
                      <StudyGuideRenderer cards={studyCards} />
                    </motion.div>
                  )}
                </AnimatePresence>

              </Box>
            )}
          </Paper>

          {/* AI Actions (After Bubble) */}
          {!isUser && typingComplete && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 1 }}>
              <Tooltip title="Copy">
                <IconButton size="small" sx={{ color: 'text.secondary' }}><CopyIcon fontSize="small" /></IconButton>
              </Tooltip>
              
              {/* Generate Study Guide Button (Student Mode Only) */}
              {mode === 'student' && !studyCards && (
                <Button
                  size="small"
                  startIcon={generatingCards ? <CircularProgress size={14} /> : <HubIcon />}
                  onClick={handleGenerateCards}
                  disabled={generatingCards}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    color: generatingCards ? 'text.disabled' : 'secondary.main', 
                    fontSize: '0.8rem',
                    bgcolor: 'secondary.soft',
                    px: 2,
                    '&:hover': { bgcolor: 'secondary.softHover' }
                  }}
                >
                  {generatingCards ? 'Thinking...' : 'Generate Visualizations'}
                </Button>
              )}

              {/* Agent Trace Toggle */}
              {isLast && lastResponse?.agent_logs && (
                <Button 
                  size="small" 
                  endIcon={<ExpandMoreIcon sx={{ transform: showTrace ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}/>}
                  onClick={() => setShowTrace(!showTrace)}
                  sx={{ ml: 'auto', borderRadius: 2, textTransform: 'none', color: 'text.secondary', fontSize: '0.8rem' }}
                >
                  View Process
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Agent Trace Accordion */}
      <Collapse in={showTrace}>
        {isLast && lastResponse?.agent_logs && (
           <Paper variant="outlined" sx={{ mt: 1, ml: 6.5, overflow: 'hidden', borderRadius: 3, bgcolor: 'background.default' }}>
              {lastResponse.agent_logs.map((log, i) => (
                <Box key={i} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={log.agent} size="small" sx={{ fontWeight: 700, borderRadius: 1, height: 20, fontSize: '0.7rem', bgcolor: 'primary.main', color: '#fff' }} />
                    <Chip label={log.status} size="small" variant="outlined" color={log.status === 'completed' ? 'success' : 'default'} sx={{ height: 20, fontSize: '0.65rem' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontFamily: 'monospace' }}>{log.duration_ms}ms</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', pl: 0.5 }}>
                    "{log.thinking}"
                  </Typography>
                </Box>
              ))}
           </Paper>
        )}
      </Collapse>
    </Box>
  );
};

// --- Main ChatArea ---
export default function ChatArea({ chat, sidebarOpen, setSidebarOpen }) {
  const theme = useTheme();
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState('');
  const { messages, isLoading, mode, send, lastResponse, upload, isUploading } = chat;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      upload(e.target.files[0]);
    }
  };

  const suggestions = [
    { label: 'Summarize document', icon: BookIcon },
    { label: 'Deep Analysis', icon: ScienceIcon },
    { label: 'Generate quiz', icon: CreateIcon },
    { label: 'Compare & Contrast', icon: CompareIcon },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', bgcolor: 'background.default' }}>
      
      {/* Sidebar Toggle (Visible when closed) */}
      {!sidebarOpen && (
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <IconButton onClick={() => setSidebarOpen(true)} sx={{ bgcolor: 'background.paper', boxShadow: theme.shadows[2] }}>
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Scrollable Chat Area */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        px: { xs: 2, md: 5 }, 
        pt: 4, 
        pb: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ maxWidth: 860, mx: 'auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Welcome State */}
          {messages.length === 0 && (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '60vh',
              textAlign: 'center'
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                bgcolor: 'transparent',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <MarsIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Avatar>
              <Typography 
                variant="h2" 
                component={motion.h1}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ 
                  mb: 1, 
                  color: 'text.primary',
                  fontWeight: 700,
                  letterSpacing: '-0.03em'
                }}
              >
                Welcome back.
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ mb: 6, color: 'text.secondary', fontWeight: 400, maxWidth: 500 }}
              >
                How can I help you today?
              </Typography>

              {/* Suggestions Grid */}
              <Grid container spacing={2} sx={{ maxWidth: 800 }}>
                {suggestions.map((s, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        borderRadius: 3, 
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                    >
                      <CardActionArea 
                        onClick={() => setInput(s.label)} 
                        sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 140, justifyContent: 'center' }}
                      >
                         <s.icon color="primary" fontSize="large" sx={{ opacity: 0.8 }} />
                         <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Messages List */}
          <Box sx={{ flex: 1 }}>
            {messages.map((msg, i) => (
              <Message 
                key={i} 
                msg={msg} 
                isLast={msg.role === 'assistant' && i === messages.length - 1} 
                lastResponse={lastResponse} 
                mode={mode}
              />
            ))}
            
            {/* Thinking Indicator */}
            {isLoading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4, ml: 6 }}>
                <MarsLoader />
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>
        </Box>
      </Box>

      {/* Input Area (Sticky Bottom) */}
      <Box sx={{ p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ maxWidth: 860, mx: 'auto', position: 'relative' }}>
          <TextField
            fullWidth
            multiline
            maxRows={6}
            placeholder={mode === 'student' ? "Analyze uploaded documents..." : "Initialize research query..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            variant="outlined"
            InputProps={{
              sx: {
                pr: 14, // Space for buttons
                pl: 3,
                py: 2,
                borderRadius: 4,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[2],
                fontSize: '1rem',
                '& fieldset': { border: 'none' }, // Remove default border
                '&.Mui-focused': {
                   boxShadow: `0 0 0 2px ${theme.palette.primary.main}30`, // Custom focus ring
                }
              }
            }}
          />
          
          {/* Action Buttons inside Input */}
          <Box sx={{ position: 'absolute', right: 12, bottom: 10, display: 'flex', gap: 1 }}>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".pdf" 
              hidden 
              onChange={handleFileSelect} 
              disabled={isUploading}
            />
            {mode === 'student' && (
              <Tooltip title={isUploading ? "Uploading..." : "Upload Attachments"}>
                <IconButton 
                  size="small" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  sx={{ color: isUploading ? 'primary.main' : 'text.secondary' }}
                >
                  {isUploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
                </IconButton>
              </Tooltip>
            )}
            <Fab 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              color="primary"
              size="small"
              sx={{ 
                ml: 1, 
                boxShadow: 'none',
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
              }}
            >
              <SendIcon fontSize="small" />
            </Fab>
          </Box>
        </Box>
        <Typography variant="caption" align="center" display="block" sx={{ mt: 2, color: 'text.disabled', letterSpacing: '0.02em' }}>
          MARS Assistant v2.0
        </Typography>
      </Box>
    </Box>
  );
}