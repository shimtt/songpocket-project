// 미들웨어 + 라우터 설정

const express = require('express');
const cors = require('cors');
const songRouter = require('./routes/song');
const youtubeRouter = require('./routes/youtube');
const playlistRouter = require('./routes/playlist');
const playlistTableRouter = require('./routes/playlisttable');
const aIrecommendationRouter = require('./routes/ai');

const app = express();

// CORS 허용(프론트에서 요청 가능)
app.use(cors({
  origin: 'https://songpocket.netlify.app',
  credentials: true,
}));

// JSON 요청 파싱(req.body 사용 가능)
app.use(express.json());

// /api/* 경로로 Router 연결
app.use('/api/songs', songRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/playlisttables', playlistTableRouter);
app.use('/api/ai', aIrecommendationRouter);

// 기본 루트 응답(테스트용)
app.get('/', (req,res) => {
  res.send('라떼랭킹 API 서버 작동 중!');
});

module.exports = app;
