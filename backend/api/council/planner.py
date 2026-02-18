import time
from api.core.state import MARSState, AgentLog


class PlannerAgent:
    def run(self, state: MARSState) -> MARSState:
        """Detects user intent and sets routing flags"""
        start = time.time()
        query = state.user_query.lower().strip()

        # GREETING DETECTION
        import re
        clean_query = re.sub(r'[^\w\s]', '', query).strip()
        first_word = clean_query.split()[0] if clean_query else ""

        greetings = {"hi", "hello", "hey", "hai", "yo", "sup", "good morning",
                     "good afternoon", "good evening"}
        greeting_starters = {"hi", "hello", "hey", "hai", "yo", "sup"}
        greeting_phrases = {"how are you", "whats up", "how do you do",
                           "nice to meet you", "good to see you"}

        is_greeting = (clean_query in greetings
                      or first_word in greeting_starters
                      or any(p in clean_query for p in greeting_phrases))

        if is_greeting:
            state.intent = "greeting"
            state.answer_type = "general"
            state.agent_logs.append(AgentLog(
                agent="Planner", icon="target", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Detected greeting pattern: '{query}'",
                output_preview="Intent: greeting → routing to Scribe",
                details={"intent": "greeting", "answer_type": "general"}
            ))
            return state

        # FEEDBACK DETECTION
        feedback_phrases = {"thanks", "thank you", "good", "great", "nice",
                           "perfect", "ok", "cool", "got it", "understood"}

        if query in feedback_phrases:
            state.intent = "feedback"
            state.answer_type = "general"
            state.agent_logs.append(AgentLog(
                agent="Planner", icon="target", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Detected feedback: '{query}'",
                output_preview="Intent: feedback → routing to Scribe",
                details={"intent": "feedback", "answer_type": "general"}
            ))
            return state

        # FOLLOW-UP DETECTION
        if len(state.chat_history) > 0:
            followup_patterns = ["what about", "how about", "and", "also",
                                "can you explain", "tell me more", "elaborate"]

            if any(query.startswith(p) for p in followup_patterns) or len(query.split()) <= 4:
                state.intent = "follow_up"
                state.agent_logs.append(AgentLog(
                    agent="Planner", icon="target", status="completed",
                    duration_ms=int((time.time() - start) * 1000),
                    thinking=f"Short query with history present, detected follow-up: '{query}'",
                    output_preview=f"Intent: follow_up → routing to {'Research' if state.mode == 'research' else 'Student'} Scout",
                    details={"intent": "follow_up", "mode": state.mode}
                ))
                return state

        # RESEARCH MODE
        research_keywords = ["paper", "papers", "research", "survey", "literature",
                            "study", "studies", "review", "arxiv", "publication",
                            "compare methods", "state of the art", "recent advances"]
        
        # EXAM ORACLE DETECTION
        exam_keywords = ["predict", "exam", "questions", "important questions", "previous year", "anna university", "qp", "pattern"]
        is_exam_query = any(k in query for k in exam_keywords) and ("predict" in query or "question" in query or "exam" in query)

        if is_exam_query:
            state.intent = "exam_prediction"
            state.answer_type = "oracle"
            state.agent_logs.append(AgentLog(
                agent="Planner", icon="target", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Detected exam prediction request: '{query}'",
                output_preview="Intent: exam_prediction → routing to Oracle",
                details={"intent": "exam_prediction"}
            ))
            return state

        if state.mode == "research" or any(kw in query for kw in research_keywords):
            state.intent = "new_query"
            state.answer_type = "research"
            state.mode = "research"
            state.agent_logs.append(AgentLog(
                agent="Planner", icon="target", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Research mode active or research keywords detected in: '{query}'",
                output_preview="Intent: new_query → routing to Research Scout",
                details={"intent": "new_query", "answer_type": "research", "mode": "research"}
            ))
            return state

        # DEFAULT: STUDENT MODE
        state.intent = "new_query"
        state.answer_type = "academic"
        state.mode = "student"
        state.agent_logs.append(AgentLog(
            agent="Planner", icon="target", status="completed",
            duration_ms=int((time.time() - start) * 1000),
            thinking=f"Default student mode query: '{query}'",
            output_preview="Intent: new_query → routing to Student Scout",
            details={"intent": "new_query", "answer_type": "academic", "mode": "student"}
        ))
        return state
