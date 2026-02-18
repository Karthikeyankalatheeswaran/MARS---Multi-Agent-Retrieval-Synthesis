from typing import List
from langchain_core.documents import Document
import time


def search_google_scholar(query: str, max_results: int = 5) -> List[Document]:
    """
    Search Google Scholar using scholarly library (free).
    """
    try:
        from scholarly import scholarly
    except ImportError:
        print("[Google Scholar] Please install: pip install scholarly")
        return []

    try:
        search_query = scholarly.search_pubs(query)
        documents = []
        count = 0

        for result in search_query:
            if count >= max_results:
                break

            try:
                title = result.get('bib', {}).get('title', 'Untitled')
                authors = result.get('bib', {}).get('author', [])
                year = result.get('bib', {}).get('pub_year', 'Unknown')
                abstract = result.get('bib', {}).get('abstract', '')

                if isinstance(authors, list):
                    if len(authors) > 3:
                        authors_str = ", ".join(authors[:3]) + " et al."
                    else:
                        authors_str = ", ".join(authors)
                else:
                    authors_str = str(authors)

                num_citations = result.get('num_citations', 0)
                pub_url = result.get('pub_url', result.get('eprint_url', ''))

                content = f"Title: {title}\n\nAuthors: {authors_str}\n\n"
                if abstract:
                    content += f"Abstract: {abstract}\n\n"
                content += f"Citations: {num_citations}\n"
                content += f"Year: {year}"

                documents.append(
                    Document(
                        page_content=content,
                        metadata={
                            "source": "google_scholar",
                            "title": title,
                            "authors": authors_str,
                            "year": str(year),
                            "url": pub_url,
                            "citations": num_citations,
                            "Summary": abstract[:500] if abstract else "",
                            "venue": result.get('bib', {}).get('venue', ''),
                            "publisher": result.get('bib', {}).get('publisher', '')
                        }
                    )
                )
                count += 1
                time.sleep(0.5)
            except Exception as e:
                print(f"[Google Scholar] Error processing result: {e}")
                continue

        return documents

    except Exception as e:
        print(f"[Google Scholar error] {e}")
        return []


def search_google_scholar_serpapi(query: str, max_results: int = 5, api_key: str = None) -> List[Document]:
    """
    Alternative: Search Google Scholar using SerpAPI (requires API key).
    """
    from api.core.config import SERPAPI_API_KEY
    if not api_key:
        api_key = SERPAPI_API_KEY

    if not api_key:
        print("[SerpAPI] No API key provided, skipping")
        return []

    try:
        from serpapi import GoogleScholarSearch
    except ImportError:
        print("[SerpAPI] Please install: pip install google-search-results")
        return []

    try:
        params = {"q": query, "api_key": api_key, "num": max_results}
        search = GoogleScholarSearch(params)
        results = search.get_dict()

        documents = []
        for result in results.get("organic_results", [])[:max_results]:
            title = result.get("title", "Untitled")
            authors = result.get("publication_info", {}).get("authors", [])
            year = result.get("publication_info", {}).get("summary", "").split(",")[-1].strip()
            snippet = result.get("snippet", "")
            link = result.get("link", "")

            if isinstance(authors, list):
                authors_str = ", ".join([a.get("name", "") for a in authors][:3])
                if len(authors) > 3:
                    authors_str += " et al."
            else:
                authors_str = "Unknown"

            content = f"Title: {title}\n\nAuthors: {authors_str}\n\nSnippet: {snippet}\n\nYear: {year}"

            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "source": "google_scholar",
                        "title": title,
                        "authors": authors_str,
                        "year": year,
                        "url": link,
                        "Summary": snippet,
                        "cited_by": result.get("inline_links", {}).get("cited_by", {}).get("total", 0)
                    }
                )
            )

        return documents

    except Exception as e:
        print(f"[SerpAPI error] {e}")
        return []
