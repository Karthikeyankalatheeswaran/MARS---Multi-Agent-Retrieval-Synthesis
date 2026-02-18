import React, { useRef, useState } from 'react';
import { predictExamQuestions } from '../api/client';
import ReactMarkdown from 'react-markdown';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Button, Divider, IconButton, Tooltip, Collapse,
  useMediaQuery, Avatar, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  History as HistoryIcon,
  School as SchoolIcon,
  Science as ScienceIcon,
  UploadFile as UploadIcon,
  Description as FileIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  AutoAwesome as SparklesIcon,
  KeyboardArrowDown,
  RocketLaunch as MarsIcon,
  Book as DocsIcon
} from '@mui/icons-material';

export default function Sidebar({
  open, setOpen, mode, onModeChange,
  uploadedFile, isUploading, onUpload, onClear, 
  activeTab, setActiveTab
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef(null);
  const [showRecent, setShowRecent] = useState(true);
  
  // Oracle State
  const [oracleOpen, setOracleOpen] = useState(false);
  const [subjectCode, setSubjectCode] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Mock data removed for production - can be replaced with real history later
  const recentChats = []; 

  const handlePredict = async () => {
    if (!subjectCode.trim()) return;
    setLoadingPrediction(true);
    setPrediction(null);
    try {
      const result = await predictExamQuestions(subjectCode);
      setPrediction(result.prediction);
    } catch (e) {
      setPrediction("Failed to predict questions. Please try again.");
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]?.type === 'application/pdf') {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const drawerWidth = 280;

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setOpen(!open)} sx={{ color: 'text.secondary' }}>
            <MenuIcon />
          </IconButton>
          {!open && (
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <MarsIcon sx={{ color: 'primary.main' }} />
               <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                 MARS
               </Typography>
             </Box>
          )}
        </Box>
      </Box>

      {/* New Chat Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          onClear();
          setActiveTab('chat');
        }}
        sx={{
          borderRadius: 3,
          py: 1.5,
          boxShadow: 'none',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' 
            : 'rgba(255,255,255,0.05)',
          color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.light',
          border: '1px solid',
          borderColor: theme.palette.mode === 'light' ? 'primary.light' : 'rgba(255,255,255,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' 
              : 'rgba(255,255,255,0.1)',
          },
          justifyContent: 'flex-start',
          pl: 3,
          mb: 4,
          fontWeight: 600
        }}
      >
        New Chat
      </Button>

      {/* Mode Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="caption" sx={{ ml: 1, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>
          ASSISTANT MODE
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, p: 0.5, bgcolor: 'action.hover', borderRadius: 3 }}>
          {[
            { id: 'student', icon: SchoolIcon, label: 'Student' },
            { id: 'research', icon: ScienceIcon, label: 'Research' }
          ].map((m) => (
            <Button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              startIcon={<m.icon fontSize="small" />}
              sx={{
                flex: 1,
                borderRadius: 2.5,
                bgcolor: mode === m.id ? 'background.paper' : 'transparent',
                color: mode === m.id ? 'primary.main' : 'text.secondary',
                boxShadow: mode === m.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: mode === m.id ? 'background.paper' : 'rgba(0,0,0,0.04)',
                }
              }}
            >
              {m.label}
            </Button>
          ))}
        </Box>

        {/* Exam Oracle Button (Student Mode Only) */}
        {mode === 'student' && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SparklesIcon />}
            onClick={() => setOracleOpen(true)}
            sx={{ mt: 2, borderRadius: 2, textTransform: 'none', borderColor: 'primary.light', color: 'primary.main' }}
          >
            Open Exam Oracle
          </Button>
        )}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* File Upload Area */}
      <Box sx={{ mt: 2 }}>
        {mode === 'student' && (
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: uploadedFile ? 'primary.light' : 'transparent',
              background: uploadedFile 
                ? `linear-gradient(135deg, ${theme.palette.primary.light}10 0%, ${theme.palette.primary.main}10 100%)`
                : 'transparent',
              cursor: isUploading ? 'wait' : 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              opacity: isUploading ? 0.7 : 1,
              '&:hover': { 
                borderColor: 'primary.main',
                bgcolor: 'action.hover' 
              }
            }}
          >
            {isUploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', py: 1 }}>
                 <CircularProgress size={20} />
                 <Typography variant="body2" color="text.secondary">Transmitting...</Typography>
              </Box>
            ) : uploadedFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <FileIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box sx={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
                  <Typography variant="body2" noWrap fontWeight={600}>{uploadedFile.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                  </Typography>
                </Box>
                <CheckIcon color="success" fontSize="small" />
              </Box>
            ) : (
              <Box sx={{ py: 1 }}>
                <UploadIcon sx={{ color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" fontWeight={500}>
                  Upload Document
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Drop PDF or click to select
                </Typography>
              </Box>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".pdf" 
              hidden 
              onChange={handleFileSelect} 
              disabled={isUploading}
            />
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <ListItemButton 
          selected={activeTab === 'workflow'}
          onClick={() => setActiveTab('workflow')}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Agent Workflow" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItemButton>
        <ListItemButton 
          selected={activeTab === 'docs'}
          onClick={() => setActiveTab('docs')}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><DocsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Project Docs" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItemButton>
      </Box>

      {/* Oracle Dialog */}
      <Dialog 
        open={oracleOpen} 
        onClose={() => setOracleOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, height: '80vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <SparklesIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Exam Question Oracle</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter Subject Code (e.g. CS3351) to find repeated and important questions from Anna University.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField 
                fullWidth 
                placeholder="Subject Code / Name" 
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                size="small"
                sx={{ bgcolor: 'background.paper' }}
              />
              <Button 
                variant="contained" 
                onClick={handlePredict}
                disabled={loadingPrediction || !subjectCode.trim()}
                sx={{ minWidth: 100, borderRadius: 2 }}
              >
                {loadingPrediction ? <CircularProgress size={20} color="inherit" /> : 'Predict'}
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.paper' }}>
            {prediction ? (
              <Box sx={{ 
                '& h1': { fontSize: '1.5rem', mb: 2, color: 'primary.main' },
                '& h2': { fontSize: '1.2rem', mt: 3, mb: 1, borderBottom: '1px solid #eee', pb: 1 },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { mb: 0.5 }
              }}>
                <ReactMarkdown>{prediction}</ReactMarkdown>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                <MarsIcon sx={{ fontSize: 60, mb: 2, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.disabled">
                  Ready to analyze exam patterns...
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOracleOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: open ? drawerWidth : 0 }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}>
      <Drawer
        variant="temporary"
        open={isMobile && open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {content}
      </Drawer>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default'
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  );
}