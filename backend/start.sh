#!/bin/bash
set -e

# 가상환경 활성화
source /opt/venv/bin/activate

# 애플리케이션 시작
echo "Starting KeyChanger API..."
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
