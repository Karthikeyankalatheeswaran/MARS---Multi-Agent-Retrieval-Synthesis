import os
import time
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SerpAPIWrapper
from tavily import TavilyClient
from pinecone import Pinecone

def test_api():
    load_dotenv()
    results = {}

    # 1. Groq Keys
    for key_name in ["GROQ_API_KEY", "GROQ_API_KEY_2"]:
        key = os.getenv(key_name)
        if not key:
            results[key_name] = "MISSING"
            continue
        try:
            llm = ChatGroq(api_key=key, model="llama-3.3-70b-versatile")
            llm.invoke("Hi")
            results[key_name] = "SUCCESS"
        except Exception as e:
            results[key_name] = f"FAILED: {str(e)[:100]}"

    # 2. OpenRouter
    or_key = os.getenv("OPENROUTER_API_KEY")
    or_base = os.getenv("OPENROUTER_BASE_URL")
    if not or_key:
        results["OPENROUTER"] = "MISSING"
    else:
        try:
            llm = ChatOpenAI(
                model="google/gemini-2.0-flash-001",
                openai_api_key=or_key,
                openai_api_base=or_base or "https://openrouter.ai/api/v1"
            )
            llm.invoke("Hi")
            results["OPENROUTER"] = "SUCCESS"
        except Exception as e:
            results["OPENROUTER"] = f"FAILED: {str(e)[:100]}"

    # 3. Tavily
    tv_key = os.getenv("TAVILY_API_KEY")
    if not tv_key:
        results["TAVILY"] = "MISSING"
    else:
        try:
            client = TavilyClient(api_key=tv_key)
            client.search("test")
            results["TAVILY"] = "SUCCESS"
        except Exception as e:
            results["TAVILY"] = f"FAILED: {str(e)[:100]}"

    # 4. SerpAPI
    serp_key = os.getenv("SERPAPI_API_KEY")
    if not serp_key:
        results["SERPAPI"] = "MISSING"
    else:
        try:
            search = SerpAPIWrapper(serpapi_api_key=serp_key)
            search.run("test")
            results["SERPAPI"] = "SUCCESS"
        except Exception as e:
            results["SERPAPI"] = f"FAILED: {str(e)[:100]}"

    # 5. Pinecone
    pc_key = os.getenv("PINECONE_API_KEY")
    pc_index = os.getenv("PINECONE_INDEX_NAME")
    if not pc_key:
        results["PINECONE"] = "MISSING"
    else:
        try:
            pc = Pinecone(api_key=pc_key)
            index = pc.Index(pc_index)
            index.describe_index_stats()
            results["PINECONE"] = "SUCCESS"
        except Exception as e:
            results["PINECONE"] = f"FAILED: {str(e)[:100]}"

    print("\n--- API VERIFICATION RESULTS ---")
    for api, status in results.items():
        print(f"{api}: {status}")
    print("--------------------------------\n")

if __name__ == "__main__":
    test_api()
