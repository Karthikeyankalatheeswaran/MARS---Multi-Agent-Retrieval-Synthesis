from typing import List, Optional
from pinecone import Pinecone, ServerlessSpec
from langchain_community.vectorstores import Pinecone as PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

from core.config import (
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
)

# =========================================
# Initialize Pinecone Client
# =========================================
pc = Pinecone(api_key=PINECONE_API_KEY)

# =========================================
# Ensure Index Exists (idempotent)
# =========================================
def ensure_index_exists():
    """Create index if it doesn't exist"""
    try:
        existing_indexes = [idx.name for idx in pc.list_indexes()]
        
        if PINECONE_INDEX_NAME not in existing_indexes:
            print(f"[Pinecone] Creating index: {PINECONE_INDEX_NAME}")
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1536,  # text-embedding-3-small
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

# Call on import
ensure_index_exists()

# =========================================
# Embeddings Model
# =========================================
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base=OPENROUTER_BASE_URL,
)

# =========================================
# Vector Store Operations
# =========================================

def create_vectorstore(
    documents: List[Document], 
    namespace: str
) -> Optional[PineconeVectorStore]:
    """
    Create vectorstore from documents in a specific namespace
    """
    # Validate documents
    valid_docs = [
        doc for doc in documents
        if doc.page_content and len(doc.page_content.strip()) > 50
    ]
    
    if not valid_docs:
        print("[Pinecone] No valid documents to embed")
        return None
    
    # Extract texts and metadata
    texts = [doc.page_content for doc in valid_docs]
    metadatas = [doc.metadata for doc in valid_docs]
    
    try:
        print(f"[Pinecone] Embedding {len(texts)} documents in namespace: {namespace}")
        
        vectorstore = PineconeVectorStore.from_texts(
            texts=texts,
            embedding=embeddings,
            index_name=PINECONE_INDEX_NAME,
            namespace=namespace,
            metadatas=metadatas
        )
        
        print(f"[Pinecone] Successfully created vectorstore")
        return vectorstore
        
    except Exception as e:
        print(f"[Pinecone] Error creating vectorstore: {e}")
        return None


def load_vectorstore(namespace: str) -> PineconeVectorStore:
    """
    Load existing vectorstore from namespace
    """
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
    """
    Delete all vectors in a namespace
    """
    try:
        index = pc.Index(PINECONE_INDEX_NAME)
        index.delete(delete_all=True, namespace=namespace)
        print(f"[Pinecone] Deleted namespace: {namespace}")
        return True
        
    except Exception as e:
        # Namespace might not exist - that's okay
        print(f"[Pinecone] Delete namespace warning: {e}")
        return False


def check_namespace_exists(namespace: str) -> bool:
    """
    Check if a namespace has vectors
    """
    try:
        index = pc.Index(PINECONE_INDEX_NAME)
        stats = index.describe_index_stats()
        
        namespace_stats = stats.get('namespaces', {})
        return namespace in namespace_stats and namespace_stats[namespace]['vector_count'] > 0
        
    except Exception as e:
        print(f"[Pinecone] Check namespace error: {e}")
        return False