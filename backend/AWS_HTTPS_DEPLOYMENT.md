# AWS EC2에 HTTPS로 KeyChanger 배포하기

이 가이드는 KeyChanger 프로젝트를 AWS EC2 인스턴스에 HTTPS로 배포하는 방법을 설명합니다.

## 사전 준비사항

1. AWS 계정 및 EC2 인스턴스
2. 등록된 도메인
3. 인스턴스에 연결할 SSH 키
4. Route 53 또는 다른 DNS 서비스에서 도메인 설정

## 1. EC2 인스턴스 설정

### 인스턴스 시작

1. AWS 콘솔에서 EC2 인스턴스를 시작합니다 (Ubuntu 22.04 LTS 권장).
2. 보안 그룹에서 다음 포트를 열어야 합니다:
   - SSH (22)
   - HTTP (80) - Let's Encrypt 인증용
   - HTTPS (443)

### 시스템 업데이트 및 기본 패키지 설치

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv git ffmpeg
```

## 2. 프로젝트 클론

```bash
git clone https://github.com/yourusername/KeyChanger.git
cd KeyChanger/backend
```

## 3. 가상환경 설정

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 4. SSL 인증서 설정

### Let's Encrypt를 이용한 SSL 인증서 발급

1. 도메인을 EC2 인스턴스의 공용 IP 주소로 지정합니다 (Route 53 또는 DNS 공급자 설정).
2. 제공된 스크립트를 실행하여 Let's Encrypt 인증서를 설치합니다:

```bash
# 도메인과 이메일 주소를 설정
nano setup_letsencrypt.sh

# 스크립트 실행 권한 설정
chmod +x setup_letsencrypt.sh

# 스크립트 실행
./setup_letsencrypt.sh
```

### 수동으로 SSL 인증서 설정하기

Let's Encrypt 스크립트를 사용하지 않는 경우:

```bash
# SSL 디렉토리 생성
mkdir -p ssl

# 자체 서명 인증서 생성 (테스트용)
./generate_ssl.sh
```

## 5. 구성 파일 수정

1. config.py 파일에서 다음 항목을 수정합니다:
   - `CORS_ORIGINS`: 실제 프론트엔드 도메인으로 변경
   - 필요한 경우 다른 설정 수정

## 6. systemd 서비스 설정

```bash
# 서비스 파일 복사
sudo cp keychanger.service /etc/systemd/system/

# 서비스 파일 경로 수정 (필요한 경우)
sudo nano /etc/systemd/system/keychanger.service

# systemd 데몬 리로드
sudo systemctl daemon-reload

# 서비스 시작
sudo systemctl start keychanger

# 부팅 시 자동 시작 설정
sudo systemctl enable keychanger
```

## 7. 서비스 상태 확인

```bash
sudo systemctl status keychanger
```

## 8. 로그 확인

```bash
sudo journalctl -u keychanger -f
```

## 문제 해결

### 인증서 문제

인증서 발급 중 문제가 발생한 경우:

```bash
sudo certbot --nginx -d yourdomain.com
```

### 포트 충돌

443 포트가 이미 사용 중인 경우:

```bash
sudo netstat -tulpn | grep 443
```

충돌하는 서비스를 중지하거나 다른 포트 사용.

### 파일 권한

SSL 인증서에 대한 권한 문제 발생 시:

```bash
sudo chmod 644 ./ssl/cert.pem
sudo chmod 600 ./ssl/key.pem
```

## 참고 사항

- 443 포트는 루트 권한이 필요할 수 있습니다. 그런 경우 서비스를 루트로 실행하거나, authbind를 사용하거나, 1024 이상의 포트로 변경할 수 있습니다.
- 인증서는 90일마다 갱신해야 합니다 (Let's Encrypt 사용 시 자동 갱신됨).
- 프로덕션 환경에서는 Nginx 또는 Apache를 프록시로 사용하여 FastAPI 앱을 배포하는 것이 권장됩니다.
