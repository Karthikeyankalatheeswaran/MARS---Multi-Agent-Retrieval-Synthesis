from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

from storage.pinecone_store import load_vectorstore
from core.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, GROQ_API_KEY


def build_rag_chain(namespace: str):
    """
    LangChain-native RAG pipeline (NEW API, no deprecated imports)
    """

    # -------------------------------
    # Vector Retriever
    # -------------------------------
    vectorstore = load_vectorstore(namespace)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    # -------------------------------
    # LLM
    # -------------------------------
    llm = ChatGroq(
        model="openai/gpt-oss-safeguard-120b",
        temperature=0.3,
        max_tokens=1000,
        api_key=GROQ_API_KEY
    )

    # -------------------------------
    # Prompt
    # -------------------------------
    prompt = ChatPromptTemplate.from_template(
        """
You are a study assistant.

Rules:
- Answer ONLY from the textbook context
- If not present, say: Not found in material
- Do NOT add external knowledge

<context>
{context}
</context>

Question:
{question}
"""
    )

    # -------------------------------
    # RAG Chain (Modern Runnable)
    # -------------------------------
    rag_chain = (
        {
            "context": retriever,
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain
