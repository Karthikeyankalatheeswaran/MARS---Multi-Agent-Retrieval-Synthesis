import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from './hooks/useChat';
import { getStatus, generateStudyCards } from './api/client';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';
import AgentTrace from './components/AgentTrace';

export default function App() {
  const chat = useChat();
  const [serverOnline, setServerOnline] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [studioOpen, setStudioOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) { setSidebarOpen(false); setStudioOpen(false); }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getStatus().then(() => setServerOnline(true)).catch(() => setServerOnline(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={chat.mode}
        onModeChange={chat.changeMode}
        uploadedFile={chat.uploadedFile}
        isUploading={chat.isUploading}
        onUpload={chat.upload}
        onClear={chat.clearChat}
        serverOnline={serverOnline}
        messages={chat.messages}
        isMobile={isMobile}
      />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 h-14 shrink-0 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-3">
            {(!sidebarOpen || isMobile) && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--accent)' }}
              >M</div>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>MARS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{
                background: serverOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: serverOnline ? '#10b981' : '#ef4444',
                border: `1px solid ${serverOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: serverOnline ? '#10b981' : '#ef4444' }} />
              {serverOnline ? 'Online' : 'Offline'}
            </div>

            <button
              onClick={() => setStudioOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: studioOpen ? 'var(--accent-dim)' : 'transparent',
                color: studioOpen ? '#6b9fff' : 'var(--text-secondary)',
                border: `1px solid ${studioOpen ? 'var(--border-accent)' : 'var(--border)'}`
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Studio
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ChatPanel chat={chat} />
          {studioOpen && !isMobile && (
            <StudioPanel
              messages={chat.messages}
              uploadedFile={chat.uploadedFile}
              mode={chat.mode}
              lastResponse={chat.lastResponse}
              onClose={() => setStudioOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Mobile studio panel as bottom sheet */}
      {studioOpen && isMobile && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 rounded-t-2xl border-t"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <StudioPanel
            messages={chat.messages}
            uploadedFile={chat.uploadedFile}
            mode={chat.mode}
            lastResponse={chat.lastResponse}
            onClose={() => setStudioOpen(false)}
          />
        </div>
      )}
    </div>
  );
}