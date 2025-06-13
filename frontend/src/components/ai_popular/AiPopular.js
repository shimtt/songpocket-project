import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../ai_recommendation/AiRecommendation.css';

const AiPopular = () => {
  const [popularSongs, setPopularSongs] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/ai/popular`)
      .then(res => setPopularSongs(res.data))
      .catch(err => console.error('많이 담긴 곡 불러오기 실패:', err));
  }, []);

  return (
    <div className="ai-recommend-wrapper">
      <div className="ai-recommend-header">
        <h2 className="ai-title">많이 담긴 곡</h2>
        <p className="ai-sub">플레이리스트에 가장 많이 담긴 노래</p>
      </div>

      <div className="ai-card-grid">
        {popularSongs.length === 0 ? (
          <div className="ai-card">
            <div className="ai-info">
              <p className="ai-font">아직 2개 이상 담긴 곡이 없습니다.</p>
            </div>
          </div>
        ) : (
          popularSongs.map((song, idx) => (
            <div className="ai-card" key={idx}>
              <div className="ai-info">
                <p className="ai-font">{song.artist} - {song.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AiPopular;