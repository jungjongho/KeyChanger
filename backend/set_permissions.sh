#!/bin/bash
# 스크립트 파일에 실행 권한 추가

# 모든 쉘 스크립트에 실행 권한 부여
chmod +x *.sh

# SSL 디렉토리 권한 설정
mkdir -p ./ssl
chmod 700 ./ssl

echo "파일 권한이 설정되었습니다."
