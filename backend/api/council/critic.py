import json
import time
from api.core.state import MARSState, AgentLog
from api.core.llms import CRITIC_LLM


class CriticAgent:
    def run(self, state: MARSState) -> MARSState:
        """Validates grounding for student mode answers — rejects hallucination"""
        start = time.time()

        if state.mode == "research":
            state.critic_status = "approved"
            state.critic_reason = "Research mode allows synthesis"
            state.grounding_score = None
            state.agent_logs.append(AgentLog(
                agent="Critic", icon="gavel", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking="Research mode — skipping grounding check (synthesis is expected)",
                output_preview="Auto-approved: Research mode",
            ))
            return state

        if state.intent in ["greeting", "feedback"]:
            state.critic_status = "approved"
            state.grounding_score = 100.0
            state.agent_logs.append(AgentLog(
                agent="Critic", icon="gavel", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking="Greeting/feedback — auto-approved",
                output_preview="Auto-approved: 100% grounding",
            ))
            return state

        if not state.draft_answer or "not found in material" in state.draft_answer.lower():
            state.critic_status = "approved"
            state.critic_reason = "Correct fallback response"
            state.grounding_score = 100.0
            state.agent_logs.append(AgentLog(
                agent="Critic", icon="gavel", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking="Fallback response detected — auto-approved",
                output_preview="Auto-approved: Correct fallback",
            ))
            return state

        prompt = f"""You are validating if an AI-generated answer is grounded in textbook content.

Textbook Content:
{state.refined_context[:3000]}

AI-Generated Answer:
{state.draft_answer[:2000]}

Evaluate:
1. Is the answer supported by the textbook? (yes/no)
2. Grounding percentage (0-100): How much of the answer comes from the textbook?
3. Brief reason (one sentence)

Respond ONLY with valid JSON:
{{"status": "approved" or "rejected", "grounding": number, "reason": "brief reason"}}"""

        try:
            response = CRITIC_LLM.invoke(prompt).content

            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
            else:
                result = json.loads(response)

            state.critic_status = result.get("status", "approved")
            state.grounding_score = float(result.get("grounding", 85))
            state.critic_reason = result.get("reason", "Evaluated")

            # Task 4: Raised threshold from 60% to 70%
            if state.grounding_score < 70:
                state.critic_status = "rejected"
                state.draft_answer = (
                    "⚠️ **Low Grounding Score** — The answer could not be fully verified against your uploaded document.\n\n"
                    "**What I found:**\n"
                    f"> {state.refined_context[:300]}...\n\n"
                    "Please try rephrasing your question or ensure the topic is covered in your uploaded material."
                )

            elapsed = int((time.time() - start) * 1000)
            state.agent_logs.append(AgentLog(
                agent="Critic", icon="gavel", status="completed",
                duration_ms=elapsed,
                thinking=f"Evaluated grounding: {state.grounding_score}% — {state.critic_reason}",
                output_preview=f"{'✅ Approved' if state.critic_status == 'approved' else '❌ Rejected'}: {state.grounding_score}% grounded ({elapsed}ms)",
                details={
                    "grounding_score": state.grounding_score,
                    "status": state.critic_status,
                    "reason": state.critic_reason,
                }
            ))

        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            print(f"[Critic Error] {e}")
            state.critic_status = "approved"
            state.grounding_score = 75.0
            state.critic_reason = "Validation error - defaulted to approval"
            state.agent_logs.append(AgentLog(
                agent="Critic", icon="gavel", status="error",
                duration_ms=elapsed,
                thinking=f"Validation failed: {str(e)} — defaulting to approval at 75%",
                output_preview=f"Warning: Defaulted to approved (75%) due to error ({elapsed}ms)",
                details={"error": str(e)}
            ))

        return state
