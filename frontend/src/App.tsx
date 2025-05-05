import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import KeyAnalysisResult from './components/KeyAnalysisResult';
import TransposeForm from './components/TransposeForm';

// API 기본 URL - 배포된 백엔드 주소 사용
// const API_BASE_URL = 'https://keychanger.onrender.com';
// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'http://43.200.7.77:8000';

interface KeyResult {
  key: string;
  confidence: number;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isTransposing, setIsTransposing] = useState<boolean>(false);
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setKeyResult(null);
    setError(null);
    setSuccessMessage(null);
    
    // 선택된 파일에 대해 바로 키 분석 시작
    await analyzeKey(selectedFile);
  };

  const analyzeKey = async (selectedFile: File) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60초 타임아웃 설정
      });
      
      setKeyResult(response.data);
    } catch (err) {
      let message = '키 분석에 실패했습니다. 다시 시도해주세요.';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          message = '요청 시간이 초과되었습니다. 파일 크기가 큽니다. 더 작은 파일을 업로드해주세요.';
        } else if (err.response) {
          message = err.response.data.detail || message;
        } else if (err.request) {
          message = '서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
        }
      }
      
      console.error('Analyze error:', err);
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranspose = async (shift: number, format: string) => {
    if (!file) return;
    
    setIsTransposing(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('shift', shift.toString());
      formData.append('format', format);
      
      // 파일 다운로드 요청
      const response = await axios.post(`${API_BASE_URL}/transpose`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 120초 타임아웃 설정
      });
      
      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // 다운로드 파일명 설정
      const originalFileName = file.name.split('.')[0];
      const fileExtension = format.toLowerCase();
      link.setAttribute('download', `${originalFileName}_shifted_${shift}.${fileExtension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccessMessage('파일이 성공적으로 전조되었습니다.');
    } catch (err) {
      let message = '파일 변환 중 문제가 발생했습니다.';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          message = '요청 시간이 초과되었습니다. 파일 크기가 큽니다. 더 작은 파일을 업로드해주세요.';
        } else if (err.response) {
          const errorResponse = err.response.data;
          
          if (errorResponse instanceof Blob) {
            const text = await errorResponse.text();
            try {
              const parsedError = JSON.parse(text);
              message = parsedError.detail || message;
            } catch {
              // JSON 파싱 오류 시 기본 메시지 사용
            }
          }
        } else if (err.request) {
          message = '서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
        }
      }
      
      console.error('Transpose error:', err);
      setError(message);
    } finally {
      setIsTransposing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KeyChanger</h1>
          <p className="text-gray-600">
            음악 파일의 키를 분석하고 원하는 만큼 전조하세요
          </p>
        </header>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
            <p>{successMessage}</p>
          </div>
        )}
        
        <FileUpload onFileSelect={handleFileSelect} isLoading={isAnalyzing} />
        
        {keyResult && (
          <>
            <KeyAnalysisResult keyResult={keyResult} />
            <TransposeForm 
              onTranspose={handleTranspose} 
              isTransposing={isTransposing}
              originalKey={keyResult.key}
            />
          </>
        )}
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 KeyChanger - 오디오 전조 서비스</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
