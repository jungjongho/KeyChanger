#!/bin/bash
set -e

# 가상환경 활성화
source venv/bin/activate

# 포트 설정 (일반적으로 Nginx 프록시를 사용하는 경우 8000 포트 사용)
PORT=${PORT:-8000}

# SSL 설정 여부 확인 (Nginx를 사용하지 않는 경우를 위해 유지)
SSL_DIR="./ssl"
SSL_CERT="$SSL_DIR/cert.pem"
SSL_KEY="$SSL_DIR/key.pem"

# Nginx 프록시 확인 (이 파일이 존재하면 Nginx를 사용하는 것으로 간주)
NGINX_FLAG="/etc/nginx/sites-enabled/keychanger.conf"

if [ -f "$NGINX_FLAG" ]; then
    echo "Nginx 프록시를 사용하여 KeyChanger API 실행..."
    python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
else
    # Nginx가 없는 경우, SSL 직접 설정 사용
    if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
        echo "SSL 직접 설정으로 KeyChanger API 실행..."
        PORT=${PORT:-443}  # SSL을 사용하는 경우 기본 포트를 443으로 변경
        python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --ssl-keyfile $SSL_KEY --ssl-certfile $SSL_CERT
    else
        echo "경고: SSL 인증서가 없고 Nginx도 없습니다. HTTP로 실행합니다."
        python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
    fi
fi
