import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LatteSongList from './components/latte_song_list/LatteSongList';
import CategoryList from './components/category_list/CategoryList';
import Footer from './components/footer/Footer';
import RealtimeRanking from './components/realtime_ranking/RealtimeRanking';
import MyPlaylist from './components/my_play_list/MyPlaylist';
import { getOrCreateUUID } from './utils/uuid';
import { Link } from 'react-router-dom';
import SleepOverlay from './components/sleep/SleepOverlay';
// import AiRecommendation from './components/ai_recommendation/AiRecommendation';

function App() {
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [aiRefreshTrigger, setAiRefreshTrigger] = useState(0);
  const [playlist, setPlaylist] = useState(() => {
    const saved = localStorage.getItem('myPlaylist');
    return saved ? JSON.parse(saved) : [];
  });

  // LatteSongList에서 실행할 수 있게(ai추천)
  const handleAiRefresh = () => {
    setAiRefreshTrigger(prev => prev + 1);
  };

  // 슬립모드시 overlay
  // useEffect(() => {
  //   // 5초 후 오버레이 제거
  //   const timer = setTimeout(() => {
  //     setIsWakingUp(false);
  //   }, 50000);
  //   return () => clearTimeout(timer);
  // }, []);
  
  useEffect(() => {
    localStorage.setItem('myPlaylist', JSON.stringify(playlist));
  }, [playlist]);

  // uuid 상태추가
  const [uuid, setUUID] = useState('');

  useEffect(() => {
    fetch('https://songpocket-project.onrender.com/')
      .then(() => {
        setTimeout(() => setIsWakingUp(false), 1000);
      })
      .catch(() => {
        console.warn("Render 서버 ping 실패");
        setIsWakingUp(false);
      });
  }, []);

  // localstorage에서 uuid 가져오거나 새로 만들기
  useEffect(() => {
    const myUUID = getOrCreateUUID();
    setUUID(myUUID);
  }, []);
  
  return (
    <Router>
      <div className="App">
        <div className="latte-section">
          <div className="latte-title">
            <p className="latte-subtitle">시대별 인기곡 순위 서비스</p>
            <h1>
              <Link to="/realtime">SONG POCKET</Link>
            </h1>
          </div>

            <div className="latte-content">
            <Routes>
              {/* 기본 경로 RealtimeRanking + CategoryList + 슬립모드 대비(setIsWakingUp)*/}
              <Route path="/" element={<RealtimeRanking setIsWakingUp={setIsWakingUp} playlist={playlist} setPlaylist={setPlaylist} />} />

              {/* latte 경로는 LatteSongList로 이동, 자식 컴포넌트에 props 전달 */}
              <Route path="/realtime" element={<RealtimeRanking setIsWakingUp={setIsWakingUp} playlist={playlist} setPlaylist={setPlaylist} />} />
              {/* AI유사곡 추천 바로 렌더링하기 위해 props 넘김 */}
              <Route path="/latte" element={
                <LatteSongList handleAiRefresh={handleAiRefresh} />
              } />
              <Route path="/playlist" element={<MyPlaylist playlist={playlist} setPlaylist={setPlaylist}/>} />
            </Routes>

            {/* AI추천 트리거 */}
            <CategoryList 
              aiRefreshTrigger={aiRefreshTrigger}
            />
            <Footer />
          </div>
        </div>
        
        {isWakingUp && <SleepOverlay />}

      </div>
    </Router>
  );
}

export default App;