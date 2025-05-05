#!/bin/bash
# Let's Encrypt를 사용하여 SSL 인증서 설정
# 이 스크립트는 AWS EC2 인스턴스에서 실행해야 합니다.

# 도메인 설정 (실제 도메인으로 변경하세요)
DOMAIN="keychanger.example.com"
EMAIL="your-email@example.com"  # 인증서 만료 알림을 받을 이메일

# 필요한 패키지 설치
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y universe
sudo apt-get update

# Certbot 설치
sudo apt-get install -y certbot

# SSL 디렉토리 생성
mkdir -p ./ssl

# Let's Encrypt 인증서 발급 (웹 서버 중단 필요)
echo "Let's Encrypt 인증서를 발급받습니다..."
sudo certbot certonly --standalone --preferred-challenges http -d $DOMAIN --email $EMAIL --agree-tos --non-interactive

# 인증서 파일 복사
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/key.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/cert.pem

# 권한 설정
sudo chmod 644 ./ssl/cert.pem
sudo chmod 600 ./ssl/key.pem

echo "SSL 인증서 설정 완료: ./ssl/cert.pem, ./ssl/key.pem"

# 인증서 자동 갱신 설정
echo "인증서 자동 갱신을 설정합니다..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "자동 갱신 설정 완료. 인증서는 만료 전 자동으로 갱신됩니다."
echo "웹 서비스를 다시 시작하세요."

# 인증서 갱신 후 스크립트 설정 (서비스 다시 시작)
RENEWAL_HOOK="/etc/letsencrypt/renewal-hooks/post/keychanger-renewal.sh"
sudo tee $RENEWAL_HOOK > /dev/null << EOT
#!/bin/bash
# KeyChanger 인증서 갱신 후 처리 스크립트

# 인증서 파일 복사
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /path/to/your/app/ssl/key.pem
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /path/to/your/app/ssl/cert.pem

# 권한 설정
chmod 644 /path/to/your/app/ssl/cert.pem
chmod 600 /path/to/your/app/ssl/key.pem

# 서비스 다시 시작
systemctl restart keychanger
EOT

# 실행 권한 설정
sudo chmod +x $RENEWAL_HOOK
