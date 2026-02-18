from django.urls import path
from api.views import ChatView, UploadView, ExportView, NamespaceView, StatusView, AgentsView, StudyCardsView, ExamOracleView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('upload/', UploadView.as_view(), name='upload'),
    path('export/', ExportView.as_view(), name='export'),
    path('namespace/', NamespaceView.as_view(), name='namespace'),
    path('status/', StatusView.as_view(), name='status'),
    path('agents/', AgentsView.as_view(), name='agents'),
    path('study-cards/', StudyCardsView.as_view(), name='study-cards'),
    path('exam-oracle/', ExamOracleView.as_view(), name='exam-oracle'),
]
