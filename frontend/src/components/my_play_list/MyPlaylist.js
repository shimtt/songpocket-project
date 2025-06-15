import React, { useState, useEffect } from 'react';
import './MyPlaylist.css'
import MyPlaylistCard from '../my_play_list_card/MyPlaylistCard';
import { FaPlus, FaMinus, FaSearch } from 'react-icons/fa';
import { getOrCreateUUID } from '../../utils/uuid';
import YoutubeModal from '../youtube_modal/YoutubeModal';
import axios from 'axios';

const MyPlaylist = ({ playlist, setPlaylist }) => {
  const savedId = localStorage.getItem('selectedPlaylistId');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistList, setPlaylistList] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(savedId ? Number(savedId) : 1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [filteredPlaylist, setFilteredPlaylist] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  // 검색 핸들러
  const handleSearch = () => {
    const songsInSelected = playlist.filter(song => song.playlist_table_id === selectedPlaylistId);
  
    if (!searchKeyword.trim()) {
      setFilteredPlaylist(songsInSelected);
      return;
    }
  
    const lowerKeyword = searchKeyword.toLowerCase();
    const filtered = songsInSelected.filter(song =>
      song.title.toLowerCase().includes(lowerKeyword) ||
      song.artist.toLowerCase().includes(lowerKeyword)
    );
    setFilteredPlaylist(filtered);
  };

  // 드롭다운 바꿨을 때,
  // searchKeyword가 비어 있으면 자동으로 filteredPlaylist를 갱신
  useEffect(() => {
    if (!searchKeyword.trim()) {
      handleSearch();
    }
  }, [playlist]);

  // 유튜브 url 파싱
  const extractYoutubeId = (url) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  // 플레이리스트 불러오기
  useEffect(() => {
    const uuid = getOrCreateUUID();
  
    if (!selectedPlaylistId) return;
  
    if (selectedPlaylistId === 1) {
      axios.get(`${process.env.REACT_APP_API_BASE}/api/playlists/default/${uuid}`)
        .then(res => {
          setPlaylist(res.data);
        })
        .catch(err => {
          console.error('기본 플레이리스트 불러오기 실패:', err);
        });
    } else {
      axios.get(`${process.env.REACT_APP_API_BASE}/api/playlists/${selectedPlaylistId}/${uuid}`)
        .then(res => {
          setCurrentPlaylist(res.data);
          setPlaylist(res.data);
        })
        .catch(err => {
          console.error('플레이리스트 불러오기 실패:', err);
        });
    }
  }, [selectedPlaylistId]);

  // 플레이리스트 목록 불러오기
  useEffect(() => {
    const uuid = getOrCreateUUID();

    axios.get(`${process.env.REACT_APP_API_BASE}/api/playlisttables/${uuid}`)
      .then(res => {
        const defaultPlaylist = {
          id: 1,
          title: '기본 플레이리스트',
          isDefault: true
        };

        setPlaylistList([defaultPlaylist, ...res.data]);
      })
      .catch(err => {
        console.error('플레이리스트 목록 불러오기 실패:',err);
      });
  }, []);

  // 플레이리스트 등록
  const handleAddPlaylist = () => {
    const trimmed = playlistTitle.trim();
    if (!trimmed) return;

    const uuid = getOrCreateUUID();

    const newPlaylist = {
      uuid,
      id: Date.now(),
      title: trimmed
    };

    console.log('등록된 play:', newPlaylist);
    console.log('전체 리스트:', [...playlistList, newPlaylist]);

    axios.post(`${process.env.REACT_APP_API_BASE}/api/playlisttables`, newPlaylist)
      .then((res) => {
        const saved = res.data;

        setPlaylistList(prev => [...prev, saved]); // 서버 응답값으로 리스트 추가
        setSelectedPlaylistId(saved.id);
        setPlaylistTitle('');
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.error('플레이리스트 생성 실패:', err);
        alert('리스트 생성에 실패하였습니다.');
      });
  };

  // 플레이리스트 삭제
  const handleDeletePlaylist = () => {
    // 기본 플레이리스트는 삭제 불가
    const selected = playlistList.find(p => p.id === selectedPlaylistId);
    if (!selected || selected.isDefault){
      alert("기본 플레이리스트는 삭제할 수 없습니다.");
      return;
    }

    const confirmDelete = window.confirm(`${selected.title}을 삭제하시겠습니까?`);
    if (!confirmDelete) return;

    // 삭제 API 호출
    axios.delete(`${process.env.REACT_APP_API_BASE}/api/playlisttables/${selectedPlaylistId}`)
      .then(() => {
        // filter로 선택 제외 배열에 남김(filter선택된 대상 삭제)
        const updated = playlistList.filter(p => p.id !== selectedPlaylistId);
        setPlaylistList(updated);
        setSelectedPlaylistId(1);
        localStorage.setItem('selectedPlaylistId', 1);
        setPlaylist([]); // 기존 곡 목록 비우기
      })
      .catch(err => {
        console.error('플레이리스트 삭제 실패:', err);
        alert('삭제에 실패했습니다.');
      });
  }

  // 플레이리스트 내부 아이템 삭제
  const handleDelete = (id) => {
    // const songToDelete = playlist.find((song) => song.id === id);

    // 기본 제공곡 삭제시 막기
    // if (songToDelete?.uuid === 'default') {
    //   alert('기본 제공곡은 삭제할 수 없습니다.');
    //   return;
    // }

    axios.delete(`${process.env.REACT_APP_API_BASE}/api/playlists/${id}`)
      .then(() => {
        const updatedList = playlist.filter(card => card.id !== id);
        setPlaylist(updatedList);
      })
      .catch(err => {
        console.error('곡 삭제 실패:', err);
        alert('곡 삭제에 실패했습니다.');
      });
  };

  return (
    <div className="playlist-page-wrapper">
      {/* 모달창 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>새 플레이리스트 만들기</h3>

            <div className="modal-inline-row">
                <input 
                  type="text" 
                  placeholder="제목 입력" 
                  className="modal-input" 
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPlaylist();
                    }
                  }}
                />
                <button className="modal-confirm" onClick={handleAddPlaylist}>등록</button>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>정말 삭제하시겠습니까?</h3>
              <button
                className="modal-confirm"
                onClick={() => {
                  handleDeletePlaylist();
                  setIsDeleteModalOpen(false);
                }}
              >
                확인
              </button>
              <button
                className="modal-close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                취소
              </button>
          </div>
        </div>
      )}

      <div className="playlist-toolbar">
        {/* 검색창 */}
        <div className="playlist-search-wrapper">
          <input
            type="text"
            placeholder="음악 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
                setSearchTriggered(true);
              }
            }}
            className="playlist-search-input"
          />
          <FaSearch 
            className="playlist-search-icon"
            onClick={() => {
              handleSearch();
              setSearchTriggered(true);
            }}
          />
        </div>

        {/* 플레이리스트 선택 / 생성 버튼 */}
        <div className="playlist-top-bar">
          <select
            value={selectedPlaylistId || ''}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              setSelectedPlaylistId(selectedId);
              localStorage.setItem('selectedPlaylistId', selectedId); // 로컬 저장 추가
            }}
          >
            {playlistList.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}

          </select>
            <button onClick={() => setIsModalOpen(true)}><FaPlus className="playlist-plus-icon"/> 추가</button>
            <button onClick={() => setIsDeleteModalOpen(true)}><FaMinus className="playlist-plus-icon"/> 삭제</button>
          </div>
        </div>

        <div className="card-scroll-area">
          <div className="card-grid">
            {/* 조건부 렌더링 처리 */}
            {filteredPlaylist && Array.isArray(filteredPlaylist) && filteredPlaylist.map((song) => (
              <MyPlaylistCard
                key={song.id}
                id={song.id}
                title={song.title}
                channel={song.channel}
                youtubeThumbnail={song.youtubeThumbnail}
                youtubeUrl={song.youtubeUrl}
                onDelete={handleDelete}
                onClick={() => {
                  const videoId = extractYoutubeId(song.youtubeUrl);
                  setSelectedVideoId(videoId);
                  setIsYoutubeModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {isYoutubeModalOpen && (
          <YoutubeModal
            isOpen={isYoutubeModalOpen}
            videoId={selectedVideoId}
            onClose={() => setIsYoutubeModalOpen(false)}
          />
        )}
    </div>
  )
}

export default MyPlaylist;