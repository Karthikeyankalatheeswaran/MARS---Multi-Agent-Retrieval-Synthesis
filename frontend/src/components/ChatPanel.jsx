import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AgentTrace from './AgentTrace';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--accent-blue)', color: 'white' }}>M</div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#64748b] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#64748b] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#64748b] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end px-4 py-3">
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm"
        style={{ background: 'var(--bg-card)', color: '#f8fafc', border: '1px solid var(--border-card)', lineHeight: 1.6 }}
      >
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({ content, metadata, agentLogs, isLatest }) {
  const [traceOpen, setTraceOpen] = useState(isLatest);

  return (
    <div className="flex gap-4 px-4 py-2 mb-2 animate-slide-up max-w-[90%]">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-1" style={{ background: 'var(--accent-blue)', color: 'white' }}>
        M
      </div>

      <div className="flex-1 min-w-0">
        <div className="prose text-sm" style={{ color: 'var(--text-primary)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {/* Action icons row (like copying, tracing, etc) */}
        <div className="flex items-center gap-3 mt-4">
           {agentLogs && agentLogs.length > 0 && (
            <button
              onClick={() => setTraceOpen(o => !o)}
              className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-colors"
              style={{
                borderColor: traceOpen ? 'var(--accent-blue)' : 'var(--border-color)',
                color: traceOpen ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: traceOpen ? 'var(--accent-dim)' : 'transparent'
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Agent Trace
            </button>
          )}
          {metadata?.retrieved_sources && metadata.retrieved_sources.length > 0 && (
            <div className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {metadata.retrieved_sources.length} Sources
            </div>
          )}
        </div>

        {/* Agent trace panel */}
        {traceOpen && agentLogs && agentLogs.length > 0 && (
          <div className="mt-4">
             <AgentTrace logs={agentLogs} />
          </div>
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ mode, onSuggestionClick }) {
  const cards = [
    {
      icon: '📄',
      title: 'Summarize Paper',
      desc: 'Upload a PDF and I\'ll extract key findings and methodology.',
      action: 'Summarize the uploaded document'
    },
    {
      icon: '💡',
      title: 'Concept Deep-dive',
      desc: 'Explain the Heisenberg Uncertainty Principle like I\'m five.',
      action: 'Explain the Heisenberg Uncertainty Principle like I\'m five'
    },
    {
      icon: '📝',
      title: 'Draft Outline',
      desc: 'Create a 5-paragraph structure for my ethics in AI essay.',
      action: 'Create a 5-paragraph structure for my ethics in AI essay'
    },
    {
      icon: '🧠',
      title: 'Critical Analysis',
      desc: 'Analyze the socioeconomic impact of the Industrial Revolution.',
      action: 'Analyze the socioeconomic impact of the Industrial Revolution'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 pb-10 w-full max-w-4xl mx-auto animate-slide-up">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--bg-card)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-blue)' }}>
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-3 text-center tracking-tight">
        How can I assist your learning <span style={{ color: 'var(--accent-blue)' }}>today?</span>
      </h1>
      
      <p className="text-sm text-center max-w-lg mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Toggle to <span style={{ color: 'var(--accent-blue)' }}>Research Mode</span> for deep citation support, or<br/>
        stay in <span style={{ color: 'var(--accent-blue)' }}>Student Mode</span> for simplified explanations.
      </p>

      <div className="grid w-full gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {cards.map((c, i) => (
          <button key={i} onClick={() => onSuggestionClick(c.action)} className="suggestion-card">
            <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--accent-dim)', color: 'var(--accent-blue)' }}>
              {c.icon}
            </div>
            <div>
              <div className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{c.title}</div>
              <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ chat }) {
  const { messages, isLoading, mode, lastResponse, send, upload, isUploading, uploadedFile } = chat;
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput('');
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSend(); 
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await upload(file);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full relative max-w-5xl mx-auto w-full">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-6 px-4 md:px-8 pb-4" style={{ scrollbarWidth: 'none' }}>
        {messages.length === 0 ? (
          <WelcomeScreen mode={mode} onSuggestionClick={(text) => { setInput(text); }} />
        ) : (
          <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
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
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Bar Fixed Near Bottom */}
      <div className="shrink-0 w-full p-4 md:px-8 bg-transparent pt-4 pb-6 mt-auto">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex flex-col relative rounded-2xl overflow-hidden transition-all shadow-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            
            {/* If Student Mode has a file */}
            {mode === 'student' && uploadedFile && (
               <div className="flex items-center gap-2 px-4 py-2 border-b text-[11px]" style={{ borderColor: 'var(--border-color)', color: '#10b981' }}>
                 <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                   <path d="M5 13l4 4L19 7" />
                 </svg>
                 {uploadedFile.name} attached
               </div>
            )}
            
            <div className="flex items-center gap-2 px-3 py-3">
              {/* Attach Dropdown / Button */}
              {mode === 'student' && (
                <>
                  <button 
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading || isLoading}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-50"
                    title="Upload PDF Document"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 rounded-full animate-spin border-t-transparent" style={{ borderColor: 'var(--text-secondary)' }} />
                    ) : (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                        <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                </>
              )}

              {/* Text Area */}
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Type your request or upload a document..."
                className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1 placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
              />

              {/* Mic Icon (Visual only) */}
              <button className="p-2 rounded-lg transition-colors hover:bg-white/5 hidden sm:block">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                  <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                style={{ background: 'var(--accent-blue)', color: 'white' }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-center mt-3 text-[9px] font-bold tracking-widest uppercase" style={{ color: mode === 'student' ? '#10b981' : '#6366f1' }}>
            <span style={{ color: 'var(--text-muted)' }}>• MARS IS IN</span> {mode} MODE <span style={{ color: 'var(--text-muted)' }}>- POWERED BY ADVANCED LLM</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
