import time
from api.core.state import MARSState, AgentLog
from api.core.llms import SCRIBE_LLM


class ScribeAgent:
    def run(self, state: MARSState) -> MARSState:
        """Generates final answer with inline citations and references"""
        start = time.time()

        # ===== GREETING =====
        if state.intent == "greeting":
            if state.mode == "student":
                state.draft_answer = (
                    "👋 Hello! I'm your **Student Study Assistant**.\n\n"
                    "I help you learn from your textbooks and notes. "
                    "Upload a PDF and ask me questions!"
                )
            else:
                state.draft_answer = (
                    "👋 Hello! I'm your **Research Assistant**.\n\n"
                    "I can help you explore academic literature, compare papers, "
                    "and discover research insights. Ask me about any research topic!"
                )
            state.agent_logs.append(AgentLog(
                agent="Scribe", icon="edit", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking="Generating greeting response",
                output_preview=state.draft_answer[:100],
            ))
            return state

        # ===== FEEDBACK =====
        if state.intent == "feedback":
            state.draft_answer = (
                "Glad I could help!\n\n"
                "Feel free to ask follow-up questions or explore new topics."
            )
            state.agent_logs.append(AgentLog(
                agent="Scribe", icon="edit", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking="Generating feedback acknowledgment",
                output_preview=state.draft_answer[:100],
            ))
            return state

        # ===== NO CONTENT FOUND =====
        if not state.refined_context:
            if state.mode == "student":
                state.draft_answer = (
                    "**Not found in material.**\n\n"
                    "I couldn't find relevant information in your uploaded document. "
                    "Try rephrasing your question or check if the topic is covered."
                )
            else:
                state.draft_answer = (
                    "**No research papers found.**\n\n"
                    "I couldn't find relevant research papers for this query.\n\n"
                    "**Try:**\n"
                    "- Using different keywords\n"
                    "- Being more specific with technical terms\n"
                    "- Checking spelling and formatting"
                )
            state.agent_logs.append(AgentLog(
                agent="Scribe", icon="edit", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking="No refined context available — generating fallback message",
                output_preview="No content found in sources",
            ))
            return state

        # ===== BUILD CONVERSATION CONTEXT =====
        conversation_context = ""
        if len(state.chat_history) > 0:
            conversation_context = "\n".join(
                f"{m.role.upper()}: {m.content}"
                for m in state.chat_history[-6:]
            )

        # ===== RESEARCH MODE =====
        if state.mode == "research":
            source_references = ""
            for i, src in enumerate(state.retrieved_sources, 1):
                source_references += f"\n[{i}] {src.content[:1500]}...\n"

            prompt = f"""
You are an advanced Research Assistant, designed to produce state-of-the-art, academic-quality reports.

{"Conversation History:" if conversation_context else ""}
{conversation_context}

Retrieved Research Content:
{source_references}

Current Question:
{state.user_query}

Instructions:
1. **Structure**: Organize your response using clear Markdown headers (##, ###).
   - **Executive Summary**: A concise 2-3 sentence overview.
   - **Key Findings**: Bullet points distinguishing between consensus and debate.
   - **Deep Dive**: Detailed synthesis of the retrieved content.
   - **Methodology (if applicable)**: Compare approaches found in the papers.
2. **Citations**: STRICTLY use inline citations [1], [2] to reference the provided content.
3. **Tone**: Objective, professional, and analytical.
4. **Formatting**: Use bolding for key terms, tables for comparisons if relevant, and distinct paragraphs.
5. **Constraint**: Do NOT include a "References" section at the end; this is handled automatically.

Answer:
"""

            try:
                response = SCRIBE_LLM.invoke(prompt)
                answer = response.content

                if state.papers_metadata or state.retrieved_sources:
                    refs = "\n\n---\n\n## 📚 References\n\n"
                    cited_sources = set()

                    if state.papers_metadata:
                        for i, paper in enumerate(state.papers_metadata, 1):
                            title = paper.get('title', 'Untitled')
                            authors = paper.get('authors', 'Unknown Authors')
                            year = paper.get('year', 'N/A')
                            url = paper.get('url', '')

                            refs += f"**[{i}]** "
                            if url:
                                refs += f"[{title}]({url})\n\n"
                            else:
                                refs += f"{title}\n\n"
                            refs += f"   *{authors}* ({year})\n\n"
                            cited_sources.add(i)

                    web_index = len(state.papers_metadata) if state.papers_metadata else 0
                    for i, src in enumerate(state.retrieved_sources, web_index + 1):
                        if i in cited_sources:
                            continue
                        if src.source == "web" and src.url:
                            refs += f"**[{i}]** [{src.url}]({src.url})\n\n"
                            refs += f"   *Web Source*\n\n"

                    answer += refs

                state.draft_answer = answer

                elapsed = int((time.time() - start) * 1000)
                state.agent_logs.append(AgentLog(
                    agent="Scribe", icon="edit", status="completed",
                    duration_ms=elapsed,
                    thinking=f"Generated research answer using {len(state.retrieved_sources)} sources with inline citations",
                    output_preview=f"Answer: {len(answer)} chars with {len(state.papers_metadata or [])} paper references ({elapsed}ms)",
                    details={
                        "answer_length": len(answer),
                        "papers_cited": len(state.papers_metadata or []),
                        "mode": "research"
                    }
                ))

            except Exception as e:
                elapsed = int((time.time() - start) * 1000)
                print(f"[Scribe Error] {e}")
                state.draft_answer = f"Error generating response: {str(e)}"
                state.agent_logs.append(AgentLog(
                    agent="Scribe", icon="edit", status="error",
                    duration_ms=elapsed,
                    thinking=f"LLM invocation failed: {str(e)}",
                    output_preview=f"Error: {str(e)[:100]}",
                    details={"error": str(e)}
                ))

            return state

        # ===== STUDENT MODE =====
        prompt = f"""
You are an expert University Tutor/Professor. Your goal is to explain complex concepts from the provided textbook material with absolute clarity and structure.

{"Recent Conversation:" if conversation_context else ""}
{conversation_context}

Textbook Content:
{state.refined_context}

Student Question:
{state.user_query}

Instructions:
1. **Goal**: Explain the concept step-by-step, ensuring deep understanding.
2. **Structure**:
   - **## Core Concept**: A direct answer/definition.
   - **## Detailed Explanation**: Break down the "How" and "Why".
   - **## Examples**: Use concrete examples from the text (or analogous ones) to illustrate.
   - **## Key Takeaways**: A bulleted summary of what to remember.
3. **formatting**: Use **bold** for vocabulary terms, list items for steps, and blockquotes for key definitions.
4. **Constraint**: Answer ONLY based on the provided textbook content.

Answer:
"""

        try:
            response = SCRIBE_LLM.invoke(prompt)
            state.draft_answer = response.content

            elapsed = int((time.time() - start) * 1000)
            state.agent_logs.append(AgentLog(
                agent="Scribe", icon="edit", status="completed",
                duration_ms=elapsed,
                thinking=f"Generated student mode answer from {len(state.refined_context)} chars of textbook content",
                output_preview=f"Answer: {len(state.draft_answer)} chars ({elapsed}ms)",
                details={
                    "answer_length": len(state.draft_answer),
                    "context_length": len(state.refined_context),
                    "mode": "student"
                }
            ))
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            print(f"[Scribe Error] {e}")
            state.draft_answer = f"Error generating response: {str(e)}"
            state.agent_logs.append(AgentLog(
                agent="Scribe", icon="✍️", status="error",
                duration_ms=elapsed,
                thinking=f"LLM invocation failed: {str(e)}",
                output_preview=f"⚠️ Error: {str(e)[:100]}",
                details={"error": str(e)}
            ))

        return state
