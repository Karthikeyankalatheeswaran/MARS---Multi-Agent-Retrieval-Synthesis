import { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider as MuiThemeProvider, useMediaQuery } from '@mui/material';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import WorkflowTab from './components/WorkflowTab';
import DocsTab from './components/DocsTab';
import { useChat } from './hooks/useChat';
import { getStatus } from './api/client';
import ThemeContextProvider, { useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './theme/muiTheme';

function AppContent() {
  const { mode } = useTheme();
  const theme = mode === 'light' ? lightTheme : darkTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [serverOnline, setServerOnline] = useState(false);
  const chat = useChat();

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    getStatus()
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          mode={chat.mode}
          onModeChange={chat.changeMode}
          uploadedFile={chat.uploadedFile}
          isUploading={chat.isUploading}
          onUpload={chat.upload}
          onClear={chat.clearChat}
          serverOnline={serverOnline}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <Box component="main" sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
          {activeTab === 'chat' && (
            <ChatArea 
              chat={chat} 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
            />
          )}
          {(activeTab === 'workflow' || activeTab === 'docs') && (
            <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: 'background.default' }}>
              {activeTab === 'workflow' && <WorkflowTab agentLogs={chat.lastResponse?.agent_logs} />}
              {activeTab === 'docs' && <DocsTab />}
            </Box>
          )}
        </Box>
      </Box>
    </MuiThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
}