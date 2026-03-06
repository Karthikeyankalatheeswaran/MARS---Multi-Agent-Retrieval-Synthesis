"""
Studio views — NotebookLM-style content generation endpoints.
Uses the project's Gemini Flash LLM (via OpenRouter) for high-quality generation.
TTS audio still uses HuggingFace Inference API.
"""
import os
import json
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.core.llms import STUDIO_LLM

HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_API_URL = "https://router.huggingface.co/hf-inference/models"
TTS_MODEL = "facebook/mms-tts-eng"


# ─────────────────────────────────────────────
# Study Guide
# ─────────────────────────────────────────────
class StudioStudyGuideView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        prompt = f"""You are an expert academic tutor creating a comprehensive study guide.

Source Material:
{context[:6000]}

Create a detailed study guide with these EXACT sections:

## 📋 Overview
A 2-3 sentence summary of the topic.

## 🔑 Key Concepts
- **Term**: Definition
(List 8-12 key terms with clear definitions)

## 📝 Detailed Notes
Break down the material into logical sections with explanations.

## ❓ Practice Questions
Generate 5 practice questions with brief answers.

## 💡 Key Takeaways
5-7 bullet points summarizing the most important things to remember.

Use markdown formatting. Be thorough but concise."""

        try:
            response = STUDIO_LLM.invoke(prompt)
            return Response({"content": response.content})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ─────────────────────────────────────────────
# Briefing Document
# ─────────────────────────────────────────────
class StudioBriefingView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        prompt = f"""Create a professional executive briefing document from this content.

Source Material:
{context[:6000]}

Format with these EXACT sections:

## 📄 Executive Summary
2-3 sentences capturing the essence.

## 🎯 Key Takeaways
5-7 numbered bullet points of the most critical information.

## 📊 Critical Data Points
Any statistics, numbers, or measurable data found in the material.

## ⚠️ Knowledge Gaps
What aspects are NOT covered that might be important.

## 🔍 Recommendations
2-3 actionable next steps based on the content.

Be concise and professional. Use markdown formatting."""

        try:
            response = STUDIO_LLM.invoke(prompt)
            return Response({"content": response.content})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ─────────────────────────────────────────────
# Flashcards (NotebookLM-style)
# ─────────────────────────────────────────────
class StudioFlashcardsView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        prompt = f"""You are generating study flashcards from academic content.

Source Material:
{context[:6000]}

Generate exactly 10 flashcards as a JSON array. Each flashcard must have:
- "question": A clear, specific question testing understanding
- "answer": A concise but complete answer (1-3 sentences)
- "difficulty": "easy", "medium", or "hard"

Mix question types: definitions, comparisons, applications, and analysis.
Cover the most important concepts from the material.

Respond ONLY with a valid JSON array, no other text:
[{{"question": "...", "answer": "...", "difficulty": "..."}}, ...]"""

        try:
            response = STUDIO_LLM.invoke(prompt)
            content = response.content.strip()

            # Extract JSON from response
            json_start = content.find('[')
            json_end = content.rfind(']') + 1
            if json_start != -1 and json_end > json_start:
                flashcards = json.loads(content[json_start:json_end])
            else:
                flashcards = json.loads(content)

            if not isinstance(flashcards, list) or len(flashcards) == 0:
                return Response({"error": "Could not generate flashcards"}, status=400)

            return Response({"flashcards": flashcards})
        except json.JSONDecodeError:
            return Response({"error": "Failed to parse flashcard data"}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ─────────────────────────────────────────────
# Key Topics
# ─────────────────────────────────────────────
class StudioKeyTopicsView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        prompt = f"""Extract the key topics and concepts from this academic content.

Source Material:
{context[:6000]}

Return a JSON object with:
- "main_topic": The primary subject
- "topics": An array of 8-15 topic strings, ordered by importance
- "entities": An array of important named entities (people, places, technologies)

Respond ONLY with valid JSON:
{{"main_topic": "...", "topics": ["...", "..."], "entities": ["...", "..."]}}"""

        try:
            response = STUDIO_LLM.invoke(prompt)
            content = response.content.strip()

            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                data = json.loads(content[json_start:json_end])
            else:
                data = json.loads(content)

            topics = data.get("topics", [])
            entities = data.get("entities", [])
            main_topic = data.get("main_topic", "")

            return Response({
                "main_topic": main_topic,
                "topics": topics,
                "entities": entities
            })
        except Exception as e:
            return Response({"topics": ["Unable to extract topics"], "entities": []}, status=200)


# ─────────────────────────────────────────────
# FAQ Generation (NEW)
# ─────────────────────────────────────────────
class StudioFAQView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        prompt = f"""Generate a comprehensive FAQ from this academic content.

Source Material:
{context[:6000]}

Create exactly 10 frequently asked questions with detailed answers.
Each answer should be 2-4 sentences and grounded in the source material.

Return as a JSON array:
[{{"question": "...", "answer": "..."}}, ...]

Cover: definitions, processes, comparisons, applications, and common misconceptions.
Respond ONLY with the JSON array."""

        try:
            response = STUDIO_LLM.invoke(prompt)
            content = response.content.strip()

            json_start = content.find('[')
            json_end = content.rfind(']') + 1
            if json_start != -1 and json_end > json_start:
                faqs = json.loads(content[json_start:json_end])
            else:
                faqs = json.loads(content)

            return Response({"faqs": faqs})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ─────────────────────────────────────────────
# Audio Overview (TTS — HuggingFace model)
# ─────────────────────────────────────────────
class StudioAudioView(APIView):
    def post(self, request):
        context = request.data.get("context", "").strip()
        if not context:
            return Response({"error": "No context provided"}, status=400)

        # Step 1: Use Gemini to create a short spoken-word audio script
        script_prompt = f"""Create an intelligent, concise audio summary of the content below in exactly 3 to 4 short sentences.
Act as an expert podcast host explaining the core message.
CRITICAL RULES:
1. Explain the most crucial takeaway clearly and intelligently.
2. Ensure the final sentence provides a natural, complete conclusion.
3. Use plain conversational English only. No markdown, special characters, or abbreviations.
4. Keep the total length under 50 words to save tokens and ensure fast audio generation.

Content:
{context[:3000]}"""

        try:
            script_response = STUDIO_LLM.invoke(script_prompt)
            summary = script_response.content.strip()
            # Clean any remaining markdown
            import re
            summary = re.sub(r'[*#\[\]>_`~]', '', summary)
            # Removed the arbitrary summary[:300] slice which caused abrupt endings
        except Exception:
            summary = context[:200].replace('\n', ' ')

        # Step 2: Generate TTS audio using gTTS (Google TTS)
        # Using gTTS because HuggingFace inference API is often rate-limited or requires pro tokens
        try:
            from gtts import gTTS
            import tempfile
            import base64
            
            # Generate speech
            tts = gTTS(text=summary, lang='en', slow=False)
            
            # Save to temporary file and read as base64
            with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as fp:
                tts.save(fp.name)
                fp.seek(0)
                audio_bytes = fp.read()
                audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                
            return Response({
                "audio_base64": audio_b64,
                "text": summary,
                "format": "audio/mpeg"
            })
            
        except ImportError:
            return Response({
                "text": summary,
                "error": "gTTS library is missing. Please run `pip install gtts`."
            }, status=200)
        except Exception as e:
            print(f"[StudioAudioView] TTS Error: {e}")
            return Response({
                "text": summary,
                "error": f"Audio generation temporarily unavailable: {str(e)}"
            }, status=200)
