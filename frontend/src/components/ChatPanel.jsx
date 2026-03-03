import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AgentTrace from './AgentTrace';

function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-2 mb-2 animate-pulse-slow max-w-[90%]">
      <div className="w-8 h-8 rounded-custom bg-primary flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20">
        <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
      </div>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end gap-4 px-4 py-2">
      <div className="max-w-[80%] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tr-none p-4 shadow-sm">
        <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-100">
          {content}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
        AR
      </div>
    </div>
  );
}

function AssistantMessage({ content, metadata, agentLogs, isLatest }) {
  const [traceOpen, setTraceOpen] = useState(isLatest);

  return (
    <div className="flex gap-4 px-4 py-2 mb-4 animate-slide-up w-full">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-custom bg-primary flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20 mt-1">
        <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Agent Workflow Section (if logs exist) */}
        {traceOpen && agentLogs && agentLogs.length > 0 && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-hidden">
             <AgentTrace logs={agentLogs} />
          </div>
        )}

        {/* AI Response Content */}
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-6 shadow-md">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>

          <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button className="text-slate-400 hover:text-primary flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-base">content_copy</span>
              <span className="text-xs font-medium">Copy</span>
            </button>
            <button className="text-slate-400 hover:text-green-500 flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-base">format_quote</span>
              <span className="text-xs font-medium">Cite</span>
            </button>
            <div className="flex-1"></div>
            <button 
              onClick={() => setTraceOpen(!traceOpen)}
              className={`text-slate-400 hover:text-primary transition-colors flex items-center gap-1 ${traceOpen ? 'text-primary' : ''}`}
            >
              <span className="material-symbols-outlined text-base">analytics</span>
              <span className="text-xs font-medium">Trace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ mode, onSuggestionClick }) {
  const cards = [
    {
      icon: 'description',
      title: 'Summarize Paper',
      desc: 'Upload a PDF and I\'ll extract key findings and methodology.',
      action: 'Summarize the uploaded document'
    },
    {
      icon: 'lightbulb',
      title: 'Concept Deep-dive',
      desc: 'Explain the Heisenberg Uncertainty Principle like I\'m five.',
      action: 'Explain the Heisenberg Uncertainty Principle like I\'m five'
    },
    {
      icon: 'draw',
      title: 'Draft Outline',
      desc: 'Create a 5-paragraph structure for my ethics in AI essay.',
      action: 'Create a 5-paragraph structure for my ethics in AI essay'
    },
    {
      icon: 'psychology',
      title: 'Critical Analysis',
      desc: 'Analyze the socioeconomic impact of the Industrial Revolution.',
      action: 'Analyze the socioeconomic impact of the Industrial Revolution'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full pb-32 pt-12 animate-slide-up">
      <div className="mb-8 p-6 rounded-3xl bg-primary/5 dark:bg-primary/20 border border-primary/10">
        <span className="material-symbols-outlined text-5xl text-primary leading-none">auto_awesome</span>
      </div>
      
      <h2 className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary to-blue-500 dark:from-white dark:via-blue-400 dark:to-primary">
          How can I assist your learning today?
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-md">
          Toggle to <span className="text-primary font-semibold">Research Mode</span> for deep citation support, or stay in <span className="text-primary font-semibold">Student Mode</span> for simplified explanations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {cards.map((c, i) => (
          <div 
            key={i} 
            onClick={() => onSuggestionClick(c.action)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">{c.icon}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors dark:text-slate-200">{c.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.desc}</p>
              </div>
            </div>
          </div>
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
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  return (
    <div className="flex-1 flex flex-col relative bg-bglight dark:bg-bgdark overflow-hidden">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 ? (
            <WelcomeScreen mode={mode} onSuggestionClick={(text) => { setInput(text); }} />
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
              <div ref={bottomRef} className="h-4" />
            </>
          )}
          <div className="h-32" /> {/* Spacer for floating input */}
        </div>
      </div>

      {/* Floating Input Bar AREA */}
      <div className="fixed bottom-0 left-0 md:left-72 right-0 p-6 bg-gradient-to-t from-bglight dark:from-bgdark via-bglight/90 dark:via-bgdark/90 to-transparent pointer-events-none z-20">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-primary rounded-xl opacity-10 group-focus-within:opacity-20 transition-opacity blur-sm"></div>
            
            <div className="relative glass-panel bg-white/70 dark:bg-slate-800/70 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 p-2 flex items-end gap-2 group focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              
              <button 
                onClick={() => fileRef.current?.click()}
                disabled={isUploading || isLoading}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 rounded-full animate-spin border-t-transparent border-primary" />
                ) : (
                  <span className="material-symbols-outlined">attach_file</span>
                )}
              </button>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

              <textarea 
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows="1"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none py-3 px-2 max-h-48 scrollbar-hide text-sm" 
                placeholder={mode === 'research' ? "Ask MARS anything for deep research..." : "Ask your document anything..."}
              />

              <div className="flex items-center gap-1">
                <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center mt-3">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                MARS is in {mode} Mode • Powered by Advanced LLM
                {uploadedFile && <span className="ml-2 text-primary">• {uploadedFile.name}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
    </div>
  );
}
