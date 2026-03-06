"""
MARS Django Models — tracks uploaded documents and FAISS indexes.
"""
from django.db import models
from datetime import timedelta
from django.utils import timezone


def default_expiry():
    return timezone.now() + timedelta(hours=48)


class FAISSDocument(models.Model):
    """Tracks each uploaded PDF and its corresponding FAISS vector index."""
    namespace = models.CharField(max_length=128, unique=True, db_index=True)
    filename = models.CharField(max_length=255)
    page_count = models.IntegerField(default=0)
    chunk_count = models.IntegerField(default=0)
    index_path = models.CharField(max_length=512)
    file_path = models.CharField(max_length=512, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiry)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.filename} ({self.namespace}) — {self.chunk_count} chunks"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
