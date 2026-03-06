import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

/* ────────────────────────────────────────────── */
/* Flashcard Component (NotebookLM-style flip)   */
/* ────────────────────────────────────────────── */
function FlashcardDeck({ flashcards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = flashcards[idx];

  const diffColors = {
    easy: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{idx + 1} / {flashcards.length}</span>
        {card.difficulty && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${diffColors[card.difficulty] || ''}`}>
            {card.difficulty}
          </span>
        )}
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 p-5 cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 flex flex-col justify-center bg-white dark:bg-slate-800/60"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {flipped ? '💡 Answer' : '❓ Question'}
        </p>
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          {flipped ? card.answer : card.question}
        </p>
      </div>
      <p className="text-[10px] text-center text-slate-400">Click card to flip</p>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }}
          disabled={idx === 0}
          className="flex-1 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => { setIdx(Math.min(flashcards.length - 1, idx + 1)); setFlipped(false); }}
          disabled={idx === flashcards.length - 1}
          className="flex-1 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/* FAQ Accordion Component                        */
/* ────────────────────────────────────────────── */
function FAQList({ faqs }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-primary text-sm font-bold shrink-0 mt-0.5">Q{i + 1}</span>
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{faq.question}</span>
            <span className={`material-symbols-outlined text-sm text-slate-400 shrink-0 ml-auto transition-transform ${openIdx === i ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          {openIdx === i && (
            <div className="px-3 pb-3 pt-0 ml-6">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────── */
/* Audio Player Component (NotebookLM-style)     */
/* ────────────────────────────────────────────── */
function AudioPlayer({ audioBase64, text, format }) {
  return (
    <div className="space-y-3">
      {audioBase64 && (
        <audio
          controls
          className="w-full rounded-lg"
          src={`data:${format || 'audio/flac'};base64,${audioBase64}`}
        />
      )}
      {text && (
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">📝 Transcript</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────── */
/* Studio Card Button                             */
/* ────────────────────────────────────────────── */
function StudioCard({ icon, title, description, onClick, loading, active }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all hover:border-primary/30 hover:shadow-sm active:scale-[0.98] ${
        active
          ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
      } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <span className="text-xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-semibold mb-0.5 text-slate-800 dark:text-slate-200">{title}</div>
        <div className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</div>
      </div>
      {loading && (
        <div className="w-4 h-4 border-2 rounded-full animate-spin border-t-transparent border-primary shrink-0 ml-auto mt-1" />
      )}
    </button>
  );
}

/* ────────────────────────────────────────────── */
/* Main Studio Panel                              */
/* ────────────────────────────────────────────── */
export default function StudioPanel({ messages, uploadedFile, mode, lastResponse, onClose }) {
  const [result, setResult] = useState(null);
  const [resultType, setResultType] = useState('');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const context = lastAssistant?.content || '';
  const hasContent = !!context;

  const run = async (key, endpoint, payload) => {
    if (!hasContent && !uploadedFile) {
      setError('Start a conversation first to generate content.'); return;
    }
    setLoading(key); setError(''); setResult(null);
    try {
      const data = await callStudio(endpoint, payload);
      setResultType(key);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      key: 'study_guide', icon: '📖', title: 'Study Guide',
      description: 'Structure key concepts into a clear outline',
      action: () => run('study_guide', '/studio/study-guide/', { context }),
    },
    {
      key: 'briefing', icon: '📋', title: 'Briefing Document',
      description: 'Executive summary with key takeaways',
      action: () => run('briefing', '/studio/briefing/', { context }),
    },
    {
      key: 'flashcards', icon: '🃏', title: 'Flashcards',
      description: 'Auto-generate Q&A cards for revision',
      action: () => run('flashcards', '/studio/flashcards/', { context }),
    },
    {
      key: 'faq', icon: '❓', title: 'FAQ',
      description: 'Generate frequently asked questions',
      action: () => run('faq', '/studio/faq/', { context }),
    },
    {
      key: 'key_topics', icon: '🏷️', title: 'Key Topics',
      description: 'Extract core topics and entities',
      action: () => run('key_topics', '/studio/key-topics/', { context }),
    },
    {
      key: 'audio', icon: '🎧', title: 'Audio Overview',
      description: 'Listen to a spoken summary',
      action: () => run('audio', '/studio/audio/', { context }),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">auto_stories</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">MARS Forge</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">AI Tools</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-sm text-slate-400">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        {!hasContent && !uploadedFile ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">science</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Start a conversation to unlock MARS Forge — generate study guides, flashcards, audio overviews, and more.
            </p>
          </div>
        ) : (
          <>
            {/* Source badge */}
            {uploadedFile && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 mb-3">
                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                <span className="text-[11px] font-medium text-green-600 dark:text-green-400 truncate">{uploadedFile.name}</span>
                <span className="text-[10px] text-green-500/60 ml-auto">{uploadedFile.chunks} chunks</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Generate
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {actions.map(a => (
                <StudioCard
                  key={a.key}
                  icon={a.icon}
                  title={a.title}
                  description={a.description}
                  onClick={a.action}
                  loading={loading === a.key}
                  active={resultType === a.key}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl text-xs mb-3 bg-red-500/10 text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {actions.find(a => a.key === resultType)?.title || 'Result'}
                  </span>
                  <button
                    onClick={() => { setResult(null); setResultType(''); }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>

                <div className="p-3">
                  {/* Flashcards (NotebookLM-style flip deck) */}
                  {result.flashcards && Array.isArray(result.flashcards) && (
                    <FlashcardDeck flashcards={result.flashcards} />
                  )}

                  {/* FAQ (accordion) */}
                  {result.faqs && Array.isArray(result.faqs) && (
                    <FAQList faqs={result.faqs} />
                  )}

                  {/* Markdown content (study guide, briefing) */}
                  {result.content && (
                    <div className="prose prose-xs max-w-none dark:prose-invert text-xs leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Audio Player */}
                  {(result.audio_base64 || result.text) && resultType === 'audio' && (
                    <AudioPlayer audioBase64={result.audio_base64} text={result.text} format={result.format} />
                  )}

                  {/* Key topics */}
                  {result.topics && Array.isArray(result.topics) && (
                    <div className="space-y-2">
                      {result.main_topic && (
                        <div className="text-xs font-bold text-primary mb-1">{result.main_topic}</div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {result.topics.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {result.entities && result.entities.length > 0 && (
                        <>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-3 mb-1">Entities</div>
                          <div className="flex flex-wrap gap-1.5">
                            {result.entities.map((e, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
