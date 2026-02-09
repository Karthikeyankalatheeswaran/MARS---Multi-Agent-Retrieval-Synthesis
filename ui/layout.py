import streamlit as st


def render_sidebar():
    """
    Renders enhanced sidebar with mode selector and file upload
    """
    with st.sidebar:
        # Header
        st.markdown("""
        <div style="text-align: center; padding: 1rem 0;">
            <h2 style="margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                ⚙️ Settings
            </h2>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Mode Selection
        st.markdown("### 🎯 Mode Selection")
        
        mode = st.radio(
            "Choose your mode:",
            ["Student Mode", "Research Mode"],
            label_visibility="collapsed",
            help="Select how you want to use MARS"
        )
        
        # Mode description
        if mode == "Student Mode":
            st.info(
                "📚 **Student Mode**\n\n"
                "Get precise answers from your uploaded study materials. "
                "Perfect for exam prep and understanding textbooks."
            )
        else:
            st.info(
                "🔬 **Research Mode**\n\n"
                "Explore academic literature, compare papers, and discover "
                "the latest research insights."
            )
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # File Upload (Student Mode)
        uploaded_file = None
        if mode == "Student Mode":
            st.markdown("### 📁 Upload Material")
            
            uploaded_file = st.file_uploader(
                "Upload your PDF",
                type=["pdf"],
                help="Upload textbooks, notes, or any study material (Max 200MB)",
                label_visibility="collapsed"
            )
            
            if uploaded_file:
                file_size = uploaded_file.size / (1024 * 1024)
                
                st.success(
                    f"✅ **File loaded**\n\n"
                    f"📄 {uploaded_file.name}\n\n"
                    f"💾 {file_size:.2f} MB"
                )
                
                # File info
                with st.expander("📊 File Details", expanded=False):
                    st.caption(f"**Filename:** {uploaded_file.name}")
                    st.caption(f"**Size:** {file_size:.2f} MB")
                    st.caption(f"**Type:** PDF Document")
            else:
                st.markdown("""
                <div style="padding: 1rem; background: rgba(102, 126, 234, 0.1); 
                    border-radius: 10px; border: 1px dashed rgba(102, 126, 234, 0.3);">
                    <p style="margin: 0; font-size: 0.85rem; text-align: center;">
                        📤 Drag & drop or click to upload
                    </p>
                </div>
                """, unsafe_allow_html=True)
        
        # Research Sources (Research Mode)
        else:
            st.markdown("### 🔍 Research Sources")
            
            sources = st.multiselect(
                "Active sources:",
                ["arXiv Papers", "Web Search", "Google Scholar"],
                default=["arXiv Papers", "Web Search"],
                label_visibility="collapsed"
            )
            
            st.caption(
                "**Enabled sources:**\n\n"
                "✓ arXiv - Academic preprints\n\n"
                "✓ Tavily - Web search\n\n"
                "○ Scholar - Coming soon"
            )
        
        st.markdown("<br>", unsafe_allow_html=True)
        st.divider()
        
        # Tips & Tricks
        with st.expander("💡 **Tips & Best Practices**", expanded=False):
            if mode == "Student Mode":
                st.markdown("""
                **Get better answers:**
                
                ✓ Upload clear, text-based PDFs
                
                ✓ Ask specific, focused questions
                
                ✓ Reference chapter/page numbers
                
                ✓ Use follow-up questions
                
                ✓ Check the grounding score
                
                **Example questions:**
                - "What is photosynthesis?"
                - "Explain Newton's second law"
                - "Summarize Chapter 3"
                """)
            else:
                st.markdown("""
                **Effective research queries:**
                
                ✓ Use technical terminology
                
                ✓ Mention specific authors/years
                
                ✓ Ask for comparisons
                
                ✓ Request state-of-the-art
                
                **Example queries:**
                - "Latest transformer architectures"
                - "Compare BERT vs GPT models"
                - "Quantum computing 2024"
                - "Papers by Yoshua Bengio"
                """)
        
        # Keyboard Shortcuts
        with st.expander("⌨️ **Keyboard Shortcuts**", expanded=False):
            st.markdown("""
            | Action | Shortcut |
            |--------|----------|
            | New message | `Enter` |
            | New line | `Shift + Enter` |
            | Clear chat | `Ctrl/Cmd + K` |
            | Focus input | `/` |
            """)
        
        st.divider()
        
        # About
        with st.expander("ℹ️ **About MARS**", expanded=False):
            st.markdown("""
            **Multi-Agent RAG System v2.0**
            
            MARS uses advanced AI agents to help you learn 
            and research more effectively.
            
            **Technology:**
            - 🤖 Claude 3.5 Sonnet
            - 🦙 Llama 3.3 70B
            - 🔍 LangGraph Orchestration
            - 📊 Pinecone Vector DB
            
            **Features:**
            - Contextual conversation
            - Source grounding
            - Multi-agent reasoning
            - PDF processing with OCR
            
            Built with ❤️ using LangChain & Streamlit
            """)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Footer
        st.markdown("""
        <div style="text-align: center; padding: 1rem; opacity: 0.6; font-size: 0.75rem;">
            MARS v2.0<br>
            Multi-Agent RAG System
        </div>
        """, unsafe_allow_html=True)
    
    return mode, uploaded_file