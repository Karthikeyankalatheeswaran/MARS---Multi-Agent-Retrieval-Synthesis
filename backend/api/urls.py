from django.urls import path
from api.views import ChatView, UploadView, ExportView, NamespaceView, StatusView, AgentsView, StudyCardsView, ExamOracleView
from api.studio_views import (
    StudioStudyGuideView, StudioBriefingView,
    StudioFlashcardsView, StudioKeyTopicsView, StudioAudioView
)

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('upload/', UploadView.as_view(), name='upload'),
    path('export/', ExportView.as_view(), name='export'),
    path('namespace/', NamespaceView.as_view(), name='namespace'),
    path('status/', StatusView.as_view(), name='status'),
    path('agents/', AgentsView.as_view(), name='agents'),
    path('study-cards/', StudyCardsView.as_view(), name='study-cards'),
    path('exam-oracle/', ExamOracleView.as_view(), name='exam-oracle'),
    # Studio (NotebookLM-style features)
    path('studio/study-guide/', StudioStudyGuideView.as_view(), name='studio-study-guide'),
    path('studio/briefing/', StudioBriefingView.as_view(), name='studio-briefing'),
    path('studio/flashcards/', StudioFlashcardsView.as_view(), name='studio-flashcards'),
    path('studio/key-topics/', StudioKeyTopicsView.as_view(), name='studio-key-topics'),
    path('studio/audio/', StudioAudioView.as_view(), name='studio-audio'),
]
