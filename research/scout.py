from typing import List
from langchain_core.documents import Document

from core.state import MARSState, RetrievedSource
from research.arxiv_loader import load_research_papers
from research.scholar_loader import search_google_scholar, search_google_scholar_serpapi
from research.web_loader import search_with_tavily
import os


class ResearchScoutAgent:
    """
    Multi-source research retrieval agent:
    - arXiv for preprints
    - Google Scholar for peer-reviewed papers  
    - Web search for articles and blogs
    """
    
    def __init__(self, use_serpapi_scholar: bool = False):
        """
        Args:
            use_serpapi_scholar: If True, use SerpAPI for Google Scholar (requires API key)
                               If False, use free scholarly library (slower, may get blocked)
        """
        self.use_serpapi_scholar = use_serpapi_scholar
    
    def run(self, state: MARSState) -> MARSState:
        """
        Execute research retrieval using multiple sources
        """
        # Skip for simple intents
        if state.intent in ["greeting", "feedback"]:
            return state
        
        documents: List[Document] = []
        state.papers_metadata = []
        source_index = 1
        
        # ===== ARXIV SEARCH =====
        try:
            print(f"[ResearchScout] Searching arXiv for: {state.user_query}")
            arxiv_papers = load_research_papers(state.user_query, max_docs=5)
            
            if arxiv_papers:
                documents.extend(arxiv_papers)
                
                # Store comprehensive metadata for citations
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
                
                print(f"[ResearchScout] ✓ Found {len(arxiv_papers)} arXiv papers")
            else:
                print("[ResearchScout] ✗ No arXiv papers found")
                
        except Exception as e:
            print(f"[ResearchScout] arXiv error: {e}")
        
        # ===== GOOGLE SCHOLAR SEARCH =====
        try:
            print(f"[ResearchScout] Searching Google Scholar for: {state.user_query}")
            
            if self.use_serpapi_scholar:
                # Use SerpAPI (requires API key)
                scholar_papers = search_google_scholar_serpapi(
                    state.user_query, 
                    max_results=5,
                    api_key=os.getenv("SERPAPI_KEY")
                )
            else:
                # Use free scholarly library
                scholar_papers = search_google_scholar(state.user_query, max_results=5)
            
            if scholar_papers:
                documents.extend(scholar_papers)
                
                # Add to metadata
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
                
                print(f"[ResearchScout] ✓ Found {len(scholar_papers)} Google Scholar papers")
            else:
                print("[ResearchScout] ✗ No Google Scholar results found")
                
        except Exception as e:
            print(f"[ResearchScout] Google Scholar error: {e}")
        
        # ===== WEB SEARCH =====
        try:
            print(f"[ResearchScout] Searching web for: {state.user_query}")
            web_docs = search_with_tavily(state.user_query, max_results=5)
            
            if web_docs:
                documents.extend(web_docs)
                
                # Add web sources to metadata
                for doc in web_docs:
                    metadata = {
                        "index": source_index,
                        "title": doc.metadata.get("title", "Web Article"),
                        "authors": "Web Source",
                        "year": "2024",
                        "url": doc.metadata.get("url", ""),
                        "summary": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                        "source_type": "web"
                    }
                    state.papers_metadata.append(metadata)
                    source_index += 1
                
                print(f"[ResearchScout] ✓ Found {len(web_docs)} web results")
            else:
                print("[ResearchScout] ✗ No web results found")
                
        except Exception as e:
            print(f"[ResearchScout] Web search error: {e}")
        
        # ===== CONVERT TO RETRIEVED SOURCES =====
        state.retrieved_sources = [
            RetrievedSource(
                content=doc.page_content[:2500],  # Limit to 2500 chars
                source=doc.metadata.get("source", "research"),
                page=None,
                url=doc.metadata.get("url")
            )
            for doc in documents
            if doc.page_content and len(doc.page_content.strip()) > 100
        ]
        
        # ===== SUMMARY =====
        print(f"\n[ResearchScout] ════════════════════════════════════")
        print(f"[ResearchScout] Total sources retrieved: {len(state.retrieved_sources)}")
        print(f"[ResearchScout] Papers metadata count: {len(state.papers_metadata)}")
        print(f"[ResearchScout] Breakdown:")
        print(f"[ResearchScout]   - arXiv: {sum(1 for m in state.papers_metadata if m['source_type'] == 'arxiv')}")
        print(f"[ResearchScout]   - Google Scholar: {sum(1 for m in state.papers_metadata if m['source_type'] == 'google_scholar')}")
        print(f"[ResearchScout]   - Web: {sum(1 for m in state.papers_metadata if m['source_type'] == 'web')}")
        print(f"[ResearchScout] ════════════════════════════════════\n")
        
        return state