import { useState, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';

export default function App() {
  const chat = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [studioOpen, setStudioOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bglight dark:bg-bgdark text-slate-900 dark:text-slate-100 font-display">
      
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

      {/* Main Container Area */}
      <main className="flex-1 flex flex-col relative bg-bglight dark:bg-bgdark overflow-hidden">
        
        {/* Header / Top Navigation Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-bglight/80 dark:bg-bgdark/80 backdrop-blur-md shrink-0 border-b border-white/5">
          
          <div className="flex items-center gap-2 min-w-0">
            {(!sidebarOpen || isMobile) && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-1 mr-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-lg">menu</span>
              </button>
            )}
            <span className="text-sm font-bold tracking-tight text-slate-400">MARS</span>
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-xs translate-y-0.5">chevron_right</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">Intelligent Assistant</span>
          </div>

          {/* Mode Toggle Switch (Center) */}
          <div className="flex-1 flex justify-center mx-4">
            <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800/80 rounded-full w-full max-w-[256px] shadow-inner transition-all">
               <button
                  onClick={() => chat.changeMode('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${chat.mode === 'student' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-base">school</span>
                  Student
                </button>
                <button
                  onClick={() => chat.changeMode('research')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${chat.mode === 'research' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-base">science</span>
                  Research
                </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => setStudioOpen(!studioOpen)}
                className={`size-9 flex items-center justify-center rounded-full transition-colors ${studioOpen ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                title="Studio / NotebookLM Features"
              >
                <span className="material-symbols-outlined">auto_stories</span>
              </button>
              <button 
                className="size-9 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Help"
              >
                <span className="material-symbols-outlined">help</span>
              </button>
          </div>
        </header>

        {/* Chat Area Section */}
        <div className="flex-1 relative flex overflow-hidden">
          <ChatPanel chat={chat} />

          {/* Studio Panel Component */}
          {studioOpen && (
            <div className="w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 transition-all animate-slide-right overflow-y-auto">
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

      </main>

    </div>
  );
}