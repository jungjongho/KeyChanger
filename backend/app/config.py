import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Temporary file storage
TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# File retention time in minutes
FILE_RETENTION_MINUTES = 10

# Maximum file size in MB (변경 가능)
MAX_FILE_SIZE = 50  # 50MB로 변경

# Allowed audio formats
ALLOWED_EXTENSIONS = {"mp3", "wav"}

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",  # React default port
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://key-changer.vercel.app",  # 배포된 프론트엔드 도메인
]
