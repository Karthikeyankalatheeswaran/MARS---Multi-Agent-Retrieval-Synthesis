from typing import List
from langchain_core.documents import Document
import os


def load_research_papers(query: str, max_docs: int = 5) -> List[Document]:
    """
    Load research papers from arXiv with comprehensive metadata.
    Uses direct arxiv API without PDF parsing to avoid fitz dependency issues.
    """
    try:
        import arxiv
    except ImportError:
        print("[arXiv loader] Please install: pip install arxiv")
        return []
    
    try:
        # Create search client
        client = arxiv.Client()
        
        # Search arXiv
        search = arxiv.Search(
            query=query,
            max_results=max_docs,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        documents = []
        
        for result in client.results(search):
            # Extract authors
            authors = [author.name for author in result.authors]
            if len(authors) > 3:
                authors_str = ", ".join(authors[:3]) + " et al."
            else:
                authors_str = ", ".join(authors)
            
            # Get year from published date
            year = str(result.published.year) if result.published else "Unknown"
            
            # Use summary instead of full PDF text (avoids fitz dependency)
            content = f"Title: {result.title}\n\nAuthors: {authors_str}\n\nAbstract: {result.summary}"
            
            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "source": "arxiv",
                        "title": result.title,
                        "authors": authors_str,
                        "year": year,
                        "url": result.entry_id,
                        "Published": result.published.strftime("%Y-%m-%d") if result.published else "",
                        "Summary": result.summary,
                        "arxiv_id": result.entry_id.split('/')[-1],
                        "pdf_url": result.pdf_url,
                        "categories": result.categories
                    }
                )
            )
        
        return documents
        
    except Exception as e:
        print(f"[arXiv loader error] {e}")
        return []