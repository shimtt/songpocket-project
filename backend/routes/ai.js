const express = require('express');
const router = express.Router();
const { Playlist, Sequelize } = require('../models');
const { Op } = Sequelize;

// 많이 담긴 곡 추천
router.get('/popular', async (req, res) => {
  try {
    const popularSongs = await Playlist.findAll({
      attributes: [
        'title',
        'artist',
        'youtubeUrl',
        'youtubeThumbnail',
        [Sequelize.fn('COUNT', Sequelize.col('title')), 'count']
      ],
      group: ['title', 'artist', 'youtubeUrl', 'youtubeThumbnail'],
      having: Sequelize.literal('COUNT(title) >= 2'), // 최소 2곡이상 담긴 곡
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 1,
      raw: true
    });

    res.json(popularSongs);
  } catch (err) {
    console.error('많이 담긴 곡 추천 오류:', err);
    res.status(500).json({ message: '많이 담긴 곡 추천 실패' })
  }
})

// 유사도 추천 AI
router.get('/:uuid', async (req, res) => {
  const { uuid } = req.params;

  try {
    // 장르별 개수 세기
    const genreCounts = await Playlist.findAll({
      attributes: [
        'genre',
        [Sequelize.fn('COUNT', Sequelize.col('genre')), 'count']
      ],
      where: { 
        uuid,
        genre: { [Op.not]: null } // 장르 null 제외
      },
      group: ['genre'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 1
    });

    if (genreCounts.length === 0){
      return res.json([]); // 장르가 없다면 빈 배열
    }

    const topGenre = genreCounts[0].genre;

    // 해당 장르 기준 추천곡 가져오기
    const songs = await Playlist.findAll({
      where: {
        genre: topGenre,
        uuid: { [Op.ne]: uuid } // 추천 대상은 자기 플레이리스트 제외
      },
      // order: [['viewCount', 'DESC']],
      order: [
        [Sequelize.cast(Sequelize.col('viewCount'), 'UNSIGNED'), 'DESC']
      ],
      limit: 5,
      raw: true
    });

    console.log('🔥 추천 후보:', songs);

    res.json(songs);
  } catch (err) {
    console.error('AI 추천곡 오류:', err);
    res.status(500).json({ message: 'AI 추천 실패' });
  }
})

module.exports = router;