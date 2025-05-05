import os
from pathlib import Path
import socket

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Temporary file storage
TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# File retention time in minutes
FILE_RETENTION_MINUTES = 10

# Maximum file size in MB (변경 가능)
MAX_FILE_SIZE = 50  # 50MB로 변경

# HTTPS 설정
SSL_DIR = os.path.join(BASE_DIR, "ssl")
SSL_CERTFILE = os.path.join(SSL_DIR, "cert.pem")
SSL_KEYFILE = os.path.join(SSL_DIR, "key.pem")

# 호스트 이름
HOSTNAME = socket.gethostname()
SERVER_HOST = "0.0.0.0"  # 모든 인터페이스에서 수신
SERVER_PORT = 443  # HTTPS 기본 포트

# Allowed audio formats
ALLOWED_EXTENSIONS = {"mp3", "wav"}

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",  # React default port
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://key-changer.vercel.app",  # 배포된 프론트엔드 도메인
    "https://keychanger.example.com",  # 배포될 도메인 (변경 필요)
    "https://www.keychanger.example.com",  # www 서브도메인 (변경 필요)
]
