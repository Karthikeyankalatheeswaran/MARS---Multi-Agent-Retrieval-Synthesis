from typing import List
from langchain_core.documents import Document
import os


def search_with_tavily(query: str, max_results: int = 5) -> List[Document]:
    """
    Search web using Tavily API
    """
    api_key = os.getenv("TAVILY_API_KEY")

    if not api_key:
        print("[Tavily] API key not configured, skipping web search")
        return []

    try:
        from tavily import TavilyClient

        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
            include_raw_content=True
        )

        documents = []
        results = response.get("results", [])

        for item in results:
            content = item.get("raw_content") or item.get("content", "")
            url = item.get("url", "")

            if len(content) < 300:
                continue

            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "source": "web",
                        "url": url,
                        "title": item.get("title", "")
                    }
                )
            )

        return documents

    except ImportError:
        print("[Tavily] Library not installed: pip install tavily-python")
        return []
    except Exception as e:
        print(f"[Tavily Error] {e}")
        return []
