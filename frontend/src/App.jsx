import { useState, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';
import AgentWorkflow from './components/AgentWorkflow';
import DocumentManager from './components/DocumentManager';
import PdfViewer from './components/PdfViewer';

export default function App() {
  const chat = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [studioOpen, setStudioOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [viewerNamespace, setViewerNamespace] = useState(null);
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
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-bglight/80 dark:bg-bgdark/80 backdrop-blur-md shrink-0 border-b border-white/5">
          
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
          <div className="flex-1 flex justify-center mx-2 md:mx-4">
            <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800/80 rounded-full w-full max-w-[240px] md:max-w-[256px] shadow-inner transition-all">
               <button
                  onClick={() => chat.changeMode('student')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 md:px-3 rounded-full text-[11px] md:text-xs font-bold transition-all ${chat.mode === 'student' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-sm md:text-base">school</span>
                  Student
                </button>
                <button
                  onClick={() => chat.changeMode('research')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 md:px-3 rounded-full text-[11px] md:text-xs font-bold transition-all ${chat.mode === 'research' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-sm md:text-base">science</span>
                  Research
                </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
             {/* Agent Workflow Button */}
             <button 
                onClick={() => setWorkflowOpen(true)}
                className="size-8 md:size-9 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="View Agent Architecture"
              >
                <span className="material-symbols-outlined text-lg">hub</span>
              </button>

             {/* Library Button */}
             <button 
                onClick={() => setLibraryOpen(true)}
                className="size-8 md:size-9 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Document Library"
              >
                <span className="material-symbols-outlined text-lg">library_books</span>
              </button>

             {/* MARS Forge Button */}
             <button 
                onClick={() => setStudioOpen(!studioOpen)}
                className={`size-8 md:size-9 flex items-center justify-center rounded-full transition-colors ${studioOpen ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                title="MARS Forge — AI Study Tools"
              >
                <span className="material-symbols-outlined text-lg">auto_stories</span>
              </button>
          </div>
        </header>

        {/* Chat Area Section */}
        <div className="flex-1 relative flex overflow-hidden">
          <ChatPanel chat={chat} />

          {/* Studio Panel — responsive width */}
          {studioOpen && (
            <div className={`${isMobile ? 'absolute inset-0 z-30' : 'w-[360px]'} border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all overflow-y-auto`}>
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

      {/* Agent Workflow Overlay */}
      {workflowOpen && (
        <AgentWorkflow onClose={() => setWorkflowOpen(false)} />
      )}

      {/* Document Library Overlay */}
      {libraryOpen && (
        <DocumentManager 
          onClose={() => setLibraryOpen(false)} 
          onSelectDocument={(ns) => {
            setLibraryOpen(false);
            setViewerNamespace(ns);
          }}
        />
      )}

      {/* Full-Screen PDF Viewer */}
      {viewerNamespace && (
        <PdfViewer 
          namespace={viewerNamespace} 
          onClose={() => setViewerNamespace(null)} 
        />
      )}

    </div>
  );
}