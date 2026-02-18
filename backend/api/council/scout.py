import time
from api.core.state import MARSState, RetrievedSource, AgentLog
from api.storage.pinecone_store import load_vectorstore


class StudentScoutAgent:
    def run(self, state: MARSState) -> MARSState:
        """Retrieves relevant chunks from uploaded PDF"""
        start = time.time()

        if state.intent in ["greeting", "feedback"]:
            return state

        if not state.namespace:
            # Check for bypass conditions (e.g. follow-up on Oracle result)
            allow_bypass = state.intent == "follow_up" and len(state.chat_history) > 0
            
            if not allow_bypass:
                state.agent_logs.append(AgentLog(
                    agent="Student Scout", icon="search", status="error",
                    duration_ms=int((time.time() - start) * 1000),
                    thinking="No namespace set — no document has been uploaded",
                    output_preview="No document uploaded. Please upload a PDF first.",
                    details={"error": "missing_namespace"}
                ))
                return state
            else:
                # Bypass retrieval, rely on history
                state.agent_logs.append(AgentLog(
                    agent="Student Scout", icon="search", status="completed",
                    duration_ms=int((time.time() - start) * 1000),
                    thinking="No document, but history exists. Skipping retrieval to rely on conversation context.",
                    output_preview="Skipped PDF search (using chat history)",
                    details={"action": "bypass_retrieval"}
                ))
                return state

        try:
            vectorstore = load_vectorstore(state.namespace)

            if state.intent == "follow_up" and len(state.chat_history) > 0:
                recent_context = state.chat_history[-1].content[:200]
                search_query = f"{recent_context} {state.user_query}"
            else:
                search_query = state.user_query

            retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
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

            elapsed = int((time.time() - start) * 1000)
            state.agent_logs.append(AgentLog(
                agent="Student Scout", icon="search", status="completed",
                duration_ms=elapsed,
                thinking=f"Searching Pinecone namespace '{state.namespace}' with query: '{search_query[:100]}...'",
                output_preview=f"Found {len(state.retrieved_sources)} relevant chunks from PDF ({elapsed}ms)",
                details={
                    "namespace": state.namespace,
                    "search_query": search_query[:200],
                    "chunks_found": len(state.retrieved_sources),
                    "total_docs_returned": len(docs),
                    "sources_preview": [s.content[:150] + "..." for s in state.retrieved_sources[:3]]
                }
            ))

        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            print(f"[Scout Error] {e}")
            state.retrieved_sources = []
            state.agent_logs.append(AgentLog(
                agent="Student Scout", icon="search", status="error",
                duration_ms=elapsed,
                thinking=f"Failed to retrieve from Pinecone: {str(e)}",
                output_preview=f"Retrieval failed: {str(e)[:100]}",
                details={"error": str(e), "namespace": state.namespace}
            ))

        return state
