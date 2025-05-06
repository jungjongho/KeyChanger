import os
import traceback
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from typing import Optional

from .config import TEMP_DIR, ALLOWED_EXTENSIONS, CORS_ORIGINS, FILE_RETENTION_MINUTES
from .audio import (
    is_allowed_file, 
    generate_temp_filepath, 
    get_file_extension,
    analyze_key, 
    transpose_audio, 
    clean_old_files
)

app = FastAPI(
    title="KeyChanger API",
    description="음악 파일의 키를 분석하고 전조하는 API",
    version="1.0.0",
    root_path="/",  # 이 설정은 Nginx에서 프록시할 때 필요합니다
)

# 요청 시간 제한 설정
from fastapi.middleware.trustedhost import TrustedHostMiddleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 임시 파일 정리 스케줄러 설정
scheduler = BackgroundScheduler()
scheduler.add_job(
    lambda: clean_old_files(FILE_RETENTION_MINUTES), 
    'interval', 
    minutes=5,  # 5분마다 실행
    id='clean_temp_files'
)
scheduler.start()

@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    os.makedirs(TEMP_DIR, exist_ok=True)
    print(f"Temporary directory: {TEMP_DIR}")

@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    scheduler.shutdown()

@app.get("/")
async def root():
    """API 상태 확인용 엔드포인트"""
    return {"status": "online", "message": "KeyChanger API is running"}

@app.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    logging.info(f"Analyzing file: {file.filename} (size: {file.size if hasattr(file, 'size') else 'unknown'})")
    logging.info(f"Content type: {file.content_type}")
    """
    음악 파일의 키(조성)를 분석합니다.
    
    - **file**: mp3 또는 wav 오디오 파일
    
    Returns:
        {"key": "E", "confidence": 0.82}
    """
    try:
        # 파일 확장자 확인
        if not is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail="지원하지 않는 파일 형식입니다. mp3 또는 wav 파일만 허용됩니다."
            )
        
        # 임시 파일 저장
        extension = get_file_extension(file.filename)
        temp_file_path = generate_temp_filepath(extension)
        
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # 나중에 임시 파일 삭제 스케줄링
        if background_tasks:
            background_tasks.add_task(lambda: os.remove(temp_file_path) if os.path.exists(temp_file_path) else None)
        
        # 키 분석
        result = analyze_key(temp_file_path)
        return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"키 분석에 실패했습니다. 다시 시도해주세요. 오류: {str(e)}"
        )

@app.post("/transpose")
async def transpose_audio_file(
    file: UploadFile = File(...),
    shift: int = Form(...),
    format: str = Form("mp3")
):
    """
    음악 파일의 키를 지정한 반음 수만큼 전환합니다.
    
    - **file**: mp3 또는 wav 오디오 파일
    - **shift**: 전환할 반음 수 (+2, -3 등)
    - **format**: 출력 파일 형식 (mp3 또는 wav)
    
    Returns:
        변환된 오디오 파일 다운로드
    """
    try:
        # 파일 확장자 확인
        if not is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail="지원하지 않는 파일 형식입니다. mp3 또는 wav 파일만 허용됩니다."
            )
        
        # 출력 형식 확인
        if format.lower() not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="지원하지 않는 출력 형식입니다. mp3 또는 wav만 허용됩니다."
            )
        
        # 임시 파일 저장
        extension = get_file_extension(file.filename)
        input_file_path = generate_temp_filepath(extension)
        
        with open(input_file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # 오디오 전조 처리
        output_file_path = transpose_audio(
            input_path=input_file_path,
            semitones=shift,
            output_format=format.lower()
        )
        
        # 원본 파일명에서 전조 정보 추가
        original_filename = file.filename.rsplit('.', 1)[0]
        output_filename = f"{original_filename}_shifted_{shift}.{format.lower()}"
        
        # 파일 다운로드 응답
        return FileResponse(
            path=output_file_path,
            filename=output_filename,
            media_type=f"audio/{format.lower()}"
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"파일 변환 중 문제가 발생했습니다. 오류: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    # 개발 서버 실행
    print("HTTP 서버 실행: 0.0.0.0:8000")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
