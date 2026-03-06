import { useState, useEffect, useRef } from 'react';

/*
 * AgentWorkflow — An animated, interactive diagram showing the MARS
 * multi-agent pipeline and project details. Opens as a full-screen overlay.
 */

const AGENTS = [
  { id: 'planner',  label: 'Planner',      icon: '🎯', color: '#f59e0b', desc: 'Detects intent & routes your query to the right pipeline' },
  { id: 'scout',    label: 'Scout',         icon: '🔍', color: '#10b981', desc: 'Retrieves documents from FAISS (Student) or arXiv/Scholar/Web (Research)' },
  { id: 'analyst',  label: 'Analyst',       icon: '💡', color: '#6366f1', desc: 'Refines & organizes retrieved context, preserving page citations' },
  { id: 'scribe',   label: 'Scribe',        icon: '📝', color: '#06b6d4', desc: 'Generates the final structured answer with inline citations' },
  { id: 'critic',   label: 'Critic',        icon: '⚖️', color: '#ef4444', desc: 'Validates grounding — rejects hallucinated answers below 70%' },
];

const FEATURES = [
  { icon: '📄', title: 'FAISS Vector Store', desc: 'Offline, local document embeddings with 48hr auto-purge' },
  { icon: '🧠', title: 'Gemini Flash LLM', desc: 'Sub-second inference via OpenRouter for all agents' },
  { icon: '🔬', title: 'Multi-Source Research', desc: 'arXiv + Google Scholar + Web search in parallel' },
  { icon: '🎧', title: 'Audio Overview', desc: 'Text-to-speech via HuggingFace models' },
  { icon: '🃏', title: 'Smart Flashcards', desc: 'Difficulty-graded Q&A with flip animation' },
  { icon: '🔮', title: 'Exam Oracle', desc: 'Predicts exam questions from subject codes' },
];

function AgentNode({ agent, index, active, onClick }) {
  const delay = index * 150;

  return (
    <div
      onClick={() => onClick(agent)}
      className="group cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`
        relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
        ${active ? 'border-transparent shadow-xl scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-primary/30'}
        bg-white dark:bg-slate-800/60 hover:shadow-lg
      `}
        style={active ? { borderColor: agent.color, boxShadow: `0 4px 20px ${agent.color}30` } : {}}
      >
        {/* Animated pulse ring */}
        {active && (
          <div className="absolute -inset-px rounded-2xl animate-pulse opacity-20"
            style={{ border: `2px solid ${agent.color}` }} />
        )}

        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{agent.label}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{agent.desc}</div>
        </div>
        <span className="material-symbols-outlined text-lg text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors">
          chevron_right
        </span>
      </div>

      {/* Connector Line */}
      {index < AGENTS.length - 1 && (
        <div className="flex justify-center py-1">
          <div className="w-px h-6 bg-gradient-to-b from-slate-300 dark:from-slate-600 to-transparent relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-ping" 
              style={{ animationDelay: `${delay + 300}ms`, animationDuration: '2s' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentWorkflow({ onClose }) {
  const [activeAgent, setActiveAgent] = useState(null);
  const [animating, setAnimating] = useState(true);
  const [step, setStep] = useState(0);
  const containerRef = useRef(null);

  // Auto-animate through agents on mount
  useEffect(() => {
    if (!animating) return;
    const timer = setInterval(() => {
      setStep(prev => {
        if (prev >= AGENTS.length - 1) {
          setAnimating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [animating]);

  useEffect(() => {
    if (animating) setActiveAgent(AGENTS[step]);
  }, [step, animating]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div ref={containerRef} className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 scrollbar-hide">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">hub</span>
              MARS Agent Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multi-Agent Retrieval-Augmented System</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Agent Pipeline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">account_tree</span>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Agent Pipeline</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 ml-2" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-lg">
              Every query flows through this 5-agent pipeline. Click any agent to learn more.
            </p>

            <div className="space-y-0">
              {AGENTS.map((agent, i) => (
                <AgentNode
                  key={agent.id}
                  agent={agent}
                  index={i}
                  active={activeAgent?.id === agent.id}
                  onClick={(a) => { setAnimating(false); setActiveAgent(a); }}
                />
              ))}
            </div>
          </div>

          {/* Capabilities Grid */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">apps</span>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Core Capabilities</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 ml-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FEATURES.map((feat, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-primary/30 transition-all group">
                  <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{feat.icon}</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">{feat.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">code</span>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Tech Stack</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 ml-2" />
            </div>

            <div className="flex flex-wrap gap-2">
              {['React', 'Vite', 'Django', 'LangGraph', 'FAISS', 'Gemini Flash', 'HuggingFace', 'Tailwind CSS', 'arXiv API', 'Google Scholar', 'Tavily Search'].map((tech, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary transition-all cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              MARS v3.0 • Multi-Agent Retrieval-Augmented System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
