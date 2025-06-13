import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AiRecommendation.css';
import { getOrCreateUUID } from '../../utils/uuid';

const AiRecommendation = ({ refreshTrigger }) => {
  const [recommendations, setRecommendations] = useState([]);
  const uuid = getOrCreateUUID();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/ai/${uuid}`)
      .then(res => setRecommendations(res.data))
      .catch(err => console.error('AI 추천곡 불러오기 실패:', err));
  }, [refreshTrigger]);

  return (
    <div className="ai-recommend-wrapper">
      <div className="ai-recommend-header">
        <h2 className="ai-title">AI 추천 음악</h2>
        <p className="ai-sub">장르 기반 유사도 분석</p>
      </div>

      <div className="ai-card-grid">
        {recommendations.length === 0 ? (
          <div className="ai-card">
            <div className="ai-info">
              <p className="ai-font">추천할 곡이 없습니다. 라떼랭킹에서 곡을 담아주세요.</p>
            </div>
          </div>
        ) : (
          recommendations.map((song, idx) => (
            <div className="ai-card" key={idx}>
              <div className="ai-info">
                <p className="ai-font">{song.artist} - {song.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
};

export default AiRecommendation;