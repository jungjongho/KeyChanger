#!/bin/bash

# SSL 인증서 생성 스크립트
# 개발 환경에서만 사용하세요. 프로덕션 환경에서는 Let's Encrypt 등의 공인 인증서를 사용하세요.

SSL_DIR="./ssl"
DOMAIN="keychanger.example.com"

# SSL 디렉토리 생성
mkdir -p $SSL_DIR

echo "자체 서명된 SSL 인증서를 생성합니다..."

# RSA 개인 키 생성
openssl genrsa -out $SSL_DIR/key.pem 2048

# 인증서 서명 요청(CSR) 생성
openssl req -new -key $SSL_DIR/key.pem -out $SSL_DIR/csr.pem -subj "/CN=$DOMAIN/O=KeyChanger/C=KR"

# 자체 서명 인증서 생성 (개발 환경용)
openssl x509 -req -days 365 -in $SSL_DIR/csr.pem -signkey $SSL_DIR/key.pem -out $SSL_DIR/cert.pem

# CSR 파일 삭제 (더 이상 필요하지 않음)
rm $SSL_DIR/csr.pem

echo "SSL 인증서 생성 완료: $SSL_DIR/cert.pem, $SSL_DIR/key.pem"
echo "주의: 이 인증서는 자체 서명되어 있으므로 브라우저에서 경고가 표시될 수 있습니다."
echo "프로덕션 환경에서는 Let's Encrypt 등의 신뢰할 수 있는 인증서를 사용하세요."
