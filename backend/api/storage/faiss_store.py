"""
FAISS-based local vector store (replaces Pinecone for Student Mode).
Uses sentence-transformers for 100% offline, zero-API-call embeddings.
"""
import os
import json
import pickle
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any

from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

# ─────────────────────────────────────────────
# Settings
# ─────────────────────────────────────────────
FAISS_INDEX_DIR = Path(os.getenv("FAISS_INDEX_DIR", "media/faiss_indexes"))
FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Lazy-loaded shared embeddings object (loaded once, reused)
_embeddings: HuggingFaceEmbeddings | None = None


def _get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if _embeddings is None:
        print("[FAISS] Loading local embedding model (offline)…")
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        print("[FAISS] Embedding model ready.")
    return _embeddings


# ─────────────────────────────────────────────
# Build & Persist
# ─────────────────────────────────────────────

def ingest_pdf(file_obj, namespace: str) -> Dict[str, Any]:
    """
    Parse PDF, chunk, embed locally via sentence-transformers, and save FAISS index.
    Returns metadata dict.
    """
    import tempfile

    # Save uploaded file to a temp path so PyPDFLoader can read it
    suffix = ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        for chunk in file_obj.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        # 1. Load
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()

        # 2. Chunk
        splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=30, separator="\n")
        chunks = splitter.split_documents(docs)

        valid_chunks = [c for c in chunks if len(c.page_content.strip()) > 50]
        if not valid_chunks:
            raise ValueError("No valid text found in document.")

        # 3. Embed & build FAISS
        embeddings = _get_embeddings()
        vectorstore = FAISS.from_documents(valid_chunks, embeddings)

        # 4. Save to disk
        index_path = str(FAISS_INDEX_DIR / namespace)
        vectorstore.save_local(index_path)

        print(f"[FAISS] Saved index for namespace '{namespace}' → {index_path}")

        return {
            "namespace": namespace,
            "pages": len(docs),
            "chunks": len(valid_chunks),
            "index_path": index_path,
        }
    finally:
        os.unlink(tmp_path)


# ─────────────────────────────────────────────
# Load & Query
# ─────────────────────────────────────────────

def load_faiss_index(namespace: str) -> FAISS:
    index_path = str(FAISS_INDEX_DIR / namespace)
    if not Path(index_path).exists():
        raise FileNotFoundError(f"No FAISS index found for namespace '{namespace}'")
    embeddings = _get_embeddings()
    return FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)


def search_documents(namespace: str, query: str, k: int = 5) -> List[Dict[str, str]]:
    """
    Search the FAISS index. Returns list of {content, source, page} dicts.
    """
    vectorstore = load_faiss_index(namespace)
    results = vectorstore.similarity_search(query, k=k)
    return [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source", ""),
            "page": doc.metadata.get("page", ""),
        }
        for doc in results
    ]


# ─────────────────────────────────────────────
# Cleanup
# ─────────────────────────────────────────────

def delete_namespace(namespace: str) -> bool:
    """Delete FAISS index from disk."""
    index_path = FAISS_INDEX_DIR / namespace
    if index_path.exists():
        import shutil
        shutil.rmtree(str(index_path))
        print(f"[FAISS] Deleted index for namespace '{namespace}'")
        return True
    return False


def cleanup_old_indexes(max_age_hours: int = 48):
    """
    Delete all FAISS index directories older than max_age_hours.
    Called by scheduler every 48 hours.
    """
    now = datetime.utcnow()
    deleted = []
    for d in FAISS_INDEX_DIR.iterdir():
        if d.is_dir():
            mtime = datetime.utcfromtimestamp(d.stat().st_mtime)
            age = now - mtime
            if age > timedelta(hours=max_age_hours):
                import shutil
                shutil.rmtree(str(d))
                deleted.append(d.name)
    if deleted:
        print(f"[FAISS] Auto-cleanup: removed {len(deleted)} old indexes → {deleted}")
    return deleted
