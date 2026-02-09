from core.state import MARSState
from core.llms import PLANNER_LLM


class PlannerAgent:
    def run(self, state: MARSState) -> MARSState:
        """
        Detects user intent and sets routing flags
        """
        query = state.user_query.lower().strip()
        
        # ===== GREETING DETECTION =====
        greetings = {"hi", "hello", "hey", "hai", "yo", "sup", "good morning", 
                     "good afternoon", "good evening"}
        
        if query in greetings or query.startswith(("hi ", "hello ", "hey ")):
            state.intent = "greeting"
            state.answer_type = "general"
            return state
        
        # ===== FEEDBACK DETECTION =====
        feedback_phrases = {"thanks", "thank you", "good", "great", "nice", 
                           "perfect", "ok", "cool", "got it", "understood"}
        
        if query in feedback_phrases:
            state.intent = "feedback"
            state.answer_type = "general"
            return state
        
        # ===== FOLLOW-UP DETECTION =====
        # If chat history exists and query is short/referential
        if len(state.chat_history) > 0:
            followup_patterns = ["what about", "how about", "and", "also", 
                                "can you explain", "tell me more", "elaborate"]
            
            if any(query.startswith(p) for p in followup_patterns) or len(query.split()) <= 4:
                state.intent = "follow_up"
                # Mode stays the same as before
                return state
        
        # ===== RESEARCH MODE DETECTION =====
        research_keywords = ["paper", "papers", "research", "survey", "literature",
                            "study", "studies", "review", "arxiv", "publication",
                            "compare methods", "state of the art", "recent advances"]
        
        if state.mode == "research" or any(kw in query for kw in research_keywords):
            state.intent = "new_query"
            state.answer_type = "research"
            state.mode = "research"
            return state
        
        # ===== DEFAULT: STUDENT MODE =====
        state.intent = "new_query"
        state.answer_type = "academic"
        state.mode = "student"
        return state