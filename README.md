# 🍁 MapleStory Defense (Fullstack)

**React + TypeScript + Vite** 클라이언트와 **Express + Socket.io + MySQL** 백엔드 서버가 통합된 메이플스토리 디펜스 프로젝트입니다.

---

## 📁 프로젝트 구조

```
maple_client/
├── src/                   # 클라이언트 프론트엔드 (React 19, Zustand, TailwindCSS)
├── server/                # 백엔드 서버 (Node.js, Express, Socket.io, MySQL)
│   ├── src/
│   │   ├── routes/        # 인증(auth) 및 랭킹(ranking) API
│   │   ├── socket/        # 방 관리(room), 채팅(chat), 게임(game) 소켓
│   │   └── db/            # MySQL DB 커넥션 및 초기화
│   ├── .env.example       # 서버 환경 변수 예시
│   └── package.json
└── package.json           # 통합 실행 및 빌드 스크립트
```

---

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
# 클라이언트 & 루트 의존성 설치
npm install

# 서버 의존성 설치
npm run server:install
```

### 2. 서버 환경변수 설정
`server/.env.example` 파일을 참고하여 `server/.env` 파일에서 MySQL 접속 정보를 설정합니다.
```bash
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=maple_defense
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### 3. DB 초기화 (최초 1회)
MySQL에서 `maple_defense` 데이터베이스를 생성한 후 아래 명령을 실행합니다:
```bash
npm run server:init
```

---

## 💻 실행 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` (또는 `npm run dev:client`) | 클라이언트 개발 서버 실행 (`http://localhost:5173`) |
| `npm run dev:server` | 백엔드 API & 소켓 서버 실행 (`http://localhost:3001`) |
| `npm run dev:all` | **클라이언트와 백엔드 서버를 동시에 실행** |
| `npm run build` | 클라이언트 프로덕션 빌드 |
| `npm run build:server` | 백엔드 서버 TypeScript 빌드 |
