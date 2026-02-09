import streamlit as st
import os
import tempfile
import time
import uuid
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

from core.state import MARSState, ChatMessage
from graph.workflow import build_graph
from ui.layout import render_sidebar

from storage.pdf_loader import load_pdf
from storage.chunker import chunk_documents
from storage.pinecone_store import create_vectorstore, delete_namespace
from utils.export import export_answer_to_pdf

# =========================================
# Environment Setup
# =========================================
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TRANSFORMERS_NO_FLAX"] = "1"

# =========================================
# Page Config
# =========================================
st.set_page_config(
    page_title="MARS - Multi-Agent RAG System",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =========================================
# Custom CSS - Theme-Aware
# =========================================
st.markdown("""
<style>
    /* Import fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Global overrides */
    * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Hide default Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Main container */
    .main {
        padding: 1rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    /* Header */
    .main-header {
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 0.25rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .subtitle {
        font-size: 0.9rem;
        opacity: 0.7;
        margin-bottom: 2rem;
    }
    
    /* Mode badges */
    .mode-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.875rem;
        gap: 0.5rem;
        transition: all 0.2s ease;
    }
    
    .student-mode {
        background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%);
        border: 1.5px solid #667eea44;
        color: #667eea;
    }
    
    .research-mode {
        background: linear-gradient(135deg, #f093fb22 0%, #f5576c22 100%);
        border: 1.5px solid #f093fb44;
        color: #f093fb;
    }
    
    /* Status indicators */
    .status-indicator {
        display: inline-flex;
        align-items: center;
        padding: 0.4rem 0.9rem;
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 500;
        gap: 0.4rem;
    }
    
    /* Chat messages - Claude style */
    .stChatMessage {
        padding: 1.5rem 1rem !important;
        border-radius: 12px !important;
        margin-bottom: 1rem !important;
        border: 1px solid transparent !important;
    }
    
    /* User message */
    [data-testid="stChatMessageContent"] {
        font-size: 0.95rem;
        line-height: 1.6;
    }
    
    /* Assistant message styling */
    .stChatMessage[data-testid*="assistant"] {
        background: var(--assistant-bg) !important;
        border-color: var(--assistant-border) !important;
    }
    
    /* User message styling */
    .stChatMessage[data-testid*="user"] {
        background: var(--user-bg) !important;
        border-color: var(--user-border) !important;
    }
    
    /* Light theme variables */
    :root {
        --assistant-bg: #f8f9fa;
        --assistant-border: #e9ecef;
        --user-bg: #ffffff;
        --user-border: #dee2e6;
        --expander-bg: #f8f9fa;
        --expander-border: #e9ecef;
    }
    
    /* Dark theme variables */
    @media (prefers-color-scheme: dark) {
        :root {
            --assistant-bg: #1e1e1e;
            --assistant-border: #2d2d2d;
            --user-bg: #0d1117;
            --user-border: #21262d;
            --expander-bg: #161b22;
            --expander-border: #21262d;
        }
    }
    
    /* Chat input */
    .stChatInputContainer {
        border-radius: 12px !important;
        border: 2px solid #e9ecef !important;
        transition: all 0.2s ease;
    }
    
    .stChatInputContainer:focus-within {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }
    
    /* Buttons */
    .stButton button {
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.2s ease;
        border: none;
    }
    
    .stButton button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    /* Expanders */
    .stExpander {
        background: var(--expander-bg);
        border-radius: 12px;
        border: 1px solid var(--expander-border);
        margin-bottom: 1rem;
    }
    
    .stExpander summary {
        font-weight: 600;
        padding: 1rem;
    }
    
    /* Progress bars */
    .stProgress > div > div {
        border-radius: 10px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }
    
    /* Metrics */
    [data-testid="stMetricValue"] {
        font-size: 1.5rem;
        font-weight: 700;
        color: #667eea;
    }
    
    /* Dividers */
    hr {
        margin: 2rem 0;
        border: none;
        height: 1px;
        background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(102, 126, 234, 0.3) 50%, 
            transparent 100%);
    }
    
    /* Status messages */
    .status-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.9rem;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Loading animation */
    .loading-dots::after {
        content: '...';
        animation: dots 1.5s steps(4, end) infinite;
    }
    
    @keyframes dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
    }
    
    /* Smooth scrolling */
    html {
        scroll-behavior: smooth;
    }
    
    /* File uploader */
    [data-testid="stFileUploader"] {
        border-radius: 12px;
        border: 2px dashed #e9ecef;
        transition: all 0.2s ease;
    }
    
    [data-testid="stFileUploader"]:hover {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.05);
    }
    
    /* Toast notifications */
    .stAlert {
        border-radius: 12px;
        border: none;
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
        /* Citation cards */
    .citation-card {
        background: var(--expander-bg);
        border: 1px solid var(--expander-border);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.2s ease;
    }
    
    .citation-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }
    
    .citation-number {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.1rem;
    }
    
    .source-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 0.5rem;
    }
    
    .arxiv-badge {
        background: #b31b1b;
        color: white;
    }
    
    .web-badge {
        background: #4285f4;
        color: white;
    }
    
    /* Link buttons in citations */
    .stLinkButton button {
        font-size: 0.85rem;
        padding: 0.4rem 0.8rem;
    }
```
</style>
""", unsafe_allow_html=True)

# =========================================
# Session State Initialization
# =========================================
if "messages" not in st.session_state:
    st.session_state.messages = []

if "final_state" not in st.session_state:
    st.session_state.final_state = None

if "namespace" not in st.session_state:
    st.session_state.namespace = str(uuid.uuid4())

if "indexed_file" not in st.session_state:
    st.session_state.indexed_file = None

# =========================================
# Sidebar
# =========================================
mode, uploaded_file = render_sidebar()

# =========================================
# Header Section
# =========================================
st.markdown('<div class="main-header">MARS</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Multi-Agent Retrieval-Augmented System</div>', unsafe_allow_html=True)

# =========================================
# Status Bar
# =========================================
col1, col2, col3 = st.columns([2, 5, 2])

with col1:
    if mode == "Student Mode":
        st.markdown(
            '<div class="mode-badge student-mode">🎓 Student Mode</div>',
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            '<div class="mode-badge research-mode">🔬 Research Mode</div>',
            unsafe_allow_html=True
        )

with col2:
    if mode == "Student Mode":
        if uploaded_file:
            file_size = uploaded_file.size / (1024 * 1024)
            st.success(f"📘 **{uploaded_file.name}** ({file_size:.1f} MB)")
        else:
            st.info("📘 Upload a PDF to get started")
    else:
        st.info("🔍 Searching: arXiv Papers • Web Articles • Research Databases")

with col3:
    if st.button("🗑️ Clear", type="secondary", use_container_width=True, help="Clear chat history"):
        if st.session_state.namespace:
            delete_namespace(st.session_state.namespace)
        st.session_state.namespace = str(uuid.uuid4())
        st.session_state.messages = []
        st.session_state.final_state = None
        st.session_state.indexed_file = None
        st.rerun()

st.markdown("<br>", unsafe_allow_html=True)

# =========================================
# PDF Processing (Student Mode)
# =========================================
if mode == "Student Mode" and uploaded_file:
    if st.session_state.indexed_file != uploaded_file.name:
        with st.status("🔄 Processing document...", expanded=True) as status:
            try:
                # Load PDF
                status.update(label="📄 Reading PDF...")
                documents = load_pdf(uploaded_file)
                time.sleep(0.3)
                
                # Chunk
                status.update(label=f"✂️ Chunking {len(documents)} pages...")
                chunks = chunk_documents(documents)
                time.sleep(0.3)
                
                # Embed
                status.update(label=f"🧠 Creating embeddings for {len(chunks)} chunks...")
                create_vectorstore(chunks, namespace=st.session_state.namespace)
                
                st.session_state.indexed_file = uploaded_file.name
                status.update(
                    label="✅ Document ready for questions!",
                    state="complete"
                )
                time.sleep(0.5)
                
            except Exception as e:
                status.update(
                    label=f"❌ Processing failed: {str(e)}",
                    state="error"
                )
                st.error("⚠️ Could not process this PDF. Please ensure it's a valid, text-based document.")
                st.stop()

# =========================================
# Chat Container
# =========================================
chat_container = st.container()

with chat_container:
    # Display chat history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

# =========================================
# Chat Input
# =========================================
user_input = st.chat_input(
    "💬 Ask about research papers..." if mode == "Research Mode"
    else "💬 Ask a question about your material..."
)

if user_input:
    # Guard: Student mode requires PDF
    if mode == "Student Mode" and not uploaded_file:
        with st.chat_message("assistant"):
            st.markdown(
                "👋 **Welcome to Student Mode!**\n\n"
                "To get started, please upload your textbook or study notes using the sidebar. "
                "Once uploaded, I'll help you understand and learn from the material."
            )
        st.stop()
    
    # Add user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    
    with st.chat_message("user"):
        st.markdown(user_input)
    
    # Process with assistant
    with st.chat_message("assistant"):
        # Create placeholders
        thinking_placeholder = st.empty()
        response_placeholder = st.empty()
        
        # Thinking animation
        thinking_placeholder.markdown(
            '<div class="status-message">🤔 <span class="loading-dots">Thinking</span></div>',
            unsafe_allow_html=True
        )
        
        # Build graph
        graph = build_graph()
        
        # Prepare state
        chat_history = [
            ChatMessage(role=m["role"], content=m["content"])
            for m in st.session_state.messages[:-1]
        ]
        
        state = MARSState(
            user_query=user_input,
            mode="student" if mode == "Student Mode" else "research",
            namespace=st.session_state.namespace,
            chat_history=chat_history
        )
        
        try:
            # Execute graph
            thinking_placeholder.markdown(
                '<div class="status-message">🔍 <span class="loading-dots">Searching</span></div>',
                unsafe_allow_html=True
            )
            
            final_state_dict = graph.invoke(state)
            final_state = MARSState(**final_state_dict)
            st.session_state.final_state = final_state
            
            # Clear thinking indicator
            thinking_placeholder.empty()
            
            # Display answer with typing effect simulation
            answer = final_state.draft_answer
            response_placeholder.markdown(answer)
            
            # Store assistant message
            st.session_state.messages.append({
                "role": "assistant",
                "content": answer
            })
            
        except Exception as e:
            thinking_placeholder.empty()
            error_msg = f"⚠️ **Something went wrong**\n\n{str(e)}\n\nPlease try again or rephrase your question."
            response_placeholder.error(error_msg)
            st.session_state.messages.append({
                "role": "assistant",
                "content": "I encountered an error. Please try again."
            })

# =========================================
# Evidence & Export Panel (Student Mode)
# =========================================
if st.session_state.final_state and mode == "Student Mode" and len(st.session_state.messages) > 0:
    fs = st.session_state.final_state
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Evidence section
    with st.expander("📊 **Answer Quality & Evidence**", expanded=False):
        if fs.grounding_score is not None:
            col1, col2 = st.columns([1, 2])
            
            with col1:
                st.metric("Grounding Score", f"{fs.grounding_score:.0f}%")
                st.progress(fs.grounding_score / 100)
            
            with col2:
                if fs.grounding_score >= 80:
                    st.success("✅ **High confidence** - Answer is well-supported by the material")
                elif fs.grounding_score >= 60:
                    st.info("ℹ️ **Moderate confidence** - Answer has partial support")
                else:
                    st.warning("⚠️ **Low confidence** - Limited support in the material")
                
                if fs.critic_reason:
                    st.caption(f"*{fs.critic_reason}*")
        
        st.divider()
        
        # Sources
        if fs.retrieved_sources:
            st.markdown("**📚 Source Evidence:**")
            for i, src in enumerate(fs.retrieved_sources[:3], 1):
                with st.container():
                    st.markdown(f"**Source {i}** • Page {src.page}")
                    st.caption(src.content[:500] + ("..." if len(src.content) > 500 else ""))
                    if i < len(fs.retrieved_sources[:3]):
                        st.markdown("<br>", unsafe_allow_html=True)
    
    # Export options
    with st.expander("📥 **Export & Share**", expanded=False):
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("📄 Export as PDF", use_container_width=True, type="primary"):
                with st.spinner("Generating PDF..."):
                    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                    success = export_answer_to_pdf(
                        tmp.name,
                        fs.user_query,
                        fs.draft_answer,
                        fs.retrieved_sources
                    )
                    
                    if success:
                        with open(tmp.name, "rb") as f:
                            st.download_button(
                                "⬇️ Download PDF",
                                f,
                                file_name=f"MARS_QA_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                                mime="application/pdf",
                                use_container_width=True
                            )
                            st.success("✅ PDF ready for download!")
        
        with col2:
            # Copy to clipboard button (simulated)
            if st.button("📋 Copy Answer", use_container_width=True):
                st.info("💡 Use Ctrl+C (Cmd+C on Mac) to copy the answer above")

# =========================================
# Research Citations (Research Mode) - ENHANCED
# =========================================
if st.session_state.final_state and mode == "Research Mode" and len(st.session_state.messages) > 0:
    fs = st.session_state.final_state
    
    if fs.papers_metadata and len(fs.papers_metadata) > 0:
        st.markdown("<br>", unsafe_allow_html=True)
        
        with st.expander("📚 **Research Papers & Citations**", expanded=True):
            st.markdown("### Sources Used")
            st.caption(f"*Found {len(fs.papers_metadata)} relevant sources*")
            
            st.markdown("<br>", unsafe_allow_html=True)
            
            # Display each paper
            for paper in fs.papers_metadata:
                idx = paper.get('index', 0)
                source_type = paper.get('source_type', 'unknown')
                
                # Create a card for each paper
                with st.container():
                    # Citation number and type badge
                    col1, col2 = st.columns([1, 10])
                    
                    with col1:
                        st.markdown(
                            f'<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); '
                            f'color: white; width: 40px; height: 40px; border-radius: 10px; '
                            f'display: flex; align-items: center; justify-content: center; '
                            f'font-weight: 700; font-size: 1.1rem;">{idx}</div>',
                            unsafe_allow_html=True
                        )
                    
                    with col2:
                        # Paper title with link
                        title = paper.get('title', 'Untitled')
                        url = paper.get('url', '')
                        
                        if url:
                            st.markdown(f"### [{title}]({url})")
                        else:
                            st.markdown(f"### {title}")
                        
                        # Authors and year
                        authors = paper.get('authors', 'Unknown')
                        year = paper.get('year', 'N/A')
                        
                        # Source badge
                        if source_type == "arxiv":
                            badge_color = "#b31b1b"
                            badge_text = "arXiv"
                        elif source_type == "web":
                            badge_color = "#4285f4"
                            badge_text = "Web"
                        else:
                            badge_color = "#666"
                            badge_text = "Article"
                        
                        st.markdown(
                            f'<span style="background: {badge_color}; color: white; '
                            f'padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; '
                            f'font-weight: 600; margin-right: 0.5rem;">{badge_text}</span>'
                            f'<span style="color: #666; font-size: 0.9rem;">{authors} • {year}</span>',
                            unsafe_allow_html=True
                        )
                        
                        # Summary/Abstract
                        summary = paper.get('summary', '')
                        if summary:
                            st.caption(f"*{summary}*")
                        
                        # Action buttons
                        col_a, col_b, col_c = st.columns([2, 2, 6])
                        
                        with col_a:
                            if url:
                                st.link_button(
                                    "🔗 View Paper",
                                    url,
                                    use_container_width=True
                                )
                        
                        with col_b:
                            if url and source_type == "arxiv":
                                pdf_url = url.replace("/abs/", "/pdf/") + ".pdf"
                                st.link_button(
                                    "📄 PDF",
                                    pdf_url,
                                    use_container_width=True
                                )
                    
                    st.divider()
            
            # Export citations button
            st.markdown("<br>", unsafe_allow_html=True)
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Generate BibTeX
                if st.button("📋 Copy BibTeX", use_container_width=True):
                    bibtex = ""
                    for paper in fs.papers_metadata:
                        if paper.get('source_type') == 'arxiv':
                            title = paper.get('title', 'untitled').replace(' ', '_')
                            year = paper.get('year', '2024')
                            authors = paper.get('authors', 'Unknown')
                            url = paper.get('url', '')
                            
                            bibtex += f"""@article{{{title}_{year},
    title = {{{paper.get('title', 'Untitled')}}},
    author = {{{authors}}},
    year = {{{year}}},
    url = {{{url}}},
    note = {{arXiv preprint}}
}}

"""
                    
                    st.code(bibtex, language="bibtex")
            
            with col2:
                # Generate APA format
                if st.button("📝 APA Format", use_container_width=True):
                    apa = ""
                    for paper in fs.papers_metadata:
                        authors = paper.get('authors', 'Unknown')
                        year = paper.get('year', 'n.d.')
                        title = paper.get('title', 'Untitled')
                        url = paper.get('url', '')
                        
                        apa += f"{authors} ({year}). *{title}*. "
                        if url:
                            apa += f"Retrieved from {url}"
                        apa += "\n\n"
                    
                    st.text_area("APA Citations", apa, height=200)

# =========================================
# Footer
# =========================================
st.markdown("<br><br>", unsafe_allow_html=True)
st.markdown(
    '<div style="text-align: center; opacity: 0.5; font-size: 0.8rem;">'
    'MARS v2.0 • Built with LangGraph & Claude'
    '</div>',
    unsafe_allow_html=True
)