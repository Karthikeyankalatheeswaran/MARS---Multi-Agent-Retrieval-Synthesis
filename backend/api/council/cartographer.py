import time
import json
from api.core.state import MARSState, AgentLog
from api.core.llms import FAST_LLM  # Use faster model for JSON extraction

class CartographerAgent:
    def run(self, state: MARSState) -> MARSState:
        """Extracts key concepts for Study Guide Cards and Mind Map"""
        start = time.time()
        
        # Only run if there is a draft answer to visualize
        if not state.draft_answer:
            return state

        prompt = f"""
You are an expert Educational Content Architect. Your goal is to transform the provided text into a highly structured study guide and a conceptual mind map.

Source Material:
{state.draft_answer[:6000]}

Requirements:
1. **Core Concepts (Flashcards)**:
   - Identify 3-8 key concepts discussed in the text.
   - For each: title, definition (one clear sentence), example (concrete application), takeaway (why it matters), and a relevant icon name.
2. **Mind Map Structure**:
   - **center**: A concise, descriptive title for the overall topic.
   - **nodes**: A list of 4-10 branches connecting to the center. Each node must have an 'id', 'label' (short title), and 'description' (a brief explanation for a tooltip).

Output strictly as a valid JSON object. Do not include any text before or after the JSON.

Expected structure:
{{
  "study_cards": [
    {{
      "title": "Concept",
      "definition": "...",
      "example": "...",
      "takeaway": "...",
      "icon": "rocket"
    }}
  ],
  "mind_map": {{
    "center": "Top-level Topic",
    "nodes": [
      {{ "id": "1", "label": "Subtopic A", "description": "Details about A..." }},
      {{ "id": "2", "label": "Subtopic B", "description": "Details about B..." }}
    ]
  }}
}}

JSON Output:
"""

        try:
            response = FAST_LLM.invoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            data = json.loads(content.strip())
            study_cards = data.get("study_cards", [])
            mind_map = data.get("mind_map", {"center": "Topic", "nodes": []})
            
            state.agent_logs.append(AgentLog(
                agent="Cartographer", icon="map", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Mapped {len(study_cards)} concepts and {len(mind_map.get('nodes', []))} branches.",
                output_preview=str(data)[:100],
                details={
                    "study_cards": study_cards,
                    "mind_map": mind_map
                }
            ))

        except Exception as e:
            print(f"[Cartographer Error] {e}")
            state.agent_logs.append(AgentLog(
                agent="Cartographer", icon="map", status="error",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Failed to generate visualizations: {e}",
                details={"error": str(e)}
            ))

        return state
