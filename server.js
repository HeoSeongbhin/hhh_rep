const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // bcrypt 추가
const app = express();
const port = 3000;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // 'public' 폴더에서 정적 파일 제공

// MongoDB에 연결
mongoose.connect('mongodb://localhost:27017/db')
.then(() => console.log('MongoDB에 연결되었습니다.'))
.catch(err => console.error('MongoDB 연결 에러:', err));

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    tel: String,
    email: String,
    dob: Date,
    url: String,
    gender: String
});

const User = mongoose.model('User', userSchema);

// 사용자 등록 라우트 (회원가입)
app.post('/register', async (req, res) => {
    const { username, password, name, tel, email, dob, url, gender } = req.body;

    if (!username || !password || !name || !tel || !email || !dob || !url || !gender) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '사용자가 이미 존재합니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
        const newUser = new User({ username, password: hashedPassword, name, tel, email, dob, url, gender });
        await newUser.save();
        res.status(201).json({ message: '회원가입 성공!' });
    } catch (error) {
        console.error('회원가입 오류:', error.massage);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 사용자 중복 검사 라우트
app.post('/check-duplicate', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: '사용자명을 입력해주세요.' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(200).json({ exists: true }); // 중복된 경우
        } else {
            return res.status(200).json({ exists: false }); // 중복되지 않은 경우
        }
    } catch (error) {
        console.error('중복 검사 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 로그인 라우트
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) { // 비밀번호 비교
            res.json({
                success: true,
                userInfo: {
                    username,
                    name: user.name,
                    tel: user.tel,
                    email: user.email,
                    dob: user.dob,
                    url: user.url,
                    gender: user.gender
                }
            });
        } else {
            res.status(401).json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 비밀번호 재설정 라우트
app.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res.status(400).json({ message: '사용자명과 새 비밀번호가 필요합니다.' });
    }

    try {
        const user = await User.findOne({ username });
        if (user) {
            const hashedPassword = await bcrypt.hash(newPassword, 10); // 비밀번호 암호화
            user.password = hashedPassword;
            await user.save();
            console.log('비밀번호가 변경되었습니다.'); // 비밀번호 변경 후 로그 출력
            res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
