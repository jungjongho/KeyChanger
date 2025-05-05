#!/bin/bash
set -e

# FFmpeg 설치 확인
echo "Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg not found, installing..."
    apt-get update
    apt-get install -y ffmpeg
else
    echo "FFmpeg is already installed"
fi

# Python 가상환경 설정
echo "Setting up Python environment..."
python -m venv /opt/venv
source /opt/venv/bin/activate

# 의존성 설치
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Build completed successfully!"
