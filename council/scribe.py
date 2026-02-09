from core.state import MARSState
from core.llms import SCRIBE_LLM


class ScribeAgent:
    def run(self, state: MARSState) -> MARSState:
        """
        Generates final answer with inline citations and references
        """
        
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
            return state
        
        # ===== FEEDBACK =====
        if state.intent == "feedback":
            state.draft_answer = (
                "Glad I could help! 😊\n\n"
                "Feel free to ask follow-up questions or explore new topics."
            )
            return state
        
        # ===== NO CONTENT FOUND =====
        if not state.refined_context:
            if state.mode == "student":
                state.draft_answer = (
                    "❌ **Not found in material.**\n\n"
                    "I couldn't find relevant information in your uploaded document. "
                    "Try rephrasing your question or check if the topic is covered."
                )
            else:
                state.draft_answer = (
                    "❌ **No research papers found.**\n\n"
                    "I couldn't find relevant research papers for this query.\n\n"
                    "**Try:**\n"
                    "- Using different keywords\n"
                    "- Being more specific with technical terms\n"
                    "- Checking spelling and formatting"
                )
            return state
        
        # ===== BUILD CONVERSATION CONTEXT =====
        conversation_context = ""
        if len(state.chat_history) > 0:
            conversation_context = "\n".join(
                f"{m.role.upper()}: {m.content}"
                for m in state.chat_history[-6:]
            )
        
        # ===== RESEARCH MODE (Enhanced with Citations) =====
        if state.mode == "research":
            # Build numbered source references for the prompt
            source_references = ""
            for i, src in enumerate(state.retrieved_sources, 1):
                source_references += f"\n[{i}] {src.content[:1500]}...\n"
            
            prompt = f"""
You are a research assistant helping explore academic literature.

{"Conversation History:" if conversation_context else ""}
{conversation_context}

Retrieved Research Content:
{source_references}

Current Question:
{state.user_query}

Instructions:
- Synthesize insights from the research papers
- Use inline citations like [1], [2] to reference sources
- Cite multiple sources where appropriate [1, 2]
- Maintain conversation continuity
- Compare methodologies when relevant
- Be concise but informative
- DO NOT include a reference list at the end - I will add it separately

Example format:
"Recent advances in transformer architectures [1] have shown significant improvements. The attention mechanism [2, 3] enables..."

Answer:
"""
            
            try:
                response = SCRIBE_LLM.invoke(prompt)
                answer = response.content
                
                # ===== BUILD FORMATTED REFERENCE LIST =====
                if state.papers_metadata or state.retrieved_sources:
                    refs = "\n\n---\n\n## 📚 References\n\n"
                    
                    # Track which sources we've cited
                    cited_sources = set()
                    
                    # First, add arXiv papers with full metadata
                    if state.papers_metadata:
                        for i, paper in enumerate(state.papers_metadata, 1):
                            title = paper.get('title', 'Untitled')
                            authors = paper.get('authors', 'Unknown Authors')
                            year = paper.get('year', 'N/A')
                            url = paper.get('url', '')
                            
                            # Format citation
                            refs += f"**[{i}]** "
                            
                            if url:
                                refs += f"[{title}]({url})\n\n"
                            else:
                                refs += f"{title}\n\n"
                            
                            # Add authors and year
                            refs += f"   *{authors}* ({year})\n\n"
                            
                            cited_sources.add(i)
                    
                    # Then add web sources
                    web_index = len(state.papers_metadata) if state.papers_metadata else 0
                    for i, src in enumerate(state.retrieved_sources, web_index + 1):
                        # Skip if already added (from papers_metadata)
                        if i in cited_sources:
                            continue
                        
                        # Only add web sources
                        if src.source == "web" and src.url:
                            refs += f"**[{i}]** [{src.url}]({src.url})\n\n"
                            refs += f"   *Web Source*\n\n"
                    
                    answer += refs
                
                state.draft_answer = answer
                
            except Exception as e:
                print(f"[Scribe Error] {e}")
                state.draft_answer = "Error generating response. Please try again."
            
            return state
        
        # ===== STUDENT MODE =====
        prompt = f"""
You are a university study assistant helping students learn from their textbooks.

{"Recent Conversation:" if conversation_context else ""}
{conversation_context}

Textbook Content:
{state.refined_context}

Student Question:
{state.user_query}

Instructions:
- Answer ONLY from the textbook content
- Be clear and pedagogical
- Use examples from the material when available
- Maintain conversation flow (don't repeat previous answers unless asked)
- If it's a follow-up, build on the previous discussion
- Format for readability with proper paragraphs
- Use bullet points sparingly and only when listing items

Answer:
"""
        
        try:
            response = SCRIBE_LLM.invoke(prompt)
            state.draft_answer = response.content
        except Exception as e:
            print(f"[Scribe Error] {e}")
            state.draft_answer = "Error generating response. Please try again."
        
        return state