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
        U
      </div>
    </div>
  );
}

function AssistantMessage({ content, metadata, agentLogs, isLatest }) {
  const [traceOpen, setTraceOpen] = useState(isLatest);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-4 px-4 py-2 mb-4 animate-slide-up w-full">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-custom bg-primary flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/20 mt-1">
        <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Agent Workflow Section */}
        {traceOpen && agentLogs && agentLogs.length > 0 && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-hidden">
             <AgentTrace logs={agentLogs} />
          </div>
        )}

        {/* Grounding Score Badge (Student Mode) */}
        {metadata?.grounding_score && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2 ${
            metadata.grounding_score >= 80 
              ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
              : metadata.grounding_score >= 70 
                ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                : 'bg-red-500/10 text-red-600 border border-red-500/20'
          }`}>
            <span className="material-symbols-outlined text-xs">verified</span>
            {metadata.grounding_score}% Grounded
            {metadata.critic_status && (
              <span className="ml-1 opacity-60">• {metadata.critic_status}</span>
            )}
          </div>
        )}

        {/* AI Response Content */}
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-6 shadow-md">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>

          <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={handleCopy} className="text-slate-400 hover:text-primary flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-base">{copied ? 'check' : 'content_copy'}</span>
              <span className="text-xs font-medium">{copied ? 'Copied!' : 'Copy'}</span>
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
  const studentCards = [
    {
      icon: 'description',
      title: 'Summarize Paper',
      desc: 'Upload a PDF and I\'ll extract key findings and methodology.',
      action: 'Summarize the uploaded document'
    },
    {
      icon: 'lightbulb',
      title: 'Concept Deep-dive',
      desc: 'Explain complex concepts in simple terms.',
      action: 'Explain the key concepts from my document'
    },
    {
      icon: 'quiz',
      title: '🔮 Exam Oracle',
      desc: 'Predict exam questions for a subject code (e.g., CS3401).',
      action: 'Predict exam questions for CS3401'
    },
    {
      icon: 'psychology',
      title: 'Critical Analysis',
      desc: 'Analyze arguments, theories, and supporting evidence.',
      action: 'Analyze the main arguments in my document'
    }
  ];

  const researchCards = [
    {
      icon: 'science',
      title: 'Literature Survey',
      desc: 'Search arXiv, Google Scholar and web for recent papers.',
      action: 'Survey recent research on transformer architectures'
    },
    {
      icon: 'compare_arrows',
      title: 'Compare Methods',
      desc: 'Compare approaches across multiple research papers.',
      action: 'Compare state of the art methods in NLP'
    },
    {
      icon: 'trending_up',
      title: 'Recent Advances',
      desc: 'Discover the latest breakthroughs in a field.',
      action: 'What are the recent advances in reinforcement learning?'
    },
    {
      icon: 'draw',
      title: 'Draft Outline',
      desc: 'Create a structured outline for a research paper.',
      action: 'Create a research paper outline on machine learning in healthcare'
    }
  ];

  const cards = mode === 'student' ? studentCards : researchCards;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full pb-32 pt-12 animate-slide-up">
      <div className="mb-8 p-6 rounded-3xl bg-primary/5 dark:bg-primary/20 border border-primary/10">
        <span className="material-symbols-outlined text-5xl text-primary leading-none">auto_awesome</span>
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary to-blue-500 dark:from-white dark:via-blue-400 dark:to-primary">
          {mode === 'student' ? 'How can I assist your learning today?' : 'What would you like to research?'}
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-md text-sm">
          {mode === 'student' 
            ? <>Upload a PDF, then ask questions. Try the <span className="text-primary font-semibold">Exam Oracle</span> for predictions!</>
            : <>Search across <span className="text-primary font-semibold">arXiv</span>, <span className="text-primary font-semibold">Google Scholar</span>, and the <span className="text-primary font-semibold">web</span>.</>
          }
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
      
      {/* Upload Success Banner */}
      {uploadedFile && (
        <div className="mx-4 mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 animate-slide-up">
          <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
          <span className="text-xs font-medium text-green-600 dark:text-green-400 truncate">
            {uploadedFile.name}
          </span>
          <span className="text-[10px] text-green-500/60 ml-auto shrink-0">
            {uploadedFile.pages} pages • {uploadedFile.chunks} chunks
          </span>
        </div>
      )}

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

      {/* Floating Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-bglight dark:from-bgdark via-bglight/90 dark:via-bgdark/90 to-transparent pointer-events-none z-20">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="relative group">
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-primary rounded-xl opacity-10 group-focus-within:opacity-20 transition-opacity blur-sm"></div>
            
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              
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
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={handleFileChange} />

              <textarea 
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows="1"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none py-3 px-2 max-h-48 scrollbar-hide text-sm" 
                placeholder={mode === 'research' ? "Ask MARS for deep research across arXiv, Scholar & web..." : "Ask your document anything..."}
              />

              <div className="flex items-center gap-1">
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
                {mode === 'student' ? 'Student' : 'Research'} Mode • Gemini Flash
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
