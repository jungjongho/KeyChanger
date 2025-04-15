# KeyChanger

<div align="center">

![KeyChanger Logo](https://via.placeholder.com/150)

**음악 파일의 키를 분석하고 원하는 만큼 전조할 수 있는 웹 애플리케이션**

</div>

## 📋 개요

KeyChanger는 음악 제작자, 음악 교육자, 그리고 음악을 배우는 학생들을 위한 도구입니다. 이 애플리케이션을 사용하면:

- 오디오 파일의 조성(키)을 정확하게 분석할 수 있습니다
- 음악을 원하는 키로 전조할 수 있습니다
- 음질 손실 없이 변환된 파일을 다운로드할 수 있습니다

## ✨ 주요 기능

- **키 분석**: 고급 오디오 처리 알고리즘을 사용하여 MP3 또는 WAV 파일의 음악적 키 분석
- **전조 처리**: 반음 단위로 정밀한 피치 이동 (템포 유지)
- **신뢰도 지표**: 키 분석 결과와 함께 신뢰도 점수 제공
- **간편한 UI**: 직관적인 사용자 인터페이스로 누구나 쉽게 사용 가능
- **다양한 포맷 지원**: MP3 및 WAV 입출력 지원

## 🖥️ 스크린샷

<div align="center">
<img src="https://via.placeholder.com/800x450" alt="KeyChanger 스크린샷" width="80%"/>
</div>

## 🛠️ 기술 스택

### 백엔드
- **FastAPI**: 고성능 비동기 웹 프레임워크
- **Librosa**: 오디오 분석 및 특성 추출
- **Pydub**: 오디오 파일 조작 및 변환
- **APScheduler**: 임시 파일 자동 정리
- **NumPy**: 고급 수치 연산
- **SoundFile**: 오디오 입출력 처리

### 프론트엔드
- **React**: 사용자 인터페이스 구축
- **TypeScript**: 타입 안전성 제공
- **Tailwind CSS**: 모던하고 반응형 디자인
- **Axios**: API 통신

## 🚀 설치 및 실행 방법

### 사전 요구사항

- Python 3.8 이상
- Node.js 16 이상
- FFmpeg (오디오 처리용)

### 백엔드 설정

1. 프로젝트 클론
   ```bash
   git clone https://github.com/yourusername/KeyChanger.git
   cd KeyChanger
   ```

2. Python 가상환경 생성 및 활성화
   ```bash
   cd backend
   python -m venv venv
   # Linux/Mac:
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate
   ```

3. 의존성 설치
   ```bash
   pip install -r requirements.txt
   ```

4. FFmpeg 설치 확인
   ```bash
   # Linux
   sudo apt install ffmpeg
   
   # Mac (Homebrew)
   brew install ffmpeg
   
   # Windows
   # https://ffmpeg.org/download.html 에서 다운로드 후 PATH 설정
   ```

5. 서버 실행
   ```bash
   uvicorn app.main:app --reload
   ```
   서버는 기본적으로 http://localhost:8000 에서 실행됩니다.

### 프론트엔드 설정

1. 의존성 설치
   ```bash
   cd frontend
   npm install
   ```

2. 개발 서버 실행
   ```bash
   npm start
   ```
   프론트엔드는 기본적으로 http://localhost:3000 에서 실행됩니다.

## 🌐 배포

이 프로젝트는 다음과 같은 방법으로 배포할 수 있습니다:

### Vercel + Railway (추천)
- 프론트엔드: Vercel을 통한 React 애플리케이션 배포
- 백엔드: Railway를 통한 FastAPI 서버 배포

자세한 배포 지침은 [배포 가이드](DEPLOYMENT.md)를 참조하세요.

## 📡 API 엔드포인트

### `/analyze` (POST)
- **기능**: 음악 파일의 키를 분석합니다.
- **요청**: FormData(`file`)
- **응답**: 
  ```json
  {
    "key": "E", 
    "confidence": 0.82
  }
  ```

### `/transpose` (POST)
- **기능**: 음악 파일을 전조합니다.
- **요청**: FormData(`file`, `shift`, `format`)
  - `file`: 오디오 파일 (MP3 또는 WAV)
  - `shift`: 전조할 반음 수 (-12 ~ +12)
  - `format`: 출력 형식 (mp3 또는 wav)
- **응답**: 변환된 오디오 파일 (FileResponse)

## 🔍 작동 원리

KeyChanger는 다음과 같은 과정으로 오디오 파일을 분석하고 변환합니다:

1. **키 분석**:
   - Librosa를 사용하여 오디오 파일 로드
   - 크로마그램 특성 추출 (주파수 분포)
   - 메이저 및 마이너 키 프로파일과의 상관관계 계산
   - 가장 높은 상관관계를 가진 키 선택

2. **전조 처리**:
   - Librosa의 pitch_shift 함수를 사용하여 템포 변화 없이 피치만 변경
   - 고품질 재샘플링을 통한 오디오 품질 유지
   - Pydub을 사용하여 원하는 형식으로 변환

## 📝 향후 개발 계획

- **템포 조정 기능**: 키 변경과 함께 템포를 조절할 수 있는 기능
- **사용자 계정 시스템**: 변환 이력 저장 및 관리
- **소셜 로그인**: 구글, 페이스북 등을 통한 간편 로그인
- **모바일 최적화**: 반응형 디자인 개선 및 모바일 앱 개발
- **일괄 처리**: 여러 파일 동시 처리 기능
- **오디오 미리듣기**: 변환 전 오디오 미리듣기 기능



