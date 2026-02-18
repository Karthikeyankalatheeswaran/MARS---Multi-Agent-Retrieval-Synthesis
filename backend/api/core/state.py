from typing import List, Optional, Dict, Any, TypedDict
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


class MARSStateDict(TypedDict, total=False):
    user_query: str
    mode: Optional[str]
    namespace: Optional[str]
    chat_history: List[Dict[str, Any]]
    intent: Optional[str]
    answer_type: Optional[str]
    retrieved_sources: List[Dict[str, Any]]
    refined_context: Optional[str]
    draft_answer: Optional[str]
    critic_status: Optional[str]
    critic_reason: Optional[str]
    grounding_score: Optional[float]
    papers_metadata: List[Dict[str, Any]]
    agent_logs: List[Dict[str, Any]]


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
