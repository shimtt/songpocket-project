const express = require('express');
const router = express.Router();
const { Playlist } = require('../models');

// 기본 제공 플레이리스트 불러오기
router.get('/default/:uuid', async (req, res) => {
  const { uuid } = req.params;

  try {
    // 기본 플레이리스트 곡
    const defaultSongs = await Playlist.findAll({
      where: { 
        playlist_table_id: 1,
        uuid: 'default',
      },
      order: [['createdAt', 'DESC']]
    });

    // 기본 플레이리스트에 사용자(uuid) 개별 추가 곡
    const userSongs = await Playlist.findAll({
      where: {
        playlist_table_id: 1,
        uuid: uuid,
      },
    });

    // 두 리스트 합치기
    const merged = [...defaultSongs, ...userSongs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    // 유튜브 URL에서 'v=' 파라미터 추출
    const extractYoutubeId = (url) => {
      const match = url.match(/[?&]v=([^&]+)/);
      return match ? match[1] : url;
    };

    // default + user 등록 곡 합친 후, v= 기준 중복 제거
    const deduped = merged.filter((song, index, self) =>
      index === self.findIndex(s =>
        extractYoutubeId(s.youtubeUrl) === extractYoutubeId(song.youtubeUrl)
      )
    );
    
    res.json(deduped);

  } catch (err) {
    console.error('기본 플레이리스트 불러오기 실패:', err);
    res.status(500).json({ message: '서버 에러' });
  }
})

// 기본 제공 플레이리스트에 등록 (배열 / 단일)
router.post('/default/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const songs = Array.isArray(req.body) ? req.body : [req.body]; // 배열이든 단일이든 통일 처리

  try {
    const createdSongs = [];

    for (const song of songs) {
      const {
        title,
        artist,
        releaseDate,
        genre,
        youtubeUrl,
        youtubeThumbnail,
        viewCount
      } = song;

      const exists = await Playlist.findOne({
        where: {
          uuid: uuid, // 사용자 고유값
          playlist_table_id: 1, // 드롭다운에서 선택된 플레이리스트
          youtubeUrl: song.youtubeUrl // 곡의 URL
        }
      });

      if (exists) {
        console.log(`중복: ${title}`);
        continue; // 중복이면 건너뛰기
      }

      const newSong = await Playlist.create({
        uuid,
        playlist_table_id: 1,
        title,
        artist,
        releaseDate,
        genre,
        youtubeUrl,
        youtubeThumbnail,
        viewCount
      });

      createdSongs.push(newSong);
    }

    if (createdSongs.length === 0) {
      return res.status(409).json({ message: '모든 곡이 이미 등록되어 있습니다.' });
    }

    res.status(201).json(createdSongs);
  } catch (err) {
    console.error('기본 플레이리스트 등록 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});


// 플레이리스트 등록(기본플레이리스트)
router.post('/', async (req, res) => {
  // console.log('실제 req.body:', req.body);
  // console.log('artist:', req.body.artist);
  // console.log('releaseDate:', req.body.releaseDate);
  // console.log('viewCount:', req.body.viewCount);

  try {
    const {
      uuid,
      title,
      artist,
      releaseDate,
      genre,
      youtubeUrl,
      youtubeThumbnail,
      viewCount,
      playlist_table_id
    } = req.body;

    // 중복방지(uuid + youtubeUrl 기준)
    const exists = await Playlist.findOne({
      where: {
        uuid,
        youtubeUrl // 같은 곡이면 일단 중복 후보
      }
    });
    
    if (exists && exists.playlist_table_id === playlist_table_id) {
      // 현재 선택한 플레이리스트에도 이미 있음 → 진짜 중복
      return res.status(409).json({ message: '이미 담은 곡입니다!' });
    }
    
    if (exists && exists.playlist_table_id !== playlist_table_id) {
      // 다른 플레이리스트에 이미 존재함 → 프론트에서 선택 유도
      return res.status(208).json({  // 208: 이미 보고된 항목
        message: '다른 플레이리스트에 이미 담은 곡입니다.',
        playlist_table_id: exists.playlist_table_id,
        title: exists.title
      });
    }

    const newSong = await Playlist.create({
      uuid,
      title,
      artist,
      releaseDate,
      genre,
      youtubeUrl,
      youtubeThumbnail,
      viewCount,
      playlist_table_id
    });

    return res.status(201).json({
      ...newSong.dataValues,
      playlist_table_id
    });
    
    } catch (err) {
      console.error('플레이리스트 저장 오류:', err);
      res.status(500).json({ message: '서버 오류' });
    }
})

// 사용자 정의 플레이리스트에 곡 등록
router.post('/custom', async (req, res) => {
  const {
    uuid,
    title,
    artist,
    releaseDate,
    genre,
    youtubeUrl,
    youtubeThumbnail,
    viewCount,
    playlist_table_id
  } = req.body;

  try {
    const exists = await Playlist.findOne({
      where: {
        uuid,
        youtubeUrl,
        playlist_table_id,
      }
    });

    if (exists) {
      return res.status(409).json({ message: '이미 담긴 곡입니다.' });
    }

    const newSong = await Playlist.create({
      uuid,
      title,
      artist,
      releaseDate,
      genre,
      youtubeUrl,
      youtubeThumbnail,
      viewCount,
      playlist_table_id
    });

    res.status(201).json({
      ...newSong.dataValues,
      playlist_table_id
    });
  } catch (err) {
    console.error('플레이리스트 저장 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});


// 플레이리스트 불러오기
router.get('/:playlist_table_id/:uuid', async (req, res) => {
  const { playlist_table_id, uuid } = req.params;

  try {
    const userSongs = await Playlist.findAll({
      where: { playlist_table_id, uuid },
      order: [['createdAt', 'DESC']]
    });

    res.json(userSongs);
  } catch (err) {
    console.error('플레이리스트 조회 오류:', err);
    res.status(500).json({ message:'서버 오류' });
  }
});

// 플레이리스트에서 곡 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const song = await Playlist.findByPk(id);

    // if (song?.uuid === 'default') {
    //   return res.status(403).json({ message: '기본 제공곡은 삭제할 수 없습니다.' })
    // }

    await Playlist.destroy({ where: { id } });
    res.json({ message: '곡 삭제 완료' });
  } catch (err) {
    console.error('곡 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 플레이리스트에서 곡 전체 삭제
router.delete('/', async (req, res) => {
  try {
    const deleted = await Playlist.destroy({ where: {} }); // 조건 없이 전부 삭제
    res.json({ message: `전체 ${deleted}곡 삭제됨` });
  } catch (err) {
    console.error('플레이리스트 전체 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;