from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

from api.storage.faiss_store import load_faiss_index
from api.core.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, GROQ_API_KEY


def build_rag_chain(namespace: str):
    """
    LangChain-native RAG pipeline
    """
    vectorstore = load_faiss_index(namespace)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    llm = ChatGroq(
        model="openai/gpt-oss-safeguard-120b",
        temperature=0.3,
        max_tokens=1000,
        api_key=GROQ_API_KEY
    )

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
