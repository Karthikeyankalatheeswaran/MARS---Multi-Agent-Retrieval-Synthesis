import time
from api.core.state import MARSState, AgentLog
from api.core.llms import SCRIBE_LLM, RESEARCH_LLM


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
                    "Upload a PDF and ask me questions!\n\n"
                    "💡 **Tip:** Try asking me to *predict exam questions* by typing a subject code like `CS3401`."
                )
            else:
                state.draft_answer = (
                    "👋 Hello! I'm your **Research Assistant**.\n\n"
                    "I can help you explore academic literature across **arXiv**, **Google Scholar**, and the **web**. "
                    "Ask me about any research topic!"
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

        # ===== RESEARCH MODE (Task 3: Improved alignment) =====
        if state.mode == "research":
            source_references = ""
            source_labels = []
            for i, src in enumerate(state.retrieved_sources, 1):
                source_type = "Source"
                if hasattr(src, 'source'):
                    if src.source == "arxiv":
                        source_type = "arXiv Paper"
                    elif src.source == "google_scholar":
                        source_type = "Scholar Paper"
                    elif src.source == "web":
                        source_type = "Web Source"
                source_references += f"\n[{i}] ({source_type}) {src.content[:2000]}...\n"
                source_labels.append(source_type)

            prompt = f"""You are MARS Research Assistant. Your task is to provide a focused, well-structured research analysis.

CRITICAL RULES:
- Focus STRICTLY on what the user asked. Do NOT provide general background unless explicitly asked.
- Every major claim MUST have an inline citation [1], [2], etc.
- If sources conflict, explicitly state the disagreement.
- Use rich Markdown formatting: **bold** for key terms, bullet points with proper spacing, > blockquotes for important definitions, --- horizontal rules between sections.

FORMATTING RULES:
- Use blank lines between every section, subsection, and bullet point group
- Each bullet point should start on its own line with a dash (-) or number
- Use nested bullet points (indented with spaces) for sub-details
- Wrap important conclusions in > blockquotes
- Add horizontal rules (---) between major sections

{("Conversation History:" + chr(10) + conversation_context) if conversation_context else ""}

Retrieved Sources ({len(state.retrieved_sources)} documents from arXiv, Google Scholar, and Web):
{source_references}

User's Question:
{state.user_query}

Structure your response EXACTLY like this:

## 📌 Summary

2-3 sentence direct answer to the question with inline citations.

---

## 🔍 Key Findings

- **Finding 1** — Description with [citation number]
- **Finding 2** — Description with [citation number]
(Use 5-7 bullet points, each on its own line with spacing)

---

## 📊 Detailed Analysis

Organized analysis addressing the user's specific question. Use ### subheadings for clarity.
Use bullet points for lists, numbered steps for processes, and **bold** for key terms.

---

## ⚖️ Methodology Comparison
(Only if applicable) Compare approaches found across sources using a comparison format.

Do NOT add a References section — it is automatically appended."""

            try:
                response = RESEARCH_LLM.invoke(prompt)
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
                            source_type = paper.get('source_type', 'research')

                            type_emoji = "📄"
                            if source_type == "arxiv":
                                type_emoji = "🔬"
                            elif source_type == "google_scholar":
                                type_emoji = "🎓"
                            elif source_type == "web":
                                type_emoji = "🌐"

                            refs += f"{type_emoji} **[{i}]** "
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
                            refs += f"🌐 **[{i}]** [{src.url}]({src.url})\n\n"
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

        # ===== STUDENT MODE (Task 4: Anti-hallucination, structured output) =====
        prompt = f"""You are an expert University Professor answering a student's question STRICTLY from the provided textbook material.

CRITICAL RULES (MUST FOLLOW):
1. Answer ONLY based on the provided textbook content. NEVER add external knowledge.
2. If the textbook does NOT cover the topic, say: "This topic is not covered in the uploaded material."
3. After each major claim, add a page citation like [Page X] where X is the source page number.
4. Use the EXACT section headers shown below.

FORMATTING RULES (MUST FOLLOW):
- Use **bold** for ALL vocabulary terms and key phrases
- Use > blockquotes for formal definitions
- Use bullet points (-) with blank lines between them for readability
- Use numbered lists (1. 2. 3.) for sequential steps or processes
- Add blank lines between every section and paragraph
- Use --- horizontal rules between major sections
- Use nested bullet points for sub-details

{("Recent Conversation:" + chr(10) + conversation_context) if conversation_context else ""}

Textbook Content (with page numbers):
{state.refined_context}

Student Question:
{state.user_query}

REQUIRED FORMAT:

## 📖 Core Concept

A direct, concise answer or definition in 2-3 sentences. Include [Page X] citations.

> **Key Definition:** Quote the most important definition directly from the text.

---

## 🔎 Detailed Explanation

Break down the "How" and "Why" step-by-step:

1. **First step** — explanation [Page X]
2. **Second step** — explanation [Page X]
3. **Third step** — explanation [Page X]

Add bullet points for additional details:

- **Point 1** — Detail
- **Point 2** — Detail

---

## 💡 Examples

Concrete examples from the text. If the text provides examples, use those. If not, create analogous ones and mark them as "[Illustrative example]".

---

## ✅ Key Takeaways

- **Takeaway 1** — One sentence summary
- **Takeaway 2** — One sentence summary
- **Takeaway 3** — One sentence summary

(3-5 bullet points, each starting with a bold keyword)"""

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
                agent="Scribe", icon="edit", status="error",
                duration_ms=elapsed,
                thinking=f"LLM invocation failed: {str(e)}",
                output_preview=f"Error: {str(e)[:100]}",
                details={"error": str(e)}
            ))

        return state
