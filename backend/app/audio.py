import os
import uuid
import time
import librosa
import numpy as np
from pydub import AudioSegment
from typing import Dict, Tuple, Optional, Union

from .config import TEMP_DIR, ALLOWED_EXTENSIONS

# 키 분석용 상수
PITCHES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def is_allowed_file(filename: str) -> bool:
    """파일 확장자가 허용된 확장자인지 확인"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_temp_filepath(extension: str) -> str:
    """임시 파일 경로 생성"""
    filename = f"{uuid.uuid4()}.{extension}"
    return os.path.join(TEMP_DIR, filename)

def get_file_extension(filename: str) -> str:
    """파일 확장자 추출"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ""

def analyze_key(file_path: str) -> Dict[str, Union[str, float]]:
    """
    오디오 파일의 키(조성)를 분석
    
    Args:
        file_path: 오디오 파일 경로
    
    Returns:
        Dict: {"key": "E", "confidence": 0.82}
    """
    try:
        # librosa를 사용하여 오디오 파일 로드
        y, sr = librosa.load(file_path)
        
        # 크로마그램 특성 추출
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        
        # 키 프로파일 (코드들의 전형적인 패턴)
        # 메이저 및 마이너 키 프로파일
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        
        # 각 키에 대한 상관관계 계산
        chroma_avg = np.mean(chroma, axis=1)
        key_corrs = []
        
        # 모든 메이저 키 체크
        for i in range(12):
            rotated_profile = np.roll(major_profile, i)
            corr = np.corrcoef(chroma_avg, rotated_profile)[0, 1]
            key_corrs.append((f"{PITCHES[i]}", corr))
        
        # 모든 마이너 키 체크
        for i in range(12):
            rotated_profile = np.roll(minor_profile, i)
            corr = np.corrcoef(chroma_avg, rotated_profile)[0, 1]
            key_corrs.append((f"{PITCHES[i]}m", corr))
        
        # 가장 높은 상관관계를 가진 키 선택
        key_corrs.sort(key=lambda x: x[1], reverse=True)
        estimated_key, confidence = key_corrs[0]
        
        # 상관계수의 신뢰도를 0~1 사이로 정규화
        # 음수 값은 0에 가깝게, 1은 그대로 유지
        normalized_confidence = max(0, min(1, (confidence + 1) / 2))
        
        return {
            "key": estimated_key,
            "confidence": round(normalized_confidence, 2)
        }
    except Exception as e:
        print(f"Key analysis failed: {str(e)}")
        raise Exception("음악 키 분석에 실패했습니다.")

def transpose_audio(
    input_path: str, 
    semitones: int, 
    output_format: str
) -> str:
    """
    오디오 파일의 키를 전환 - librosa를 사용하여 템포 변화 없이 피치만 변경
    
    Args:
        input_path: 입력 파일 경로
        semitones: 전환할 반음 수 (양수: 올림, 음수: 내림)
        output_format: 출력 포맷 (mp3 또는 wav)
    
    Returns:
        str: 변환된 파일의 경로
    """
    try:
        # librosa를 사용하여 오디오 파일 로드
        y, sr = librosa.load(input_path, sr=None)
        
        # 템포를 유지하면서 피치만 변경하는 librosa의 피치 쉬프트 함수 사용
        y_shifted = librosa.effects.pitch_shift(y=y, sr=sr, n_steps=semitones)
        
        # 출력 파일 경로 생성
        output_path = generate_temp_filepath(output_format)
        
        # 변환된 오디오를 MP3 또는 WAV로 저장하기 위해 임시 WAV 파일로 저장 후 변환
        import soundfile as sf
        temp_wav_path = generate_temp_filepath('wav')
        sf.write(temp_wav_path, y_shifted, sr)
        
        # pydub을 사용하여 최종 포맷으로 변환
        audio = AudioSegment.from_file(temp_wav_path)
        
        # 포맷에 맞게 저장
        if output_format == "mp3":
            audio.export(output_path, format="mp3", bitrate="320k")
        else:  # wav
            audio.export(output_path, format="wav")
            
        # 임시 파일 삭제
        if os.path.exists(temp_wav_path):
            os.remove(temp_wav_path)
        
        return output_path
    except Exception as e:
        print(f"Transposition failed: {str(e)}")
        raise Exception(f"오디오 전조 중 오류가 발생했습니다: {str(e)}")

def clean_old_files(retention_minutes: int = 10) -> None:
    """
    지정된 시간보다 오래된 임시 파일 삭제
    
    Args:
        retention_minutes: 파일 보존 시간 (분)
    """
    try:
        current_time = os.path.getmtime
        threshold = time.time() - (retention_minutes * 60)
        
        for filename in os.listdir(TEMP_DIR):
            file_path = os.path.join(TEMP_DIR, filename)
            if os.path.isfile(file_path) and current_time(file_path) < threshold:
                os.remove(file_path)
                print(f"Removed old file: {filename}")
    except Exception as e:
        print(f"Error cleaning old files: {str(e)}")
