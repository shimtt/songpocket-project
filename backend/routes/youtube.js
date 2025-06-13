const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../data/youtube_top100.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if(err){
      console.error('JSON 읽기 실패:', err);
      return res.status(500).json({ error:'파일 읽기 오류' });
    }
    res.json(JSON.parse(data));
  });
});

module.exports = router;