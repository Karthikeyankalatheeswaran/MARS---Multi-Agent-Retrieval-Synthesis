import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AgentTrace from './AgentTrace';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: 'var(--accent)' }}
      >M</div>
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-tl-sm"
        style={{ background: 'var(--bg-card)' }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end px-4 py-1.5 animate-fade-up">
      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm"
        style={{ background: 'var(--accent)', color: '#fff', lineHeight: 1.6 }}
      >
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({ content, metadata, agentLogs, isLatest }) {
  const [traceOpen, setTraceOpen] = useState(isLatest);
  const [sourceOpen, setSourceOpen] = useState(false);

  const groundingScore = metadata?.grounding_score;
  const criticStatus = metadata?.critic_status;
  const sources = metadata?.retrieved_sources || [];
  const papers = metadata?.papers_metadata || [];
  const elapsed = metadata?.elapsed_time;

  return (
    <div className="flex gap-2.5 px-4 py-1.5 animate-fade-up">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        style={{ background: 'var(--accent)' }}
      >M</div>

      <div className="flex-1 min-w-0">
        {/* Main response */}
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="prose prose-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
          {elapsed && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              ⏱ {elapsed.toFixed(1)}s
            </span>
          )}
          {groundingScore !== undefined && groundingScore !== null && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: groundingScore >= 0.7 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: groundingScore >= 0.7 ? '#10b981' : '#ef4444',
              }}
            >
              Grounding {(groundingScore * 100).toFixed(0)}%
            </span>
          )}
          {criticStatus && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: criticStatus === 'pass' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                color: criticStatus === 'pass' ? '#10b981' : '#f59e0b',
              }}
            >
              Critic {criticStatus === 'pass' ? '✓ Pass' : '⚠ Review'}
            </span>
          )}

          {/* Source citations */}
          {(sources.length > 0 || papers.length > 0) && (
            <button
              onClick={() => setSourceOpen(o => !o)}
              className="text-[10px] px-1.5 py-0.5 rounded-full transition-colors"
              style={{
                background: sourceOpen ? 'var(--accent-dim)' : 'rgba(255,255,255,0.05)',
                color: sourceOpen ? '#6b9fff' : 'var(--text-muted)',
              }}
            >
              {sourceOpen ? '▼' : '▶'} {sources.length + papers.length} source{sources.length + papers.length !== 1 ? 's' : ''}
            </button>
          )}

          {/* Agent trace toggle */}
          {agentLogs && agentLogs.length > 0 && (
            <button
              onClick={() => setTraceOpen(o => !o)}
              className="text-[10px] px-1.5 py-0.5 rounded-full transition-colors"
              style={{
                background: traceOpen ? 'var(--accent-dim)' : 'rgba(255,255,255,0.05)',
                color: traceOpen ? '#6b9fff' : 'var(--text-muted)',
              }}
            >
              {traceOpen ? '▼' : '▶'} Agent trace
            </button>
          )}
        </div>

        {/* Sources panel */}
        {sourceOpen && (sources.length > 0 || papers.length > 0) && (
          <div
            className="mt-2 p-3 rounded-xl border text-xs"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
          >
            {sources.slice(0, 4).map((src, i) => (
              <div key={i} className="mb-2 last:mb-0">
                <div className="font-medium mb-0.5" style={{ color: '#6b9fff' }}>
                  📄 {src.source || `Chunk ${i + 1}`}
                  {src.page && <span style={{ color: 'var(--text-muted)' }}> · Page {src.page}</span>}
                </div>
                <div style={{ color: 'var(--text-secondary)' }} className="line-clamp-2">{src.content}</div>
              </div>
            ))}
            {papers.slice(0, 3).map((p, i) => (
              <div key={`p-${i}`} className="mb-2 last:mb-0">
                <div className="font-medium mb-0.5" style={{ color: '#10b981' }}>
                  🔬 {p.title || `Paper ${i + 1}`}
                  {p.authors && <span style={{ color: 'var(--text-muted)' }}> · {p.authors}</span>}
                </div>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }} className="underline text-[10px]">
                    View paper →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Agent trace */}
        {traceOpen && agentLogs && agentLogs.length > 0 && (
          <AgentTrace logs={agentLogs} />
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ mode }) {
  const suggestions = mode === 'student'
    ? ['Summarize my document', 'What is the main argument?', 'Generate flashcards', 'Create a study guide']
    : ['Latest AI hardware trends', 'Quantum computing breakthroughs', 'LLM scaling laws research', 'Diffusion model advances'];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 animate-glow"
        style={{ background: 'var(--accent)' }}
      >
        {mode === 'student' ? '📚' : '🔬'}
      </div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {mode === 'student' ? 'Student Mode' : 'Research Mode'}
      </h2>
      <p className="text-sm max-w-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        {mode === 'student'
          ? 'Upload a PDF and ask anything about it. MARS will retrieve, analyze, and verify the answer.'
          : 'Ask any research question. MARS will search Arxiv, Tavily, and synthesize a verified answer.'}
      </p>
      <div className="grid grid-cols-2 gap-2 max-w-sm w-full">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="px-3 py-2.5 rounded-xl text-xs text-left transition-all hover:opacity-90"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ chat }) {
  const { messages, isLoading, mode, lastResponse, send } = chat;
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 ? (
          <WelcomeScreen mode={mode} />
        ) : (
          <>
            {messages.map((msg, i) => (
              msg.role === 'user'
                ? <UserMessage key={i} content={msg.content} />
                : <AssistantMessage
                    key={i}
                    content={msg.content}
                    metadata={msg.metadata}
                    agentLogs={i === messages.length - 1 ? lastResponse?.agent_logs : undefined}
                    isLatest={i === messages.length - 1}
                  />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-5 pt-3 border-t"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
      >
        {/* Mode indicator */}
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: mode === 'student' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
              color: mode === 'student' ? '#10b981' : '#6366f1',
            }}
          >
            {mode === 'student' ? '📚 Student Mode' : '🔬 Research Mode'}
          </div>
          {isLoading && (
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <div className="w-3 h-3 border-2 border-current rounded-full animate-spin border-t-transparent" />
              Agents working…
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          className="flex items-end gap-3 px-4 py-3 rounded-2xl border transition-all"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'student' ? 'Ask about your document…' : 'Ask a research question…'}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm outline-none placeholder:text-sm"
            style={{
              color: 'var(--text-primary)',
              minHeight: '24px',
              maxHeight: '180px',
              lineHeight: '1.6',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
            style={{
              background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--bg-tertiary)',
              opacity: input.trim() && !isLoading ? 1 : 0.5,
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          MARS uses multi-agent verification — responses are grounded in retrieved sources.
        </p>
      </div>
    </div>
  );
}
