import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../App.css';
import './LatteSongList.css';
import { FaYoutube } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { getOrCreateUUID } from '../../utils/uuid';
import YoutubeModal from '../youtube_modal/YoutubeModal';

const LatteSongList = ({ handleAiRefresh }) => {
  
  const [songs, setSongs] = useState([]);
  const [playlistTables, setPlaylistTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedPlayListId, setSelectedPlaylistId] = useState(1); // 기본 플레이리스트
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20); // 처음엔 20개
  const [visibleSongs, setVisibleSongs] = useState([]); // 실제 화면에 보여질 곡

  // videoId 추출(유튜브 플레이어)
  const extractVideoId = (url) => {
    const regExp = /(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  // 유튜브 모달 열기
  const handleOpenYoutubeModal = (song) => {
    const videoId = extractVideoId(song.youtubeUrl);
    if (!videoId) {
      alert('유효하지 않은 유튜브 링크입니다!');
      return;
    }
    setYoutubeVideoId(videoId);
    setYoutubeModalOpen(true);
  };

  // 유튜브 모달 닫기
  const handleCloseYoutubeModal = () => {
    setYoutubeVideoId(null);
    setYoutubeModalOpen(false);
  };  
  
  // 플레이리스트 모달
  const handleOpenModal = (song) => {
    setSelectedSong(song);
    setShowModal(true);
  }

  // 등록 분기(기본 + uuid)
  const handleConfirmAdd = () => {
    if (!selectedSong) return;
  
    const uuid = getOrCreateUUID();
  
    const payload = {
      uuid,
      title: selectedSong.title,
      artist: selectedSong.artist,
      releaseDate: selectedSong.releaseDate || null,
      genre: selectedSong.genre || null,
      youtubeUrl: selectedSong.youtubeUrl,
      youtubeThumbnail: selectedSong.youtubeThumbnail,
      viewCount: selectedSong.viewCount || null
    };
  
    const url = selectedPlayListId === 1
      ? `${process.env.REACT_APP_API_BASE}/api/playlists/default/${uuid}`
      : `${process.env.REACT_APP_API_BASE}/api/playlists/custom`;
  
    const data = selectedPlayListId === 1
      ? payload
      : { ...payload, playlist_table_id: selectedPlayListId };
  
    axios.post(url, data)
      .then(() => {
        alert('담기 성공!');
        setShowModal(false);

        if(handleAiRefresh) {
          handleAiRefresh();
        }
      })
      .catch(err => {
        const status = err?.response?.status;
  
        if (status === 409) {
          alert('현재 선택한 플레이리스트에 이미 담긴 곡입니다.');
        } else if (status === 208) {
          alert('이미 다른 플레이리스트에 담긴 곡입니다.\n다른 플레이리스트를 선택해 주세요.');
        } else {
          console.error('기타 오류:', err);
          alert('서버 오류가 발생했습니다.');
        }
      });
  };  
  
  // 화면에 보여질 곡 개수
  // visibleCount 바뀔때 visibleSongs 업데이트
  useEffect(() => {
    setVisibleSongs(songs.slice(0, visibleCount));
  }, [songs, visibleCount]);

  // 스크롤 감지로
  useEffect(() => {
    const tbody = document.querySelector('.latte-table tbody');
  
    const handleScroll = () => {
      if (tbody.scrollTop + tbody.clientHeight >= tbody.scrollHeight - 100) {
        setVisibleCount((prev) => {
          if (prev >= songs.length) return prev;
          return prev + 10;
        });
      }
    };
  
    if (tbody) tbody.addEventListener('scroll', handleScroll);
    return () => tbody?.removeEventListener('scroll', handleScroll);
  }, [songs]);  

  // DB에서 곡 불러오기
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/songs`)
      .then(response => {
        const all = response.data;
        setSongs(all);
        setVisibleSongs(all.slice(0, 10)); // 10곡만
      })
      .catch(error => {
        console.error('노래 목록 불러오기 실패:', error);
      });
  }, []);

  // 사용자 플레이리스트 목록 불러오기
  useEffect(() => {
    const uuid = getOrCreateUUID();

    axios.get(`${process.env.REACT_APP_API_BASE}/api/playlisttables/${uuid}`)
      .then(res => {
        setPlaylistTables(res.data);
      })
      .catch(err => {
        console.error('플레이리스트 목록 불러오기 실패:', err);
      })
  }, []);

  return (
    <>
      <p className="latte-text">🍵 라떼 인기 TOP100</p>
      <div className="latte-table-wrapper">  
        <table className="latte-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>곡명</th>
              <th>가수</th>
              <th>발매일</th>
              <th>장르</th>
              <th>듣기</th>
              <th>담기</th>
              <th>좋아요</th>
            </tr>
          </thead>
          <tbody>
            {visibleSongs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  로딩 중입니다...
                </td>
              </tr>
            ) : 
            visibleSongs.map((song, index) => (
              <tr key={song.id}>
                <td>{index + 1}</td>
                <td>{song.title}</td>
                <td>{song.artist}</td>
                <td>{song.releaseDate?.substring(0, 4) + '년'}</td>
                <td>{song.genre}</td>
                <td>
                  <FaYoutube 
                    className="play-button" 
                    onClick={() => handleOpenYoutubeModal(song)} 
                  />
                </td>
                <td>
                  <FaPlus 
                    className="add-icon"
                    onClick={() => handleOpenModal(song)}
                  />
                </td>
                <td>{song.viewCount?.toLocaleString()}회</td>
              </tr>
            ))}
          </tbody>
        </table>

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
                  <option value={1}>기본 플레이리스트</option>
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
        {youtubeModalOpen && youtubeVideoId && (
          <YoutubeModal
            isOpen={youtubeModalOpen}
            videoId={youtubeVideoId}
            onClose={handleCloseYoutubeModal}
          />
      )}
      </div>
    </>
  );
};

export default LatteSongList;