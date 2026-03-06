const AGENT_META = {
  planner:        { label: 'Planner', icon: '🎯', color: '#f59e0b' },
  student_scout:  { label: 'Student Scout', icon: '📚', color: '#10b981' },
  research_scout: { label: 'Research Scout', icon: '🔬', color: '#10b981' },
  analyst:        { label: 'Analyst', icon: '💡', color: '#6366f1' },
  critic:         { label: 'Critic', icon: '⚖️', color: '#ef4444' },
  oracle:         { label: 'Oracle', icon: '✨', color: '#8b5cf6' },
  scribe:         { label: 'Scribe', icon: '📝', color: '#06b6d4' },
};

function parseAgentName(name = '') {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  return AGENT_META[key] || { label: name, icon: '🤖', color: '#64748b' };
}

export default function AgentTrace({ logs = [] }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="mt-2 p-3 rounded-xl border text-xs bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="material-symbols-outlined text-xs text-slate-400">bolt</span>
        <span className="font-semibold tracking-wide uppercase text-[10px] text-slate-400">
          Agent Execution Trace
        </span>
      </div>

      <div className="flex flex-col gap-0">
        {logs.map((log, i) => {
          const agentName = log.agent || '';
          const { label, icon, color } = parseAgentName(agentName);
          const isLast = i === logs.length - 1;

          return (
            <div key={i} className="flex gap-2.5">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0"
                  style={{ background: color + '22', border: `1px solid ${color}55` }}
                >
                  {icon}
                </div>
                {!isLast && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700" style={{ minHeight: 8, margin: '2px 0' }} />}
              </div>

              {/* Content */}
              <div className="pb-3 flex-1 min-w-0">
                <div className="font-semibold mb-0.5" style={{ color }}>{label}</div>
                {log.message && (
                  <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {log.message}
                  </div>
                )}
                {log.metadata && typeof log.metadata === 'object' && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(log.metadata).slice(0, 5).map(([k, v]) => (
                      typeof v === 'string' || typeof v === 'number' ? (
                        <span
                          key={k}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400"
                        >
                          {k}: <span className="text-slate-600 dark:text-slate-300">{String(v)}</span>
                        </span>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
