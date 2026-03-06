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
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

from django.conf import settings

FAISS_INDEX_DIR = Path(os.path.join(settings.MEDIA_ROOT, "faiss_indexes"))
FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)

UPLOADS_DIR = Path(os.path.join(settings.MEDIA_ROOT, "uploads"))
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

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

def _extract_text_ocr(pdf_path: str) -> list:
    """Fallback OCR extractor using pdf2image and pytesseract in parallel."""
    try:
        from pdf2image import convert_from_path
        import pytesseract
        import concurrent.futures
        from langchain_core.documents import Document
    except ImportError:
        print("[FAISS] Missing OCR dependencies (pdf2image/pytesseract). Cannot run OCR.")
        return []

    print("[FAISS] Converting PDF to images for OCR...")
    import time
    start = time.time()
    images = convert_from_path(pdf_path, dpi=150)
    print(f"[FAISS] Converted {len(images)} pages in {time.time()-start:.1f}s")

    def ocr_page(args):
        i, img = args
        text = pytesseract.image_to_string(img)
        # Return a LangChain Document
        return Document(page_content=text, metadata={"source": pdf_path, "page": i})

    print(f"[FAISS] Running parallel OCR on {len(images)} pages...")
    start = time.time()
    docs = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        for doc in executor.map(ocr_page, enumerate(images)):
            docs.append(doc)
    
    print(f"[FAISS] OCR completed in {time.time()-start:.1f}s")
    return docs

def ingest_pdf(file_obj, namespace: str) -> Dict[str, Any]:
    """
    Parse PDF, chunk, embed locally via sentence-transformers, and save FAISS index.
    Handles files up to 200MB. Returns metadata dict.
    """
    import tempfile
    import os
    from langchain_community.document_loaders import PyMuPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    # Save uploaded file to a temp path — handle both InMemory and Temporary uploads
    suffix = ".pdf"
    tmp_path = None
    try:
        # For Django's TemporaryUploadedFile (large files), use its path directly
        if hasattr(file_obj, 'temporary_file_path'):
            tmp_path = file_obj.temporary_file_path()
        else:
            # For InMemoryUploadedFile (small files), write to temp file
            fd, tmp_path = tempfile.mkstemp(suffix=suffix)
            with os.fdopen(fd, 'wb') as tmp:
                for chunk in file_obj.chunks(chunk_size=8192 * 1024):  # 8MB chunks
                    tmp.write(chunk)
        
        file_size_mb = os.path.getsize(tmp_path) / (1024 * 1024)
        print(f"[FAISS] Processing file: {getattr(file_obj, 'name', 'unknown.pdf')} ({file_size_mb:.1f} MB)")

        # 1. Load PDF
        loader = PyMuPDFLoader(tmp_path)
        docs = loader.load()
        print(f"[FAISS] PyMuPDF loaded {len(docs)} pages")

        # 2. Chunk — use RecursiveCharacterTextSplitter for better results on large docs
        chunk_size = 1500 if len(docs) > 50 else 1000
        chunk_overlap = 100 if len(docs) > 50 else 50

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
            length_function=len,
        )
        chunks = splitter.split_documents(docs)

        valid_chunks = [c for c in chunks if len(c.page_content.strip()) > 30]
        
        # --- OCR Fallback ---
        if not valid_chunks:
            print("[FAISS] No valid text found via PyMuPDF. Falling back to OCR...")
            docs = _extract_text_ocr(tmp_path)
            chunks = splitter.split_documents(docs)
            valid_chunks = [c for c in chunks if len(c.page_content.strip()) > 30]

            if not valid_chunks:
                raise ValueError("No valid text found in document, even after OCR.")

        print(f"[FAISS] Generated {len(valid_chunks)} text chunks (chunk_size={chunk_size})")

        # 3. Embed & build FAISS — process in batches for large docs
        embeddings = _get_embeddings()
        
        BATCH = 500
        if len(valid_chunks) <= BATCH:
            vectorstore = FAISS.from_documents(valid_chunks, embeddings)
        else:
            # Build in batches to avoid memory issues
            vectorstore = FAISS.from_documents(valid_chunks[:BATCH], embeddings)
            for i in range(BATCH, len(valid_chunks), BATCH):
                batch = valid_chunks[i:i + BATCH]
                batch_vs = FAISS.from_documents(batch, embeddings)
                vectorstore.merge_from(batch_vs)
                print(f"[FAISS] Indexed batch {i // BATCH + 1}/{(len(valid_chunks) + BATCH - 1) // BATCH}")

        # 4. Save to disk
        index_path = str(FAISS_INDEX_DIR / namespace)
        vectorstore.save_local(index_path)
        print(f"[FAISS] Saved index for namespace '{namespace}' → {index_path}")
        
        # 4.5 Save PDF permanently to media/uploads
        import shutil
        pdf_filename = f"{namespace}.pdf"
        pdf_path = UPLOADS_DIR / pdf_filename
        shutil.copy2(tmp_path, pdf_path)
        print(f"[FAISS] Saved PDF copy to {pdf_path}")

        result = {
            "namespace": namespace,
            "pages": len(docs),
            "chunks": len(valid_chunks),
            "index_path": index_path,
        }

        # 5. Save to Django model
        try:
            from api.models import FAISSDocument
            FAISSDocument.objects.update_or_create(
                namespace=namespace,
                defaults={
                    "filename": getattr(file_obj, 'name', 'unknown.pdf'),
                    "page_count": len(docs),
                    "chunk_count": len(valid_chunks),
                    "index_path": index_path,
                    "file_path": str(pdf_path),
                }
            )
            print(f"[FAISS] Saved DB record for namespace '{namespace}'")
        except Exception as db_err:
            print(f"[FAISS] Warning: Could not save DB record: {db_err}")

        return result
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
    """Delete FAISS index, PDF file, and DB record."""
    import shutil
    
    # 1. Delete index
    index_path = FAISS_INDEX_DIR / namespace
    deleted = False
    if index_path.exists():
        shutil.rmtree(str(index_path))
        print(f"[FAISS] Deleted index for namespace '{namespace}'")
        deleted = True

    # 2. Delete PDF file
    pdf_path = UPLOADS_DIR / f"{namespace}.pdf"
    if pdf_path.exists():
        os.unlink(pdf_path)
        print(f"[FAISS] Deleted PDF file for namespace '{namespace}'")

    # 3. Delete DB record
    try:
        from api.models import FAISSDocument
        FAISSDocument.objects.filter(namespace=namespace).delete()
    except Exception:
        pass

    return deleted


def cleanup_old_indexes(max_age_hours: int = 48):
    """
    Delete all expired FAISS indexes (both on disk and in DB).
    Called periodically by background thread.
    """
    from django.utils import timezone
    import shutil

    deleted = []

    # DB-based cleanup (authoritative)
    try:
        from api.models import FAISSDocument
        expired = FAISSDocument.objects.filter(expires_at__lt=timezone.now())
        for doc in expired:
            idx_path = Path(doc.index_path)
            if idx_path.exists():
                shutil.rmtree(str(idx_path))
                
            if doc.file_path:
                file_path = Path(doc.file_path)
                if file_path.exists():
                    os.unlink(file_path)
                    
            deleted.append(doc.namespace)
        expired.delete()
    except Exception as e:
        print(f"[FAISS] DB cleanup error: {e}")

    # Filesystem fallback cleanup for indexes
    now = datetime.utcnow()
    for d in FAISS_INDEX_DIR.iterdir():
        if d.is_dir():
            mtime = datetime.utcfromtimestamp(d.stat().st_mtime)
            age = now - mtime
            if age > timedelta(hours=max_age_hours):
                shutil.rmtree(str(d))
                if d.name not in deleted:
                    deleted.append(d.name)
                    
    # Filesystem fallback cleanup for PDFs
    for f in UPLOADS_DIR.iterdir():
        if f.is_file() and f.suffix == '.pdf':
            mtime = datetime.utcfromtimestamp(f.stat().st_mtime)
            age = now - mtime
            if age > timedelta(hours=max_age_hours):
                os.unlink(f)

    if deleted:
        print(f"[FAISS] Auto-cleanup: removed {len(deleted)} old indexes → {deleted}")
    return deleted
