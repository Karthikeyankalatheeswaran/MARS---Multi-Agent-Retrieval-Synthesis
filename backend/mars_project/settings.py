"""
Django settings for MARS project.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Railway Volume support: If a volume is attached, store SQLite & Media there
RAILWAY_VOLUME_MOUNT_PATH = os.getenv('RAILWAY_VOLUME_MOUNT_PATH', '/app/data')
if os.path.exists(RAILWAY_VOLUME_MOUNT_PATH):
    DATA_DIR = Path(RAILWAY_VOLUME_MOUNT_PATH)
else:
    DATA_DIR = BASE_DIR

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'mars-default-secret-key')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = [h.strip().replace('*', '.') if h.strip().startswith('*') else h.strip() for h in os.getenv('ALLOWED_HOSTS', '*').split(',') if h.strip()]

# Automatically add Railway external hostname
RAILWAY_STATIC_URL = os.getenv('RAILWAY_STATIC_URL')
if RAILWAY_STATIC_URL:
    ALLOWED_HOSTS.append(RAILWAY_STATIC_URL)

# Render deployment SSL header
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'mars_project.urls'

# CORS and CSRF configurations
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
).split(',')
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
).split(',')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'mars_project.wsgi.application'

# Database configuration
import dj_database_url
_db_url = os.environ.get('DATABASE_URL', '') or f"sqlite:///{DATA_DIR}/db.sqlite3"
DATABASES = {
    'default': dj_database_url.parse(_db_url)
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(DATA_DIR, 'media')

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# File upload settings — 200MB max, files > 2.5MB go to disk
FILE_UPLOAD_MAX_MEMORY_SIZE = 209715200  # 200MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 209715200  # 200MB
FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
]

# Transformers environment
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TRANSFORMERS_NO_FLAX"] = "1"
