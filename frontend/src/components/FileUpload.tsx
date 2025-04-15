import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav'];
    const fileType = file.type;
    
    if (!validTypes.includes(fileType)) {
      alert('지원하지 않는 파일 형식입니다. mp3 또는 wav 파일만 허용됩니다.');
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const openFileSelector = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-bold mb-4">파일 업로드</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
        } cursor-pointer transition-colors duration-200`}
        onClick={openFileSelector}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <svg 
            className="w-12 h-12 text-gray-400 mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          
          <p className="text-gray-700 mb-2">
            {selectedFile
              ? `선택된 파일: ${selectedFile.name}`
              : '음악 파일을 드래그하거나 클릭하여 업로드하세요'}
          </p>
          
          <p className="text-sm text-gray-500">MP3 또는 WAV 파일만 지원됩니다</p>
          
          {isLoading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">처리 중...</p>
            </div>
          )}
        </div>
        
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".mp3,.wav"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default FileUpload;
