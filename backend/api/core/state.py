from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class RetrievedSource(BaseModel):
    content: str
    source: str
    page: Optional[int] = None
    url: Optional[str] = None


class AgentLog(BaseModel):
    """Verbose log entry from an agent"""
    agent: str
    status: str = "completed"
    icon: str = ""
    duration_ms: int = 0
    thinking: str = ""
    output_preview: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)


class MARSState(BaseModel):
    user_query: str
    mode: Optional[str] = None
    namespace: Optional[str] = None

    # Chat memory
    chat_history: List[ChatMessage] = Field(default_factory=list)

    # Intent tracking
    intent: Optional[str] = None
    answer_type: Optional[str] = None

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

    # Agent verbose logs
    agent_logs: List[AgentLog] = Field(default_factory=list)

    class Config:
        extra = "allow"
