# MARS — Multi-Agent Retrieval & Synthesis

MARS is a specialized, humanized AI research and study assistant built with a collaborative multi-agent architecture. It integrates advanced RAG (Retrieval-Augmented Generation) capabilities with a high-performance, cosmic-themed interface.

## 🚀 Key Features

- **Collaborative Agent Council**: A 5-agent pipeline (Planner, Scout, Analyst, Scribe, Critic) working together to provide grounded, high-accuracy answers.
- **Student Study Mode**: Upload PDFs to generate interactive **Study Cards** and cosmic **Mind Maps**.
- **Research Explorer**: Real-time web reconnaissance using Tavily and Google Scholar (via SerpAPI) for academic-grade reports.
- **Exam Question Oracle**: 5-year trend analysis for predicting university exam patterns based on subject codes.
- **Humanized Experience**: Clean, professional interface free from AI decorative tropes, focusing on readability and flow.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Material UI, Framer Motion, Lucide Icons.
- **Backend**: Django, Django REST Framework, LangGraph.
- **AI Models**: Llama 3 (via Groq), Gemini 2.0 (via OpenRouter).
- **Vector Database**: Pinecone.
- **Search Logic**: Tavily API, SerpAPI (Google Scholar).

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- API Keys: Groq, OpenRouter, Tavily, SerpAPI, Pinecone.

### Backend Setup
1. Navigate to `backend/`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on `.env.example` and add your API keys.
4. Run migrations and start server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

MARS utilizes a modular architecture where the frontend communicates with a Django API. The core intelligence is powered by **LangGraph**, orchestrating multiple LLM agents to ensure hallucination-free responses through a final quality-control critic node.

## 📄 License
MIT License.
