from django.apps import AppConfig
import threading


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """Start background cleanup thread for expired FAISS indexes."""
        # Only run in the main process, not in manage.py commands
        import os
        if os.environ.get('RUN_MAIN') == 'true':
            self._start_cleanup_scheduler()

    def _start_cleanup_scheduler(self):
        """Run cleanup every 12 hours in a background daemon thread."""
        def cleanup_loop():
            import time
            while True:
                try:
                    from api.storage.faiss_store import cleanup_old_indexes
                    cleanup_old_indexes(max_age_hours=48)
                except Exception as e:
                    print(f"[FAISS Cleanup] Error: {e}")
                time.sleep(12 * 60 * 60)  # 12 hours

        t = threading.Thread(target=cleanup_loop, daemon=True, name="faiss-cleanup")
        t.start()
        print("[FAISS] Background cleanup scheduler started (every 12 hours).")
