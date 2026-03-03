import { useState, useRef } from 'react';

// Sidebar Icons
const SearchIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="opacity-50">
    <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103 10.5a7.5 7.5 0 0013.65 6.15z" />
  </svg>
);

const ChatBubbleIcon = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? '' : 'opacity-70'}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </svg>
);

const FolderIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="opacity-70">
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="opacity-70">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="opacity-70">
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function Sidebar({ open, onClose, mode, onModeChange, onClear, messages, isMobile }) {
  const sessionSummary = messages.length > 0 
    ? messages[0]?.content?.slice(0, 30) + '...' 
    : 'New Conversation';

  return (
    <aside
      className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
      style={{
        width: open ? (isMobile ? '280px' : '260px') : '0px',
        position: isMobile ? 'fixed' : 'relative',
        height: '100%',
        zIndex: isMobile ? 30 : 'auto',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div className="flex flex-col h-full min-w-[260px] text-white">
        
        {/* Header / Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg" style={{ background: 'var(--accent-blue)', color: 'white' }}>
            M
          </div>
          <span className="font-bold text-lg tracking-wide">MARS</span>
          {isMobile && (
            <button onClick={onClose} className="ml-auto p-2 opacity-50 hover:opacity-100">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-4">
          <button
            onClick={onClear}
            className="w-full flex items-center gap-2 justify-center py-2.5 rounded-lg font-medium transition-all hover:bg-opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--accent-blue)', color: 'white' }}
          >
            <span className="text-xl leading-none font-light mb-0.5">+</span>
            <span>New Research Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-[#64748b] text-white" 
            />
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto px-4" style={{ scrollbarWidth: 'none' }}>
          <div className="text-[10px] font-bold tracking-widest uppercase mb-3 px-1 text-[#64748b]">
            HISTORY
          </div>
          
          <div className="flex flex-col gap-1">
            {/* Current Session */}
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors" style={{ background: 'var(--accent-dim)', color: 'var(--accent-blue)' }}>
              <ChatBubbleIcon active={true} />
              <span className="truncate font-medium">{sessionSummary}</span>
            </button>
            
            {/* Placeholder previous sessions to match screenshot visually */}
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94a3b8] hover:bg-white/5 transition-colors">
              <FolderIcon />
              <span className="truncate">Data Structures Lab</span>
            </button>

            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94a3b8] hover:bg-white/5 transition-colors">
              <HistoryIcon />
              <span className="truncate">Literature Review</span>
            </button>
          </div>
        </div>

        {/* Footer Settings & Profile */}
        <div className="px-4 pb-4 mt-auto">
          <button className="flex items-center gap-3 px-2 py-3 w-full text-sm text-[#94a3b8] hover:text-white transition-colors">
            <SettingsIcon />
            <span>Settings</span>
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl mt-2 w-full text-left" style={{ background: 'var(--bg-card)' }}>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f8fafc" alt="Alex" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">Alex Rivers</span>
              <span className="text-[10px] text-[#94a3b8] truncate">Premium Scholar</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}