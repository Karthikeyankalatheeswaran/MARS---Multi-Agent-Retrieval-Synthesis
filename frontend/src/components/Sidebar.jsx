import { useState, useRef } from 'react';

const AGENTS = [
  { id: 'planner', label: 'Planner', icon: '🎯', color: '#f59e0b' },
  { id: 'student_scout', label: 'Student Scout', icon: '📚', color: '#10b981' },
  { id: 'research_scout', label: 'Research Scout', icon: '🔬', color: '#10b981' },
  { id: 'analyst', label: 'Analyst', icon: '💡', color: '#6366f1' },
  { id: 'critic', label: 'Critic', icon: '⚖️', color: '#ef4444' },
  { id: 'oracle', label: 'Oracle', icon: '✨', color: '#8b5cf6' },
  { id: 'scribe', label: 'Scribe', icon: '📝', color: '#06b6d4' },
];

export default function Sidebar({
  open, onClose, mode, onModeChange, uploadedFile,
  isUploading, onUpload, onClear, serverOnline, messages, isMobile
}) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      return;
    }
    setUploadError('');
    try { await onUpload(file); } catch (e) {
      setUploadError(e?.response?.data?.error || 'Upload failed.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const sessionSummary = messages.length > 0
    ? messages[0]?.content?.slice(0, 45) + '...'
    : null;

  return (
    <>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 border-r transition-all duration-300 overflow-hidden"
        style={{
          width: open ? (isMobile ? '280px' : '260px') : '0px',
          position: isMobile ? 'fixed' : 'relative',
          height: '100%',
          zIndex: isMobile ? 30 : 'auto',
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-col h-full min-w-[260px]">
          {/* Logo + close */}
          <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold animate-glow"
                style={{ background: 'var(--accent)' }}
              >M</div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>MARS</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Multi-Agent RAG</div>
              </div>
            </div>
            {isMobile && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* New chat button */}
          <div className="px-3 pt-4 pb-2">
            <button
              onClick={onClear}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-98"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Session
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="px-3 pb-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Mode</div>
            <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              {[
                { id: 'student', label: 'Student', icon: '📚' },
                { id: 'research', label: 'Research', icon: '🔬' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: mode === m.id ? 'var(--accent)' : 'transparent',
                    color: mode === m.id ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload (Student Mode) */}
          {mode === 'student' && (
            <div className="px-3 pb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Document</div>

              {uploadedFile ? (
                <div
                  className="p-3 rounded-xl border"
                  style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.25)' }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: '#10b981' }}>{uploadedFile.name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {uploadedFile.pages} pages · {uploadedFile.chunks} chunks
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2 text-center text-[10px] py-1 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Replace document
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed cursor-pointer transition-all"
                  style={{
                    borderColor: dragging ? 'var(--accent)' : 'var(--border)',
                    background: dragging ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                  }}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Processing PDF…</span>
                    </>
                  ) : (
                    <>
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-center">
                        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Drop PDF or click</div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Auto-cleared after 48 hrs</div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-[10px] mt-1.5 px-1" style={{ color: '#ef4444' }}>{uploadError}</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Agent Pipeline */}
          <div className="px-3 pb-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Agent Pipeline</div>
            <div className="flex flex-col gap-1" style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '8px' }}>
              {AGENTS.filter(a =>
                mode === 'student'
                  ? !['research_scout'].includes(a.id)
                  : !['student_scout'].includes(a.id)
              ).map((agent, i, arr) => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
                      style={{ background: agent.color + '22', border: `1px solid ${agent.color}44` }}
                    >
                      {agent.icon}
                    </div>
                    {i < arr.length - 1 && <div style={{ width: 1, height: 8, background: 'var(--border)', marginTop: 2 }} />}
                  </div>
                  <span className="text-[11px]" style={{ color: agent.color }}>{agent.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session history preview */}
          {sessionSummary && (
            <div className="px-3 pb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Current Session</div>
              <div
                className="px-3 py-2 rounded-xl text-xs cursor-pointer hover:bg-white/5 transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                💬 {sessionSummary}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto px-4 pb-4">
            <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
              MARS v2.0 · Multi-Agent RAG System
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}