from typing import List, Optional
from langchain_core.documents import Document

from api.core.config import (
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
)

# Lazy-initialized globals
_pc = None
_embeddings = None


def _get_pinecone_client():
    global _pc
    if _pc is None:
        from pinecone import Pinecone as PineconeClient
        _pc = PineconeClient(api_key=PINECONE_API_KEY)
    return _pc


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_openai import OpenAIEmbeddings
        _embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=OPENROUTER_API_KEY,
            openai_api_base=OPENROUTER_BASE_URL,
        )
    return _embeddings


def ensure_index_exists():
    """Create index if it doesn't exist"""
    try:
        from pinecone import ServerlessSpec
        pc = _get_pinecone_client()
        existing_indexes = [idx.name for idx in pc.list_indexes()]
        if PINECONE_INDEX_NAME not in existing_indexes:
            print(f"[Pinecone] Creating index: {PINECONE_INDEX_NAME}")
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            print("[Pinecone] Index created successfully")
        else:
            print(f"[Pinecone] Index {PINECONE_INDEX_NAME} already exists")
    except Exception as e:
        print(f"[Pinecone] Error ensuring index: {e}")
        raise


def create_vectorstore(documents: List[Document], namespace: str):
    from langchain_community.vectorstores import Pinecone as PineconeVectorStore

    ensure_index_exists()
    embeddings = _get_embeddings()

    valid_docs = [
        doc for doc in documents
        if doc.page_content and len(doc.page_content.strip()) > 50
    ]

    if not valid_docs:
        print("[Pinecone] No valid documents to embed")
        return None

    texts = [doc.page_content for doc in valid_docs]
    metadatas = [doc.metadata for doc in valid_docs]

    print(f"[Pinecone] Embedding {len(texts)} documents in namespace: {namespace}")
    vectorstore = PineconeVectorStore.from_texts(
        texts=texts,
        embedding=embeddings,
        index_name=PINECONE_INDEX_NAME,
        namespace=namespace,
        metadatas=metadatas,
        batch_size=64
    )
    print(f"[Pinecone] Successfully created vectorstore")
    return vectorstore


def load_vectorstore(namespace: str):
    from langchain_community.vectorstores import Pinecone as PineconeVectorStore

    embeddings = _get_embeddings()
    try:
        vectorstore = PineconeVectorStore.from_existing_index(
            index_name=PINECONE_INDEX_NAME,
            embedding=embeddings,
            namespace=namespace
        )
        return vectorstore
    except Exception as e:
        print(f"[Pinecone] Error loading vectorstore: {e}")
        raise


def delete_namespace(namespace: str) -> bool:
    try:
        pc = _get_pinecone_client()
        index = pc.Index(PINECONE_INDEX_NAME)
        index.delete(delete_all=True, namespace=namespace)
        print(f"[Pinecone] Deleted namespace: {namespace}")
        return True
    except Exception as e:
        print(f"[Pinecone] Delete namespace warning: {e}")
        return False


def check_namespace_exists(namespace: str) -> bool:
    try:
        pc = _get_pinecone_client()
        index = pc.Index(PINECONE_INDEX_NAME)
        stats = index.describe_index_stats()
        namespace_stats = stats.get('namespaces', {})
        return namespace in namespace_stats and namespace_stats[namespace]['vector_count'] > 0
    except Exception as e:
        print(f"[Pinecone] Check namespace error: {e}")
        return False
