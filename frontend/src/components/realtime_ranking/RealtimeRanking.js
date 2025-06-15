import React, { useEffect, useState } from 'react';
import '../../App.css';
import './RealtimeRanking.css';
import { FaYoutube, FaPlus } from 'react-icons/fa';
import { getOrCreateUUID } from '../../utils/uuid';
import YoutubeModal from '../youtube_modal/YoutubeModal';
import axios from 'axios';

// 채널 정보 파싱
const parseChannelInfo = (channelRaw) => {
  const lines = channelRaw.split('\n').map(l => l.trim()).filter(l => l !== '');
  const artist = lines[1] || lines[0] || ''; // 두 번째 줄이 채널명인 경우
  let views = '';
  let uploaded = '';

  const infoLine = lines.find(line => line.includes('조회수') && line.includes('•'));
  if (infoLine) {
    const parts = infoLine.split('•').map(part => part.trim());
    if (parts[0].includes('조회수')) views = parts[0].replace('조회수', '').trim();
    uploaded = parts[1] || '';
  }

  return { artist, views, uploaded };
};

const RealtimeRanking = ({ playlist, setPlaylist }) => {
  const [songs, setSongs] = useState([]); // 유튜브 인기곡 목록
  const [showModal, setShowModal] = useState(false); // 모달창
  const [selectedPlayListId, setSelectedPlaylistId] = useState(1); // 기본 플레이리스트
  const [playlistTables, setPlaylistTables] = useState([]); // 사용자 플레이리스트
  const [selectedSong, setSelectedSong] = useState(null); // 클릭한 곡
  const [hoveredSong, setHoveredSong] = useState(null); // 마우스 호버한 곡
  const uuid = getOrCreateUUID();
  const currentPreview = hoveredSong || selectedSong;
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null); // iframe에 넣을 videoId

  // 유튜브 iframe 모달창
  const handleOpenYoutubeModal = (song) => {
    const videoId = extractVideoId(song.youtubeUrl);
    if (!videoId) {
      alert('유효한 링크가 아닙니다!');
      return;
    }
    setYoutubeVideoId(videoId);
    setYoutubeModalOpen(true);
  }

  const handleCloseYoutubeModal = () => {
    setYoutubeModalOpen(false);
    setYoutubeVideoId(null);
  };

  // 유튜브 링크에서 videoId 추출 함수
  const extractVideoId = (url) => {
    const regExp = /(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  const handleAddToPlaylist = (song) => {
    setSelectedSong(song); // 담을 곡
    setShowModal(true); // 모달창
  };

  // 중복방지(크롤링시 순위변동으로 url에서 index변할 우려 있음)
  const getYoutubeVideoId = (url) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  const handleConfirmAdd = () => {
    if (!selectedSong) return;

    const newVideoId = getYoutubeVideoId(selectedSong.youtubeUrl);

    if (currentPlaylist.find(item =>{
      const existingVideoId = getYoutubeVideoId(item.youtubeUrl);
      return existingVideoId === newVideoId;
    })){
      alert('이미 이 플레이리스트에 담긴 곡입니다!');
      return;
    }

    const { artist, views, uploaded } = parseChannelInfo(selectedSong.channel);

    const payload = {
      uuid,
      title: selectedSong.title,
      artist,
      youtubeUrl: selectedSong.youtubeUrl,
      youtubeThumbnail: selectedSong.thumbnail,
      releaseDate: uploaded || null,
      genre: selectedSong.genre || null,
      viewCount: views === '' ? null : parseInt(views.replace(/[^0-9]/g, ''))
    };

    const url = selectedPlayListId === 1
      ? `${process.env.REACT_APP_API_BASE}/api/playlists/default/${uuid}`
      : `${process.env.REACT_APP_API_BASE}/api/playlists/custom`;

    const data = selectedPlayListId === 1
      ? payload
      : { ...payload, playlist_table_id: selectedPlayListId };

      axios.post(url, data)
      .then(res => {
        setCurrentPlaylist(prev => [...prev, { ...selectedSong, playlist_table_id: selectedPlayListId }]);
        setPlaylist(prev => [...prev, { ...selectedSong, playlist_table_id: selectedPlayListId }]);
        alert('담기 성공!')
        setShowModal(false);
      })
      .catch(err => {
        const status = err?.response?.status;
    
        if (status === 409) {
          alert('현재 선택한 플레이리스트에 이미 담긴 곡입니다.');
        }
        else {
          console.error('기타 오류:', err);
          alert('서버 오류가 발생했습니다.');
        }
      });
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setYoutubeModalOpen(false);
        setYoutubeVideoId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  useEffect(() => {
    const uuid = getOrCreateUUID();
  
    if (!selectedPlayListId) return;
  
    const url = selectedPlayListId === 1
      ? `${process.env.REACT_APP_API_BASE}/api/playlists/default/${uuid}`
      : `${process.env.REACT_APP_API_BASE}/api/playlists/${selectedPlayListId}/${uuid}`;
  
    axios.get(url)
      .then(res => {
        setCurrentPlaylist(res.data); // 현재 선택된 플레이리스트의 곡들만!
      })
      .catch(err => {
        console.error('플레이리스트 조회 실패:', err);
      });
  }, [selectedPlayListId, showModal]); // showModal 변경 시에도 새로 불러옴  

  // 유튜브 TOP100 호출
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/youtube`)
      .then(res => res.json())
      .then(data => {
        setSongs(data);
        setSelectedSong(data[0]);
      })
      .catch(err => console.error('유튜브 Top100 API 호출 실패:', err));

    console.log('REACT_APP_API_BASE:', process.env.REACT_APP_API_BASE);
    axios.get(`${process.env.REACT_APP_API_BASE}/api/playlisttables/${uuid}`)
      .then(res => {
        const lists = res.data;

        const fullList = [
          { id: 1, title: '기본 플레이리스트', uuid},
          ...lists
        ];
        setPlaylistTables(fullList);
      })
      .catch(err => {
        console.error('사용자 플레이리스트 목록 불러오기 실패:', err);
      })
  }, []);

  return (
    <div className="realtime-layout">
      {/* 좌측: 선택된 곡 프리뷰 */}
      <div className="realtime-preview">
          <div className="preview-header">
            <h3>한국 인기곡 Top100</h3>
            <p>이번 주 YouTube에서 가장 인기 있는 노래의 순위입니다.</p>
          </div>

          {currentPreview ?(
            <>
          <div className="preview-content">
              <img src={currentPreview.thumbnail} alt={currentPreview.title} />
              <h2 className="song-title">{currentPreview.title}</h2>
              <p className="channel-name">{currentPreview.channel}</p>
          </div>

          <div className="preview-buttons">
              <button onClick={() => handleOpenYoutubeModal(currentPreview)}>
                <FaYoutube />재생
              </button>
              <button onClick={() => handleAddToPlaylist(currentPreview)}>
                <FaPlus />담기
              </button>
          </div>

          </>
          ) : (
            <div className="preview-loading">
              <p>로딩 중입니다...</p>
            </div>
          )}
        </div>

      {/* 우측: 리스트 */}
      <div className="realtime-list">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="realtime-item"
            onClick={() => setSelectedSong(song)}
            onMouseEnter={() => setHoveredSong(song)}
            onMouseLeave={() => setHoveredSong(song)}
          >
            <span className="rank">{index + 1}</span>
            <img src={song.thumbnail} alt={song.title} />
            <div className="info">
              <p className="title">{song.title}</p>
              <p className="meta">{song.channel} {song.views} {song.uploaded}</p>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>플레이리스트에 담기</h3>

            {/* 드롭박스 영역 */}
            <div className="modal-inline-row">
              <select
                id="playlistSelect"
                value={selectedPlayListId}
                onChange={(e) => setSelectedPlaylistId(parseInt(e.target.value))}
                className="modal-input"
              >
                {playlistTables.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.title}
                  </option>
                ))}
              </select>
            
              <button className="modal-confirm" onClick={handleConfirmAdd}>등록</button>
              <button className="modal-close" onClick={() => setShowModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
      <YoutubeModal
        isOpen={youtubeModalOpen}
        onClose={handleCloseYoutubeModal}
        videoId={youtubeVideoId}
      />
  </div>
  );
};

export default RealtimeRanking;