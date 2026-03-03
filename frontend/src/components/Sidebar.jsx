import React from 'react';

export default function Sidebar({ open, onClose, mode, onModeChange, onClear, messages, isMobile }) {
  const currentChat = messages.length > 0 
    ? messages[0]?.content?.slice(0, 30) + (messages[0]?.content?.length > 30 ? '...' : '')
    : 'New Conversation';

  return (
    <>
      <aside 
        className={`w-72 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 transform transition-transform duration-300 ease-in-out fixed md:relative z-30 h-full ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0'}`}
      >
        <div className="p-4 flex-1">
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
            <span className="font-medium text-sm">New Research Chat</span>
          </button>

          {/* Search */}
          <div className="relative mb-6">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 outline-none transition-all" 
              placeholder="Search conversations..." 
              type="text"
            />
          </div>

          {/* History Sections */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">History</p>
            
            {/* Active Session */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg sidebar-item-active group cursor-pointer">
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              <span className="text-sm font-medium truncate">{currentChat}</span>
            </div>

            {/* Static Examples from Stitch Screen */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 group cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-lg">folder</span>
              <span className="text-sm font-medium truncate">Data Structures Lab</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 group cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-lg">history</span>
              <span className="text-sm font-medium truncate">Literature Review</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-200 dark:border-slate-800 p-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 cursor-pointer group hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white overflow-hidden shadow-sm">
              <img 
                className="w-full h-full object-cover" 
                alt="User profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSuK5rJPxsej0aP76QMmQJ1A9pYUBluDWhCocvoZxlgHXt6-3ScEuOprkMxeGkFiqWj-6aad90LOn3Vr4YL3Jocnea-alvMQDVxgUxOYjPYqkOlOr4Nv1lOBwrp7Sh6-eysnP-1lGwva-_iIS39_xi7PO9Y2B8rivvJGikGYM7YWATicy3jHZyfROZQ7E96h4emxOOWgSYKCcLseHcc5LYt-jbVvNHpbftHIoVSnAvhSCwY5yAuMSePsDqA_OExmD7tr1XlmUVy7WE" 
              />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Alex Rivers</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Premium Scholar</p>
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