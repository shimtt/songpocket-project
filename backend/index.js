// 서버 실행만 담당

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // 로컬에서만 .env 로드
}

// 설정된 app 가져오기(app.js)
const app = require('./app')
const db = require('./models')
// const port = 4000;
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 4000;

// 로컬만
// app.listen(port, () => {
//   console.log(`서버 실행 중! http://localhost:${port}`)
// });

// railway DB
db.sequelize.sync({ force:false })
  .then(() => {
    console.log('DB sync 완료');

    app.listen(port, () => {
      console.log(`서버 실행 중! http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('DB sync 실패:', err);
  });