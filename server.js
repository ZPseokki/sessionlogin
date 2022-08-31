const express = require('express');
const nunjucks = require('nunjucks');
const users = require('./model/user');
const app = express();
const session = require('express-session');
const MemoryStore = require('memorystore');


app.set('view engine', 'html');
nunjucks.configure('views', { express: app });
app.use(express.urlencoded({ extended: true }));

const maxAge = 10000;
const sessionObj = {
    secret: 'dfsfs', // 암호화에 대한 내용 아무거나 입력가능
    resave:false,
    saveUninitialized:true,
    cookie : {
        maxAge ,// 쿠키의 시간설정
    }
};
app.use(session(sessionObj));


// 메인페이지 접속시
app.get('/', (req, res) => {
    console.log(req.session); // 세션값 확인
    console.log(req.headers.cookie); // 쿠키값 확인
  if(req.headers.cookie) {

    console.log(req.headers.cookie); // 쿠키의 값 connect.id={cookie}
    const [, privateKey] = req.headers.cookie.split('='); // 쿠키의 value 추출
    const userInfo = session[privateKey];
    res.render('index.html', { // index.html 에 해당 객체전달 넌적스
        isLogin:true,
        userInfo
    }) 
  } else {
    res.render('login.html', {
        isLogin:false
    })
  }
  console.log(session);
});

app.post('/user/login', (req, res)=>{
    const {id, pw} = req.body;
    const [user] = users.userList.filter(user=>
        {return user.id === id && user.pw === pw});

    if(user) {
        const privateKey = Math.floor(Math.random() * 1000000000); // 난수생성
        session[privateKey] = user;
        req.session.user = user;
        res.setHeader('set-Cookie', `connect.id=${privateKey}; path=/`);
        res.redirect('/');
    } 
    else {
        res.send('로긴실패');
    }
});

app.get('/profile', (req, res) => {
    if(req.headers.cookie) {
        const [, privateKey] = req.headers.cookie.split('=');
        const userInfo = session[privateKey];
        res.render('profile.html', { userInfo
        });
    }
});

app.get('/user/logout', (req, res) => {
    if (req.headers.cookie) {
      if (req.headers.cookie) {
        const [, privateKey] = req.headers.cookie.split('=');
        delete session[privateKey];
        res.setHeader('Set-Cookie', 'connect.id=delete; Max-age=0; path=/');
        res.redirect('/');
      } else {
        res.redirect('/user/login?msg=로그인부터 하라니까요?!');
      }
    }
  });




app.listen(4000);

/* 
 session 객체의 형태
 {fe213bj: {id , pw}}
*/