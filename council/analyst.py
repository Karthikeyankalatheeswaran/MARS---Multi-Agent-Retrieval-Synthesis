from core.state import MARSState
from core.llms import ANALYST_LLM


class AnalystAgent:
    def run(self, state: MARSState) -> MARSState:
        """
        Organizes retrieved content based on conversation context
        """
        if not state.retrieved_sources:
            return state
        
        # Skip analysis for simple intents
        if state.intent in ["greeting", "feedback"]:
            return state
        
        # Concatenate retrieved sources
        context = "\n\n---\n\n".join(
            f"Source {i+1}:\n{s.content}"
            for i, s in enumerate(state.retrieved_sources)
        )
        
        # Get recent conversation
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
        except Exception as e:
            print(f"[Analyst Error] {e}")
            # Fallback: use raw sources
            state.refined_context = context[:6000]
        
        return state