from core.state import MARSState

GREETINGS = {"hi", "hello", "hey", "hai", "yo"}
FEEDBACK = {"this is good", "good", "nice", "great", "ok", "cool"}

class ConversationController:
    def run(self, state: MARSState) -> MARSState:
        q = state.user_query.lower().strip()

        if q in GREETINGS:
            state.intent = "greeting"
            return state

        if q in FEEDBACK:
            state.intent = "feedback"
            return state

        if q.endswith("?") and len(state.chat_history) > 0:
            state.intent = "follow_up"
            return state

        state.intent = "new_query"
        return state
