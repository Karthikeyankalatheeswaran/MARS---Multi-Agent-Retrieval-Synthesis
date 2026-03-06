import React from 'react';

export default function Sidebar({ open, onClose, mode, onModeChange, onClear, messages, isMobile, chatHistory = [], onSelectChat }) {
  const currentChat = messages.length > 0 
    ? messages[0]?.content?.slice(0, 35) + (messages[0]?.content?.length > 35 ? '...' : '')
    : null;

  return (
    <>
      <aside 
        className={`w-72 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-bgdark/50 transform transition-transform duration-300 ease-in-out fixed md:relative z-30 h-full ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0'}`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">storm</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">MARS</h1>
            {isMobile && (
              <button onClick={onClose} className="ml-auto md:hidden text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* New Chat Button */}
          <button 
            onClick={onClear}
            className="w-full flex items-center gap-3 bg-primary hover:bg-primary/90 text-white rounded-xl py-3 px-4 transition-all shadow-lg shadow-primary/20 mb-6"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="font-medium text-sm">New Chat</span>
          </button>

          {/* Chat History Stack */}
          <div className="space-y-1">
            {/* Today */}
            {currentChat && (
              <>
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Today</p>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 group cursor-pointer">
                  <span className="material-symbols-outlined text-primary text-lg">chat_bubble</span>
                  <span className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">{currentChat}</span>
                </div>
              </>
            )}
            
            {/* Previous Chats from History */}
            {chatHistory.length > 0 && (
              <>
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Previous</p>
                {chatHistory.map((chat, i) => (
                  <div 
                    key={i}
                    onClick={() => onSelectChat && onSelectChat(chat)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 group cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg opacity-60">history</span>
                    <span className="text-sm font-medium truncate">{chat.title || chat.preview}</span>
                  </div>
                ))}
              </>
            )}

            {/* Empty state */}
            {!currentChat && chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center px-4 py-12">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">forum</span>
                <p className="text-xs text-slate-400 dark:text-slate-500">No conversations yet</p>
                <p className="text-[10px] text-slate-400/60">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer — Mode indicator only, no fake profile */}
        <div className="mt-auto border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className={`w-2 h-2 rounded-full ${mode === 'student' ? 'bg-green-500' : 'bg-blue-500'}`} />
            <div className="flex flex-col">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {mode === 'student' ? '📚 Student Mode' : '🔬 Research Mode'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {mode === 'student' ? 'Document-grounded answers' : 'Multi-source research'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}