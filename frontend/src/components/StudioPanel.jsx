import { useState } from 'react';
import { generateStudyCards } from '../api/client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function callStudio(endpoint, payload) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function StudioCard({ emoji, title, description, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all hover:opacity-90 active:scale-98"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span className="text-xl shrink-0">{emoji}</span>
      <div>
        <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</div>
        <div className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</div>
      </div>
    </button>
  );
}

export default function StudioPanel({ messages, uploadedFile, mode, lastResponse, onClose }) {
  const [result, setResult] = useState(null);
  const [resultTitle, setResultTitle] = useState('');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const context = lastAssistant?.content || '';
  const hasContent = !!context;

  const run = async (key, title, endpoint, payload) => {
    if (!hasContent && !uploadedFile) {
      setError('Start a conversation first to generate content.'); return;
    }
    setLoading(key); setError('');
    try {
      const data = await callStudio(endpoint, payload);
      setResultTitle(title);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      key: 'study_guide', emoji: '📖', title: 'Study Guide',
      description: 'Structure key concepts into a clear outline',
      action: () => run('study_guide', 'Study Guide', '/studio/study-guide/', { context }),
    },
    {
      key: 'briefing', emoji: '📋', title: 'Briefing Document',
      description: 'Executive summary of the retrieved content',
      action: () => run('briefing', 'Briefing Document', '/studio/briefing/', { context }),
    },
    {
      key: 'flashcards', emoji: '🃏', title: 'Flashcards',
      description: 'Auto-generate Q&A pairs for revision',
      action: () => run('flashcards', 'Flashcards', '/studio/flashcards/', { context }),
    },
    {
      key: 'key_topics', emoji: '🏷️', title: 'Key Topics',
      description: 'Extract the core topics from this session',
      action: () => run('key_topics', 'Key Topics', '/studio/key-topics/', { context }),
    },
    {
      key: 'audio', emoji: '🎧', title: 'Audio Overview',
      description: 'Listen to a spoken summary (HuggingFace TTS)',
      action: () => run('audio', 'Audio Overview', '/studio/audio/', { context }),
    },
  ];

  return (
    <div
      className="w-72 shrink-0 flex flex-col h-full border-l overflow-hidden animate-slide-right"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-dim)' }} >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Studio</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {!hasContent && !uploadedFile ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <span className="text-3xl mb-3">🧪</span>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Start a conversation to unlock Studio features like study guides, flashcards, and more.
            </p>
          </div>
        ) : (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
              Generate
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {actions.map(a => (
                <StudioCard
                  key={a.key}
                  emoji={a.emoji}
                  title={a.title}
                  description={a.description}
                  onClick={a.action}
                  loading={loading === a.key}
                />
              ))}
            </div>

            {error && (
              <div
                className="p-3 rounded-xl text-xs mb-3"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div
                className="p-3 rounded-xl border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{resultTitle}</div>
                  <button
                    onClick={() => setResult(null)}
                    className="text-[10px] hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Clear
                  </button>
                </div>

                {/* Flashcards rendering */}
                {result.flashcards && Array.isArray(result.flashcards) && (
                  <div className="flex flex-col gap-2">
                    {result.flashcards.map((fc, i) => (
                      <div key={i} className="p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="text-[11px] font-medium mb-1" style={{ color: '#6b9fff' }}>Q: {fc.question}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>A: {fc.answer}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* The rest: markdown or plain */}
                {result.content && (
                  <div className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {result.content}
                  </div>
                )}

                {/* Audio */}
                {result.audio_url && (
                  <audio controls className="w-full mt-2 rounded-lg" src={result.audio_url} />
                )}

                {/* Key topics */}
                {result.topics && Array.isArray(result.topics) && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: 'var(--accent-dim)', color: '#6b9fff', border: '1px solid var(--border-accent)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
