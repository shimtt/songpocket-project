// 미들웨어 + 라우터 설정

const express = require('express');
const cors = require('cors');
const songRouter = require('./routes/song');
const youtubeRouter = require('./routes/youtube');
const playlistRouter = require('./routes/playlist');
const playlistTableRouter = require('./routes/playlisttable');
const aIrecommendationRouter = require('./routes/ai');

const app = express();

const allowedOrigins = [
  'https://songpocket.netlify.app',
  'http://localhost:3000' // 로컬 프론트용
];

// CORS 허용(프론트에서 요청 가능)
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 오류: 허용되지 않은 origin'));
    }
  },
  credentials: true
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
