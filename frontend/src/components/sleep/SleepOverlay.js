import React, { useState, useEffect } from 'react';
import './SleepOverlay.css';

const SleepOverlay = () => {
  // 슬립모드 ...
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev >= 3 ? 1 : prev + 1));
    }, 500);

    return () => clearInterval(interval); // 인터벌 해제

  }, []);

  const dots = '.'.repeat(dotCount);

  return (
    <div className="sleep-overlay">
      <div className="sleep-message">
        <strong>[슬립모드]</strong> 서버를 깨우는 중입니다{dots} (20~30초 소요)
      </div>
    </div>
  );
};

export default SleepOverlay;