// 서버 실행만 담당

// 설정된 app 가져오기(app.js)
const app = require('./app')
const port = 4000;

app.listen(port, () => {
  console.log(`서버 실행 중! http://localhost:${port}`)
});