const express = require('express');
const router = express.Router();
const { LatteSong } = require('../models');

// 전체 라떼곡 목록 (일반 조회용)
router.get('/', async (req, res) => {
  try {
    const songs = await LatteSong.findAll({
      order: [['viewCount', 'DESC']]
    });
    res.json(songs);
  } catch (error) {
    console.error('곡 불러오기 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 특정 유저의 특정 플레이리스트에 등록된 라떼곡 조회
router.get('/:playlist_table_id/:uuid', async (req, res) => {
  const { playlist_table_id, uuid } = req.params;

  try {
    const songs = await LatteSong.findAll({
      where: {
        playlist_table_id,
        uuid
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(songs);
  } catch (error) {
    console.error('라떼곡 조회 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 서버에서 crud
// 라떼곡 등록 (단건/복수 + uuid/playlist_table_id 포함)
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    let result;

    // 배열 등록
    if (Array.isArray(data)) {
      const newSongs = data.map(({
        uuid,
        title,
        artist,
        releaseDate,
        genre,
        youtubeUrl,
        youtubeThumbnail,
        playlist,
        viewCount,
        playlist_table_id
      }) => ({
        uuid,
        title,
        artist,
        releaseDate,
        genre,
        youtubeUrl,
        youtubeThumbnail,
        playlist,
        viewCount,
        playlist_table_id
      }));

      result = await LatteSong.bulkCreate(newSongs);
      
    // 단건 등록
    } else {
      const {
        uuid,
        title,
        artist,
        releaseDate,
        genre,
        youtubeUrl,
        youtubeThumbnail,
        playlist,
        viewCount,
        playlist_table_id
      } = data;

      result = await LatteSong.create({
        uuid,
        title,
        artist,
        releaseDate,
        genre,
        youtubeUrl,
        youtubeThumbnail,
        playlist,
        viewCount,
        playlist_table_id
      });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('곡 등록 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 라떼곡 수정
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const [updated] = await LatteSong.update(updateData, {
      where: { id }
    });

    if (updated) {
      const updatedSong = await LatteSong.findByPk(id);
      res.json(updatedSong);
    } else {
      res.status(404).json({ message: '수정 대상이 없습니다' });
    }
  } catch (error) {
    console.error('곡 수정 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 라떼곡 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await LatteSong.destroy({ where: { id }});

    if (deleted) {
      res.json({ message: '삭제 완료' });
    } else {
      res.status(404).json({ message: '해당 곡을 찾을 수 없습니다' });
    }
  } catch (error) {
    console.error('곡 삭제 실패:', error);
    res.status(500).json({ mesage: '서버 에러' });
  }
})

// 라떼곡 전체 삭제
router.delete('/', async (req, res) => {
  try {
    const deleted = await LatteSong.destroy({ where: {} });
    res.json({ message: `전체 ${deleted}곡 삭제됨` });
  } catch (error) {
    console.error('전체 삭제 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 라떼랭킹에서 기본 제공 플레이리스트에 등록
router.post('/default/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const song = req.body;

  try {
    const {
      title,
      artist,
      releaseDate,
      genre,
      youtubeUrl,
      youtubeThumbnail,
      viewCount
    } = song;

    const created = await Playlist.create({
      playlist_table_id: 1,
      uuid: uuid,
      title,
      artist,
      releaseDate,
      genre,
      youtubeUrl,
      youtubeThumbnail,
      viewCount
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('라떼곡 기본플레이리스트에 담기 실패:', err);
    res.status(500).json({ message:'서버 에러' });
  }
});

module.exports = router;