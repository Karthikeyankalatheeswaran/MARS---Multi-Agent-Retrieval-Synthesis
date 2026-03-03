"""
Studio views – NotebookLM-style content generation endpoints.
Uses HuggingFace Inference API for generative tasks (summarization, Q&A, TTS).
"""
import os
import json
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_API_URL = "https://api-inference.huggingface.co/models"

SUMMARIZE_MODEL = "facebook/bart-large-cnn"
QA_MODEL = "deepset/roberta-base-squad2"
TTS_MODEL = "facebook/mms-tts-eng"


def hf_summarize(text: str, max_length: int = 300, min_length: int = 60) -> str:
    """Call HuggingFace BART for summarization."""
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    # Truncate to 4000 chars to stay within model limits
    payload = {
        "inputs": text[:4000],
        "parameters": {"max_length": max_length, "min_length": min_length, "do_sample": False}
    }
    try:
        resp = requests.post(f"{HF_API_URL}/{SUMMARIZE_MODEL}", headers=headers, json=payload, timeout=60)
        result = resp.json()
        if isinstance(result, list) and result:
            return result[0].get("summary_text", "")
        return str(result)
    except Exception as e:
        return f"[Summarization error: {e}]"


def hf_qa(context: str, question: str) -> str:
    """Call HuggingFace RoBERTa for Q&A extraction."""
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {"inputs": {"question": question, "context": context[:3000]}}
    try:
        resp = requests.post(f"{HF_API_URL}/{QA_MODEL}", headers=headers, json=payload, timeout=30)
        result = resp.json()
        if isinstance(result, dict):
            return result.get("answer", "")
        return ""
    except Exception as e:
        return f"[Q&A error: {e}]"


# ─────────────────────────────────────────────
# Study Guide
# ─────────────────────────────────────────────
class StudioStudyGuideView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        prompt = f"""Create a structured study guide from the following content.
Format with: Overview, Key Concepts (bullet list), Important Details, Summary.

Content:
{context[:3000]}"""

        summary = hf_summarize(prompt, max_length=400, min_length=100)
        return Response({"content": summary})


# ─────────────────────────────────────────────
# Briefing Document
# ─────────────────────────────────────────────
class StudioBriefingView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        summary = hf_summarize(context, max_length=250, min_length=60)
        return Response({"content": summary})


# ─────────────────────────────────────────────
# Flashcards
# ─────────────────────────────────────────────
class StudioFlashcardsView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        # Generate Q&A pairs for 5 questions
        questions = [
            "What is the main concept described?",
            "What are the key components or steps mentioned?",
            "What is the most important result or finding?",
            "What problem does this address?",
            "How does this work in practice?",
        ]

        flashcards = []
        for q in questions:
            answer = hf_qa(context, q)
            if answer and len(answer) > 5:
                flashcards.append({"question": q, "answer": answer})

        if not flashcards:
            return Response({"error": "Could not extract flashcards from the content."}, status=400)

        return Response({"flashcards": flashcards})


# ─────────────────────────────────────────────
# Key Topics
# ─────────────────────────────────────────────
class StudioKeyTopicsView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        # Simple keyword extraction using question-answering approach
        questions = [
            "What is the main topic?",
            "What are the subtopics?",
            "What technologies or methods are mentioned?",
        ]

        raw_topics = set()
        for q in questions:
            answer = hf_qa(context, q)
            if answer and len(answer) > 2:
                # Split comma/slash separated items
                for part in answer.replace("and", ",").replace("/", ",").split(","):
                    clean = part.strip().title()
                    if 2 < len(clean) < 60:
                        raw_topics.add(clean)

        topics = sorted(raw_topics)[:12]
        if not topics:
            topics = ["Unable to extract topics. Try a longer conversation."]

        return Response({"topics": topics})


# ─────────────────────────────────────────────
# Audio Overview (TTS)
# ─────────────────────────────────────────────
class StudioAudioView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        # First summarize to shorter text for TTS
        summary = hf_summarize(context, max_length=120, min_length=30)

        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
        try:
            resp = requests.post(
                f"{HF_API_URL}/{TTS_MODEL}",
                headers=headers,
                json={"inputs": summary},
                timeout=60
            )
            if resp.status_code == 200 and resp.content:
                import base64
                audio_b64 = base64.b64encode(resp.content).decode("utf-8")
                return Response({
                    "audio_base64": audio_b64,
                    "text": summary,
                    "format": "audio/flac"
                })
            else:
                return Response({"error": "TTS model unavailable. Try again later."}, status=503)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
