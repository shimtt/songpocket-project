const express = require('express');
const router = express.Router();
const { PlaylistTable } = require('../models');
const { Playlist } = require('../models');
const { Op } = require("sequelize");

// uuid 기준으로 해당 사용자의 모든 플레이리스트 목록 조회
router.get('/:uuid', async (req, res) => {
  const { uuid } = req.params;

  try{
    const lists = await PlaylistTable.findAll({
      where: {
        uuid,
        id: { [Op.ne]: 1 } // playlist_table_id = 1 제외 (기본 리스트는 하드코딩)
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(lists);
  } catch (err) {
    console.error('플레이리스트 목록 조회 실패:', err);
    res.status(500).json({ message:'서버 오류' });
  }
});

// 새 플레이리스트 추가
router.post('/', async (req, res) => {
  const { uuid, title, description } = req.body;

  if (!uuid || !title){
    return res.status(400).json({message: 'uuid와 title을 찾을 수 없습니다.'});
  }

  try {
    const newList = await PlaylistTable.create({
      uuid,
      title,
      description
    });

    res.status(201).json(newList);
  } catch (err) {
    console.error('플레이리스트 생성 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }

});

// 플레이리스트 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('삭제 요청 ID:', id);

  try {
    if (parseInt(id) === 1) {
      console.log('기본 플레이리스트는 삭제 불가');
      return res.status(400).json({ message: '기본 플레이리스트는 삭제할 수 없습니다' });
    }

    // 1. 연결된 Playlist 삭제
    await Playlist.destroy({ where: { playlist_table_id: id } });

    // 2. PlaylistTable 삭제
    await PlaylistTable.destroy({ where: { id } });

    res.json({ message: '플레이리스트 삭제 완료' });
  } catch (err) {
    console.error('플레이리스트 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
