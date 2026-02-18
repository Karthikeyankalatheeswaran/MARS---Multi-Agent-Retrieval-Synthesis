from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_KEY_2 = os.getenv("GROQ_API_KEY_2")

print(f"Key 1: {GROQ_API_KEY[:8]}... length: {len(GROQ_API_KEY)}")
print(f"Key 2: {GROQ_API_KEY_2[:8]}... length: {len(GROQ_API_KEY_2)}")

# Test imports
try:
    from langchain_groq import ChatGroq
    
    # Test Key 1
    try:
        llm1 = ChatGroq(api_key=GROQ_API_KEY, model="llama-3.3-70b-versatile")
        print("Testing Key 1 with simple invoke...")
        res1 = llm1.invoke("Hello")
        print(f"Key 1 SUCCESS: {res1.content}")
    except Exception as e:
        print(f"Key 1 FAILED: {e}")

    # Test Key 2
    try:
        llm2 = ChatGroq(api_key=GROQ_API_KEY_2, model="llama-3.3-70b-versatile")
        print("Testing Key 2 with simple invoke...")
        res2 = llm2.invoke("Hello")
        print(f"Key 2 SUCCESS: {res2.content}")
    except Exception as e:
        print(f"Key 2 FAILED: {e}")

except Exception as e:
    print(f"Import/Setup FAILED: {e}")
