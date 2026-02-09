import os
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from core.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    GROQ_API_KEY,
    GROQ_API_KEY_2
)

# ========================================
# GROQ MODELS (Fast & Free)
# ========================================

PLANNER_LLM = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    max_tokens=50,
    api_key=GROQ_API_KEY
)

ANALYST_LLM = ChatGroq(
    model="llama-3.3-70b-versatile",  # Changed for stability
    temperature=0,
    max_tokens=600,
    api_key=GROQ_API_KEY
)

CRITIC_LLM = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    max_tokens=500,
    api_key=GROQ_API_KEY
)

# ========================================
# OPENROUTER (Quality answers)
# ========================================

SCRIBE_LLM = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.3,
    max_tokens=1000,
    api_key=GROQ_API_KEY_2
)

# SCRIBE_LLM = ChatOpenAI(
#     model="openai/gpt-5.2-codex",  # Better reasoning
#     temperature=0.3,
#     max_tokens=200,
#     openai_api_key=OPENROUTER_API_KEY,
#     openai_api_base=OPENROUTER_BASE_URL,
# )

# For embeddings (if needed directly)
EMBEDDINGS_MODEL = "text-embedding-3-small"