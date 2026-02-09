from typing import List
from core.state import MARSState, ChatMessage


class MemoryManager:
    """
    Manages conversation context without LLM calls
    Uses sliding window approach for efficiency
    """
    
    def __init__(self, max_turns: int = 10):
        self.max_turns = max_turns
    
    def add_interaction(
        self, 
        state: MARSState, 
        user_msg: str, 
        assistant_msg: str
    ) -> MARSState:
        """
        Add user-assistant interaction to chat history
        """
        state.chat_history.append(ChatMessage(role="user", content=user_msg))
        state.chat_history.append(ChatMessage(role="assistant", content=assistant_msg))
        
        # Keep only last N turns (2 messages per turn)
        if len(state.chat_history) > self.max_turns * 2:
            state.chat_history = state.chat_history[-(self.max_turns * 2):]
        
        return state
    
    def get_recent_context(self, state: MARSState, num_turns: int = 3) -> str:
        """
        Get formatted recent conversation context
        """
        recent = state.chat_history[-(num_turns * 2):]
        
        return "\n".join(
            f"{msg.role.upper()}: {msg.content}"
            for msg in recent
        )
    
    def clear_history(self, state: MARSState) -> MARSState:
        """
        Clear conversation history
        """
        state.chat_history = []
        return state