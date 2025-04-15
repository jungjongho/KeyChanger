#!/bin/bash
set -e

echo "Setting up Python 3.9 environment for KeyChanger backend..."

# 기존 가상환경 제거 (있는 경우)
if [ -d "venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf venv
fi

# Python 3.9로 새 가상환경 생성
echo "Creating new virtual environment..."
python3 -m venv venv

# 가상환경 활성화
echo "Activating virtual environment..."
source venv/bin/activate

# pip 업그레이드
echo "Upgrading pip..."
pip install --upgrade pip

# Python 3.9 호환 패키지 설치
echo "Installing dependencies for Python 3.9..."
pip install -r requirements_py39.txt

echo ""
echo "Setup complete!"
echo "To activate the environment, run: source venv/bin/activate"
echo "To start the backend server, run: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
