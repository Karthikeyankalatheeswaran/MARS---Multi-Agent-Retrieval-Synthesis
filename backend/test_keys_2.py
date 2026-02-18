from dotenv import load_dotenv
import os

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL")

print(f"OpenRouter Key: {OPENROUTER_API_KEY[:8]}... length: {len(OPENROUTER_API_KEY)}")

try:
    from langchain_openai import ChatOpenAI
    
    llm = ChatOpenAI(
        model="google/gemini-2.0-flash-exp:free",
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base=OPENROUTER_BASE_URL,
        max_tokens=50
    )
    print("Testing OpenRouter with simple invoke...")
    res = llm.invoke("Hello")
    print(f"OpenRouter SUCCESS: {res.content}")
except Exception as e:
    print(f"OpenRouter FAILED: {e}")
