import React from 'react';

interface KeyAnalysisResultProps {
  keyResult: {
    key: string;
    confidence: number;
  } | null;
}

const KeyAnalysisResult: React.FC<KeyAnalysisResultProps> = ({ keyResult }) => {
  if (!keyResult) return null;

  const { key, confidence } = keyResult;
  
  // 신뢰도에 따른 색상 설정
  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 신뢰도를 백분율로 표시
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-bold mb-4">키 분석 결과</h2>
      
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">분석된 키</div>
          <div className="text-2xl font-bold">{key}</div>
        </div>
        
        <div className="flex-1 text-right">
          <div className="text-sm text-gray-500 mb-1">신뢰도</div>
          <div className={`text-2xl font-bold ${getConfidenceColor()}`}>
            {confidencePercent}%
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${
            confidence >= 0.8 ? 'bg-green-600' : 
            confidence >= 0.6 ? 'bg-yellow-600' : 'bg-red-600'
          }`}
          style={{ width: `${confidencePercent}%` }}
        ></div>
      </div>
      
      {confidence < 0.7 && (
        <p className="mt-3 text-sm text-gray-600">
          신뢰도가 낮습니다. 분석된 키가 정확하지 않을 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default KeyAnalysisResult;
