import os
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from api.core.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
)

# ========================================
# OPENROUTER (Gemini Pro) - Proven Working
# ========================================

# Base LLM for fast tasks (Planner, Analyst, Critic)
# Using google/gemini-2.0-flash-001 (standard, reliable)
BASE_LLM = ChatOpenAI(
    model="google/gemini-2.0-flash-001",
    temperature=0,
    max_tokens=1000,
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base=OPENROUTER_BASE_URL,
)

PLANNER_LLM = BASE_LLM
ANALYST_LLM = BASE_LLM
CRITIC_LLM = BASE_LLM
FAST_LLM = BASE_LLM

# SCRIBE — Using Flash model for sub-500ms latency requirement.
SCRIBE_LLM = ChatOpenAI(
    model="google/gemini-2.0-flash-001",
    temperature=0.2,
    max_tokens=2000,
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base=OPENROUTER_BASE_URL,
)

# For embeddings (if needed directly)
EMBEDDINGS_MODEL = "text-embedding-3-small"
