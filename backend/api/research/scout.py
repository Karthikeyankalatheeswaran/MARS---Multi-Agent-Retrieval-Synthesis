import time
import os
from typing import List
from concurrent.futures import ThreadPoolExecutor
from langchain_core.documents import Document

from api.core.state import MARSState, RetrievedSource, AgentLog
from api.research.arxiv_loader import load_research_papers
from api.research.scholar_loader import search_google_scholar, search_google_scholar_serpapi
from api.research.web_loader import search_with_tavily


class ResearchScoutAgent:
    """Multi-source research retrieval agent using parallel execution for speed"""

    def __init__(self, use_serpapi_scholar: bool = True):
        self.use_serpapi_scholar = use_serpapi_scholar

    def run(self, state: MARSState) -> MARSState:
        start = time.time()

        if state.intent in ["greeting", "feedback"]:
            return state

        query = state.user_query
        
        # Define parallel tasks
        def get_arxiv():
            try: return load_research_papers(query, max_docs=5)
            except: return []

        def get_scholar():
            try:
                if self.use_serpapi_scholar:
                    from api.core.config import SERPAPI_API_KEY
                    return search_google_scholar_serpapi(query, max_results=5, api_key=SERPAPI_API_KEY)
                return search_google_scholar(query, max_results=5)
            except: return []

        def get_web():
            try: return search_with_tavily(query, max_results=5)
            except: return []

        # Execute in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_arxiv = executor.submit(get_arxiv)
            future_scholar = executor.submit(get_scholar)
            future_web = executor.submit(get_web)

            arxiv_papers = future_arxiv.result()
            scholar_papers = future_scholar.result()
            web_docs = future_web.result()

        documents: List[Document] = []
        state.papers_metadata = []
        source_index = 1
        search_log = []

        # Process ArXiv
        if arxiv_papers:
            documents.extend(arxiv_papers)
            for paper in arxiv_papers:
                metadata = {
                    "index": source_index,
                    "title": paper.metadata.get("title", "Untitled"),
                    "authors": paper.metadata.get("authors", "Unknown Authors"),
                    "year": paper.metadata.get("year", "N/A"),
                    "url": paper.metadata.get("url", ""),
                    "published": paper.metadata.get("Published", ""),
                    "summary": paper.metadata.get("Summary", "")[:500],
                    "source_type": "arxiv",
                    "pdf_url": paper.metadata.get("pdf_url", "")
                }
                state.papers_metadata.append(metadata)
                source_index += 1
            search_log.append(f"arXiv: {len(arxiv_papers)} papers")
        else:
            search_log.append("arXiv: No results")

        # Process Scholar
        if scholar_papers:
            documents.extend(scholar_papers)
            for paper in scholar_papers:
                metadata = {
                    "index": source_index,
                    "title": paper.metadata.get("title", "Untitled"),
                    "authors": paper.metadata.get("authors", "Unknown Authors"),
                    "year": paper.metadata.get("year", "N/A"),
                    "url": paper.metadata.get("url", ""),
                    "summary": paper.metadata.get("Summary", "")[:500],
                    "source_type": "google_scholar",
                    "citations": paper.metadata.get("citations", 0),
                    "venue": paper.metadata.get("venue", "")
                }
                state.papers_metadata.append(metadata)
                source_index += 1
            search_log.append(f"Scholar: {len(scholar_papers)} papers")
        else:
            search_log.append("Scholar: No results")

        # Process Web
        if web_docs:
            documents.extend(web_docs)
            for doc in web_docs:
                metadata = {
                    "index": source_index,
                    "title": doc.metadata.get("title", "Web Article"),
                    "authors": "Web Source",
                    "year": "2025",
                    "url": doc.metadata.get("url", ""),
                    "summary": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                    "source_type": "web"
                }
                state.papers_metadata.append(metadata)
                source_index += 1
            search_log.append(f"Web: {len(web_docs)} results")
        else:
            search_log.append("Web: No results")

        # Filter and Truncate
        state.retrieved_sources = [
            RetrievedSource(
                content=doc.page_content[:2500],
                source=doc.metadata.get("source", "research"),
                page=None,
                url=doc.metadata.get("url")
            )
            for doc in documents
            if doc.page_content and len(doc.page_content.strip()) > 100
        ]

        elapsed = int((time.time() - start) * 1000)
        state.agent_logs.append(AgentLog(
            agent="Research Scout", icon="search", status="completed",
            duration_ms=elapsed,
            thinking=f"Parallel search for: '{query[:80]}...'\n" + "\n".join(search_log),
            output_preview=f"Found {len(state.retrieved_sources)} sources ({elapsed}ms)",
            details={
                "total_sources": len(state.retrieved_sources),
                "search_log": search_log,
                "duration_ms": elapsed
            }
        ))

        return state
