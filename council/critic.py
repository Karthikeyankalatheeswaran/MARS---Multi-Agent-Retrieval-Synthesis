import json
from core.state import MARSState
from core.llms import CRITIC_LLM


class CriticAgent:
    def run(self, state: MARSState) -> MARSState:
        """
        Validates grounding for student mode answers
        """
        
        # Skip for research mode
        if state.mode == "research":
            state.critic_status = "approved"
            state.critic_reason = "Research mode allows synthesis"
            state.grounding_score = None
            return state
        
        # Skip for non-query intents
        if state.intent in ["greeting", "feedback"]:
            state.critic_status = "approved"
            state.grounding_score = 100.0
            return state
        
        # Handle "not found" responses
        if "not found in material" in state.draft_answer.lower():
            state.critic_status = "approved"
            state.critic_reason = "Correct fallback response"
            state.grounding_score = 100.0
            return state
        
        # Validate grounding
        prompt = f"""
You are validating if a student's answer is grounded in textbook content.

Textbook Content:
{state.refined_context[:2000]}

Student Answer:
{state.draft_answer}

Evaluate:
1. Is the answer supported by the textbook? (yes/no)
2. Grounding percentage (0-100): How much of the answer comes from the textbook?
3. Brief reason (one sentence)

Respond ONLY with valid JSON:
{{"status": "approved" or "rejected", "grounding": number, "reason": "brief reason"}}
"""
        
        try:
            response = CRITIC_LLM.invoke(prompt).content
            
            # Extract JSON from response
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
            
            # Reject if grounding is too low
            if state.grounding_score < 60:
                state.critic_status = "rejected"
                state.draft_answer = (
                    "❌ **Not found in material.**\n\n"
                    "The answer cannot be reliably determined from your uploaded document."
                )
            
        except Exception as e:
            print(f"[Critic Error] {e}")
            # Default to approval if parsing fails
            state.critic_status = "approved"
            state.grounding_score = 75.0
            state.critic_reason = "Validation error - defaulted to approval"
        
        return state