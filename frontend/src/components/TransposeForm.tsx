import React, { useState } from 'react';

interface TransposeFormProps {
  onTranspose: (shift: number, format: string) => void;
  isTransposing: boolean;
  originalKey: string | null;
}

const TransposeForm: React.FC<TransposeFormProps> = ({
  onTranspose,
  isTransposing,
  originalKey,
}) => {
  const [shiftAmount, setShiftAmount] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState<string>('mp3');
  
  // 키 매핑 (반음 기준)
  const keyMap: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // 원래 키를 기준으로 전조된 키 계산
  const calculateTransposedKey = (): string => {
    if (!originalKey) return '-';
    
    // 단조 처리
    const isMinor = originalKey.includes('m');
    const baseName = isMinor ? originalKey.replace('m', '') : originalKey;
    
    // 기본 키의 인덱스 찾기
    const baseIndex = keyMap.findIndex(k => k === baseName);
    if (baseIndex === -1) return '-';
    
    // 새 인덱스 계산 (음수 처리를 위해 모듈로 12 연산)
    const newIndex = (baseIndex + shiftAmount + 12) % 12;
    const newKey = keyMap[newIndex];
    
    return isMinor ? `${newKey}m` : newKey;
  };

  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setShiftAmount(value);
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutputFormat(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTranspose(shiftAmount, outputFormat);
  };

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-bold mb-4">키 전조</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전조 값 (반음 단위)
          </label>
          
          <div className="flex items-center">
            <input
              type="range"
              min="-12"
              max="12"
              value={shiftAmount}
              onChange={handleShiftChange}
              className="flex-1 form-input"
              disabled={isTransposing}
            />
            <span className="ml-4 w-10 text-center font-medium">{shiftAmount}</span>
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>-12</span>
            <span>0</span>
            <span>+12</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              원래 키
            </label>
            <div className="text-lg font-medium p-2 bg-gray-100 rounded-md text-center">
              {originalKey || '-'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전조된 키
            </label>
            <div className="text-lg font-medium p-2 bg-blue-100 rounded-md text-center">
              {calculateTransposedKey()}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출력 형식
          </label>
          <select
            value={outputFormat}
            onChange={handleFormatChange}
            className="w-full form-input"
            disabled={isTransposing}
          >
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full btn btn-primary"
          disabled={isTransposing || !originalKey}
        >
          {isTransposing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              변환 중...
            </div>
          ) : (
            '전조 및 다운로드'
          )}
        </button>
      </form>
    </div>
  );
};

export default TransposeForm;
