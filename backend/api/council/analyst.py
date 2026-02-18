import time
from api.core.state import MARSState, AgentLog
from api.core.llms import ANALYST_LLM


class AnalystAgent:
    def run(self, state: MARSState) -> MARSState:
        """Organizes retrieved content based on conversation context"""
        start = time.time()

        if not state.retrieved_sources:
            state.agent_logs.append(AgentLog(
                agent="Analyst", icon="assessment", status="skipped",
                duration_ms=int((time.time() - start) * 1000),
                thinking="No sources to analyze — retrieved_sources is empty",
                output_preview="Skipped: No content to refine",
            ))
            return state

        if state.intent in ["greeting", "feedback"]:
            return state

        context = "\n\n---\n\n".join(
            f"Source {i+1}:\n{s.content}"
            for i, s in enumerate(state.retrieved_sources)
        )

        recent_history = ""
        if len(state.chat_history) > 0:
            recent_history = "\n".join(
                f"{m.role.upper()}: {m.content}"
                for m in state.chat_history[-4:]
            )

        prompt = f"""
You are analyzing source material for a question-answering system.

Recent Conversation:
{recent_history if recent_history else "No prior conversation"}

Retrieved Sources:
{context}

Current Question:
{state.user_query}

Task:
Extract and organize the most relevant information that directly answers the question.
Preserve important details, definitions, examples, and context.
Do NOT add external knowledge.
Maximum 800 words.

Analysis:
"""

        try:
            response = ANALYST_LLM.invoke(prompt)
            state.refined_context = response.content.strip()[:6000]

            elapsed = int((time.time() - start) * 1000)
            state.agent_logs.append(AgentLog(
                agent="Analyst", icon="assessment", status="completed",
                duration_ms=elapsed,
                thinking=f"Analyzing {len(state.retrieved_sources)} sources for query: '{state.user_query[:80]}...'",
                output_preview=f"Refined context: {len(state.refined_context)} chars from {len(state.retrieved_sources)} sources ({elapsed}ms)",
                details={
                    "sources_count": len(state.retrieved_sources),
                    "refined_length": len(state.refined_context),
                    "context_preview": state.refined_context[:300] + "..."
                }
            ))
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            print(f"[Analyst Error] {e}")
            state.refined_context = context[:6000]
            state.agent_logs.append(AgentLog(
                agent="Analyst", icon="assessment", status="error",
                duration_ms=elapsed,
                thinking=f"LLM analysis failed: {str(e)}. Falling back to raw context.",
                output_preview=f"⚠️ Fallback: Using raw sources ({len(context[:6000])} chars)",
                details={"error": str(e)}
            ))

        return state
