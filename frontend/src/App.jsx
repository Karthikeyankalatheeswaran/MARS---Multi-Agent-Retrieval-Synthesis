import { useState, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';

export default function App() {
  const chat = useChat();
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

  return (
    <div className="flex w-full h-full overflow-hidden antialiased">
      
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={chat.mode}
        onModeChange={chat.changeMode}
        onClear={chat.clearChat}
        messages={chat.messages}
        isMobile={isMobile}
      />

      {/* Main Container */}
      <main className="flex flex-col flex-1 min-w-0 h-full relative" style={{ background: 'var(--bg-main)' }}>
        
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0 w-full z-10 transition-all">
          
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1 mr-2 opacity-60 hover:opacity-100 transition-opacity">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>MARS</span>
            <span className="text-[13px] font-medium opacity-50">&gt;</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Intelligent Assistant</span>
          </div>

          {/* Mode Toggle Switch (Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center p-1 rounded-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
             <button
                onClick={() => chat.changeMode('student')}
                className="flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm"
                style={{
                  background: chat.mode === 'student' ? 'var(--accent-blue)' : 'transparent',
                  color: chat.mode === 'student' ? 'white' : 'var(--text-secondary)'
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: chat.mode === 'student' ? 'white' : 'var(--text-muted)' }} />
                Student
              </button>
              <button
                onClick={() => chat.changeMode('research')}
                className="flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all"
                 style={{
                  background: chat.mode === 'research' ? 'var(--accent-blue)' : 'transparent',
                  color: chat.mode === 'research' ? 'white' : 'var(--text-secondary)'
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: chat.mode === 'research' ? 'white' : 'var(--text-muted)' }} />
                Research
              </button>
          </div>

          <div className="flex items-center gap-3">
             <button 
                className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5 p-1 text-sm bg-gray-800 rounded-full w-7 h-7 justify-center border border-gray-700 font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                ?
              </button>
          </div>
        </header>

        {/* Chat Area */}
        <ChatPanel chat={chat} />

        {/* Studio Panel Component */}
        {studioOpen && (
          <div className="absolute top-0 right-0 h-full shadow-2xl z-20 transition-all border-l border-white/5">
            <StudioPanel
              messages={chat.messages}
              uploadedFile={chat.uploadedFile}
              mode={chat.mode}
              lastResponse={chat.lastResponse}
              onClose={() => setStudioOpen(false)}
            />
          </div>
        )}

      </main>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}