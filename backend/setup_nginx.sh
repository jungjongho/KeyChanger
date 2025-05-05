#!/bin/bash
# Nginx 설치 및 설정 스크립트

# 도메인 설정 (실제 도메인으로 변경하세요)
DOMAIN="keychanger.n-e.kr"

# Nginx 설치
sudo apt update
sudo apt install -y nginx

# Nginx 설정 파일 복사
sudo cp nginx_keychanger.conf /etc/nginx/sites-available/keychanger.conf

# 설정 파일에서 도메인 이름 업데이트
sudo sed -i "s/keychanger\.n-e\.kr/$DOMAIN/g" /etc/nginx/sites-available/keychanger.conf

# 설정 파일 활성화
sudo ln -sf /etc/nginx/sites-available/keychanger.conf /etc/nginx/sites-enabled/

# Let's Encrypt 인증을 위한 디렉토리 생성
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html

# 기본 사이트 비활성화 (선택사항)
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 자동 시작 설정
sudo systemctl enable nginx

echo "Nginx 설정이 완료되었습니다."
echo "KeyChanger API를 8000 포트에서 실행하고 Nginx가 프록시하도록 설정하세요."
