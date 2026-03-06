import os
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from api.core.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    OPENROUTER_BACKUP_KEYS,
)

# ========================================
# Automatic LLM Failover Configuration
# ========================================

def create_resilient_llm(model_name: str, temperature: float, max_tokens: int):
    """
    Creates an LLM instance with built-in fallbacks.
    If the primary API key fails (e.g., rate limit or expired), it automatically
    tries the backup keys in sequence.
    """
    primary_llm = ChatOpenAI(
        model=model_name,
        temperature=temperature,
        max_tokens=max_tokens,
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base=OPENROUTER_BASE_URL,
    )
    
    # Create a list of backup LLMs using the working backup keys
    backups = []
    for key in OPENROUTER_BACKUP_KEYS:
        key = key.strip()
        if key and key != OPENROUTER_API_KEY:
            backups.append(
                ChatOpenAI(
                    model=model_name,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    openai_api_key=key,
                    openai_api_base=OPENROUTER_BASE_URL,
                )
            )
            
    if backups:
        return primary_llm.with_fallbacks(backups)
    return primary_llm

# ========================================
# Base LLM for fast tasks (Planner, Analyst, Critic)
# ========================================
BASE_LLM = create_resilient_llm("google/gemini-2.0-flash-001", 0.0, 800)

PLANNER_LLM = BASE_LLM
ANALYST_LLM = BASE_LLM
CRITIC_LLM = BASE_LLM
FAST_LLM = BASE_LLM

# SCRIBE — Student Mode answers (structured, grounded)
SCRIBE_LLM = create_resilient_llm("google/gemini-2.0-flash-001", 0.15, 2500)

# RESEARCH LLM — Longer, more detailed research outputs
RESEARCH_LLM = create_resilient_llm("google/gemini-2.0-flash-001", 0.1, 3500)

# STUDIO LLM — For generating study guides, flashcards, FAQs (high quality)
STUDIO_LLM = create_resilient_llm("google/gemini-2.0-flash-001", 0.2, 3000)
