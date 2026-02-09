from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class RetrievedSource(BaseModel):
    content: str
    source: str
    page: Optional[int] = None
    url: Optional[str] = None  # Added for research mode


class MARSState(BaseModel):
    user_query: str
    mode: Optional[str] = None
    namespace: Optional[str] = None

    # Chat memory
    chat_history: List[ChatMessage] = Field(default_factory=list)

    # Intent tracking
    intent: Optional[str] = None  # greeting, feedback, follow_up, new_query
    answer_type: Optional[str] = None  # general, academic, research

    # Retrieval & analysis
    retrieved_sources: List[RetrievedSource] = Field(default_factory=list)
    refined_context: Optional[str] = None
    draft_answer: Optional[str] = None

    # Critic (student mode)
    critic_status: Optional[str] = None
    critic_reason: Optional[str] = None
    grounding_score: Optional[float] = None

    # Research metadata
    papers_metadata: Optional[List[Dict]] = Field(default_factory=list)
    
    class Config:
        extra = "forbid"