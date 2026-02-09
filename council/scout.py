from core.state import MARSState, RetrievedSource
from storage.pinecone_store import load_vectorstore


class StudentScoutAgent:
    def run(self, state: MARSState) -> MARSState:
        """
        Retrieves relevant chunks from uploaded PDF
        """
        # Skip retrieval for greetings/feedback
        if state.intent in ["greeting", "feedback"]:
            return state
        
        # For follow-ups, we might want to retrieve again with context
        try:
            vectorstore = load_vectorstore(state.namespace)
            
            # Build contextualized query for follow-ups
            if state.intent == "follow_up" and len(state.chat_history) > 0:
                recent_context = state.chat_history[-1].content[:200]
                search_query = f"{recent_context} {state.user_query}"
            else:
                search_query = state.user_query
            
            retriever = vectorstore.as_retriever(
                search_kwargs={"k": 5}
            )
            
            docs = retriever.invoke(search_query)
            
            state.retrieved_sources = [
                RetrievedSource(
                    content=d.page_content,
                    source="PDF",
                    page=d.metadata.get("page")
                )
                for d in docs
                if d.page_content and len(d.page_content.strip()) > 50
            ]
            
        except Exception as e:
            print(f"[Scout Error] {e}")
            state.retrieved_sources = []
        
        return state