from dotenv import load_dotenv
import os

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL")

print(f"OpenRouter Key: {OPENROUTER_API_KEY[:8]}... length: {len(OPENROUTER_API_KEY)}")

try:
    from langchain_openai import ChatOpenAI
    
    # Try a standard model likely to be available
    llm = ChatOpenAI(
        model="google/gemini-2.0-flash-001",
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base=OPENROUTER_BASE_URL,
        max_tokens=50
    )
    print("Testing OpenRouter (google/gemini-2.0-flash-001)...")
    try:
        res = llm.invoke("Hello")
        print(f"SUCCESS: {res.content}")
    except Exception as e:
        print(f"FAILED flash-001: {e}")

    # Try Llama 3 free
    llm_free = ChatOpenAI(
        model="meta-llama/llama-3-8b-instruct:free",
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base=OPENROUTER_BASE_URL,
        max_tokens=50
    )
    print("Testing OpenRouter (llama-3-8b-instruct:free)...")
    try:
        res = llm_free.invoke("Hello")
        print(f"SUCCESS free: {res.content}")
    except Exception as e:
        print(f"FAILED llama-free: {e}")

except Exception as e:
    print(f"Setup FAILED: {e}")
