import uuid
import time
import tempfile
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import FileResponse

from api.serializers import (
    ChatRequestSerializer,
    UploadRequestSerializer,
    ExportRequestSerializer,
    NamespaceDeleteSerializer,
)
from api.core.state import MARSState, ChatMessage
from api.graph.workflow import build_graph
from api.storage.pdf_loader import load_pdf
from api.storage.chunker import chunk_documents
from api.storage.pinecone_store import create_vectorstore, delete_namespace
from api.utils.export import export_answer_to_pdf


# Agent definitions for the workflow visualization
AGENTS_INFO = [
    {
        "name": "Planner",
        "role": "Intent Classifier",
        "description": "Analyzes user query intent - detects greetings, feedback, follow-ups, or new queries. Routes to the appropriate pipeline based on mode.",
        "icon": "target",
        "color": "#667eea",
        "order": 1,
    },
    {
        "name": "Scout",
        "role": "Information Retriever",
        "description": "Retrieves relevant content from Pinecone (Student Mode) or searches academic and web sources (Research Mode).",
        "icon": "search",
        "color": "#f093fb",
        "order": 2,
    },
    {
        "name": "Analyst",
        "role": "Context Synthesizer",
        "description": "Organizes and refines retrieved content. Extracts the most relevant info while preserving key details.",
        "icon": "assessment",
        "color": "#4facfe",
        "order": 3,
    },
    {
        "name": "Scribe",
        "role": "Answer Generator",
        "description": "Generates the final answer with proper formatting. Adds citations and builds reference lists in Research Mode.",
        "icon": "edit",
        "color": "#43e97b",
        "order": 4,
    },
    {
        "name": "Critic",
        "role": "Quality Validator",
        "description": "Validates answer grounding in Student Mode. Computes a score based on textbook support.",
        "icon": "gavel",
        "color": "#fa709a",
        "order": 5,
    },
    {
        "name": "Memory",
        "role": "Context Manager",
        "description": "Manages conversation history using a sliding window. Enables follow-up questions.",
        "icon": "history",
        "color": "#a18cd1",
        "order": 6,
    },
]

WORKFLOW_GRAPH = {
    "nodes": [
        {"id": "planner", "label": "Planner", "type": "entry"},
        {"id": "student_scout", "label": "Student Scout", "type": "process"},
        {"id": "research_scout", "label": "Research Scout", "type": "process"},
        {"id": "analyst", "label": "Analyst", "type": "process"},
        {"id": "scribe", "label": "Scribe", "type": "process"},
        {"id": "critic", "label": "Critic", "type": "process"},
        {"id": "end", "label": "Response", "type": "end"},
    ],
    "edges": [
        {"from": "planner", "to": "student_scout", "condition": "Student Mode + New Query"},
        {"from": "planner", "to": "research_scout", "condition": "Research Mode"},
        {"from": "planner", "to": "scribe", "condition": "Greeting / Feedback"},
        {"from": "student_scout", "to": "analyst", "condition": "Always"},
        {"from": "research_scout", "to": "analyst", "condition": "Always"},
        {"from": "analyst", "to": "scribe", "condition": "Always"},
        {"from": "scribe", "to": "critic", "condition": "Student Mode + New Query"},
        {"from": "scribe", "to": "end", "condition": "Research / Simple"},
        {"from": "critic", "to": "end", "condition": "Always"},
    ],
}


class ChatView(APIView):
    """
    POST /api/chat/
    Process a user query through the MARS agent pipeline.
    """

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        query = data['query']
        mode = data['mode']
        namespace = data.get('namespace', '')
        history_data = data.get('chat_history', [])

        # Build chat history
        chat_history = [
            ChatMessage(role=m.get('role', 'user'), content=m.get('content', ''))
            for m in history_data
        ]

        # Build state
        state = MARSState(
            user_query=query,
            mode=mode,
            namespace=namespace,
            chat_history=chat_history
        )

        try:
            # Execute the LangGraph workflow
            start_time = time.time()
            graph = build_graph()
            final_state_dict = graph.invoke(state)

            # Reconstruct state — handle both dict and MARSState returns
            if isinstance(final_state_dict, dict):
                # Extract only known fields to avoid issues
                final_state = MARSState(
                    user_query=final_state_dict.get('user_query', query),
                    mode=final_state_dict.get('mode', mode),
                    namespace=final_state_dict.get('namespace', namespace),
                    chat_history=final_state_dict.get('chat_history', chat_history),
                    intent=final_state_dict.get('intent'),
                    answer_type=final_state_dict.get('answer_type'),
                    retrieved_sources=final_state_dict.get('retrieved_sources', []),
                    refined_context=final_state_dict.get('refined_context'),
                    draft_answer=final_state_dict.get('draft_answer'),
                    critic_status=final_state_dict.get('critic_status'),
                    critic_reason=final_state_dict.get('critic_reason'),
                    grounding_score=final_state_dict.get('grounding_score'),
                    papers_metadata=final_state_dict.get('papers_metadata', []),
                    agent_logs=final_state_dict.get('agent_logs', []),
                )
            else:
                final_state = final_state_dict

            elapsed = time.time() - start_time

            # Serialize sources
            sources = []
            if final_state.retrieved_sources:
                sources = [
                    {
                        "content": s.content[:500] if isinstance(s, object) and hasattr(s, 'content') else str(s)[:500],
                        "source": getattr(s, 'source', 'unknown'),
                        "page": getattr(s, 'page', None),
                        "url": getattr(s, 'url', None),
                    }
                    for s in final_state.retrieved_sources[:5]
                ]

            # Serialize agent logs
            agent_logs = []
            if final_state.agent_logs:
                agent_logs = [
                    {
                        "agent": log.agent if hasattr(log, 'agent') else log.get('agent', ''),
                        "status": log.status if hasattr(log, 'status') else log.get('status', ''),
                        "icon": log.icon if hasattr(log, 'icon') else log.get('icon', ''),
                        "duration_ms": log.duration_ms if hasattr(log, 'duration_ms') else log.get('duration_ms', 0),
                        "thinking": log.thinking if hasattr(log, 'thinking') else log.get('thinking', ''),
                        "output_preview": log.output_preview if hasattr(log, 'output_preview') else log.get('output_preview', ''),
                        "details": log.details if hasattr(log, 'details') else log.get('details', {}),
                    }
                    for log in final_state.agent_logs
                ]

            response_data = {
                "answer": final_state.draft_answer or "No answer generated.",
                "mode": final_state.mode,
                "intent": final_state.intent,
                "grounding_score": final_state.grounding_score,
                "critic_status": final_state.critic_status,
                "critic_reason": final_state.critic_reason,
                "papers_metadata": final_state.papers_metadata or [],
                "retrieved_sources": sources,
                "agent_logs": agent_logs,
                "agents_executed": [
                    {"name": log.get("agent", ""), "status": log.get("status", ""), "icon": log.get("icon", "")}
                    for log in agent_logs
                ],
                "elapsed_time": round(elapsed, 2),
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Processing failed: {str(e)}", "traceback": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UploadView(APIView):
    """
    POST /api/upload/
    Upload and process a PDF file.
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        namespace = request.data.get('namespace', str(uuid.uuid4()))

        try:
            # Load PDF
            documents = load_pdf(uploaded_file)

            # Chunk
            chunks = chunk_documents(documents)

            # Embed in Pinecone
            create_vectorstore(chunks, namespace=namespace)

            return Response({
                "message": "Document processed successfully",
                "namespace": namespace,
                "pages": len(documents),
                "chunks": len(chunks),
                "filename": uploaded_file.name,
                "size_mb": round(uploaded_file.size / (1024 * 1024), 2),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Failed to process PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExportView(APIView):
    """POST /api/export/ — Export Q&A to PDF."""

    def post(self, request):
        serializer = ExportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            success = export_answer_to_pdf(
                tmp.name,
                data['question'],
                data['answer'],
                data.get('sources', [])
            )

            if success:
                return FileResponse(
                    open(tmp.name, 'rb'),
                    content_type='application/pdf',
                    as_attachment=True,
                    filename=f"MARS_QA_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                )
            else:
                return Response(
                    {"error": "Failed to generate PDF"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NamespaceView(APIView):
    """DELETE /api/namespace/ — Clear a Pinecone namespace."""

    def delete(self, request):
        namespace = request.data.get('namespace', '')
        if namespace:
            delete_namespace(namespace)
        return Response({"message": "Namespace cleared"}, status=status.HTTP_200_OK)


class StatusView(APIView):
    """GET /api/status/ — Health check."""

    def get(self, request):
        return Response({
            "status": "online",
            "service": "MARS - Multi-Agent RAG System",
            "version": "2.1",
            "timestamp": datetime.now().isoformat(),
        })


class AgentsView(APIView):
    """GET /api/agents/ — Return agent definitions and workflow graph."""

    def get(self, request):
        return Response({
            "agents": AGENTS_INFO,
            "workflow": WORKFLOW_GRAPH,
        })


class StudyCardsView(APIView):
    """
    POST /api/study-cards/
    Generate study guide cards from a previous answer or text.
    """
    def post(self, request):
        try:
            content = request.data.get('content', '')
            if not content:
                return Response({"error": "No content provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Create a temporary state with the content as draft_answer
            from api.council.cartographer import CartographerAgent
            state = MARSState(user_query="", mode="student", draft_answer=content)
            
            cartographer = CartographerAgent()
            final_state = cartographer.run(state)
            
            # Extract data from logs
            cards = []
            mind_map = None
            for log in final_state.agent_logs:
                if log.agent == "Cartographer" and log.details:
                    if "study_cards" in log.details:
                        cards = log.details["study_cards"]
                    if "mind_map" in log.details:
                        mind_map = log.details["mind_map"]
                    break
            
            return Response({
                "cards": cards,
                "mind_map": mind_map
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExamOracleView(APIView):
    """
    POST /api/exam-oracle/
    Predict exam questions for a given Subject Code.
    """
    def post(self, request):
        try:
            subject_code = request.data.get('subject_code', '')
            if not subject_code:
                return Response({"error": "No subject code provided"}, status=status.HTTP_400_BAD_REQUEST)

            from api.research.oracle import OracleAgent
            state = MARSState(user_query=subject_code, mode="student")
            
            oracle = OracleAgent()
            final_state = oracle.run(state)
            
            return Response({
                "prediction": final_state.draft_answer,
                "logs": [
                    {
                        "agent": log.agent,
                        "status": log.status,
                        "thinking": log.thinking,
                        "duration_ms": log.duration_ms
                    }
                    for log in final_state.agent_logs
                ]
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
