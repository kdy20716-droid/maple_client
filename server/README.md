# 🍁 MapleStory Defense - Server

**Node.js + Express + Socket.io + MySQL** 기반 게임 서버

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
# .env.example 을 복사하여 .env 생성
copy .env.example .env
# .env 파일을 열어 DB_PASSWORD 등 수정
```

### 3. MySQL DB 및 테이블 생성
MySQL Workbench에서 `maple_defense` 데이터베이스를 먼저 생성하세요:
```sql
CREATE DATABASE maple_defense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
그 다음 테이블 자동 생성:
```bash
npm run db:init
```

### 4. 서버 실행 (개발)
```bash
npm run dev
```
서버가 `http://localhost:3001` 에서 실행됩니다.

---

## 📡 API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/health` | 서버 상태 확인 | ❌ |
| POST | `/api/auth/register` | 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |
| GET | `/api/ranking` | 랭킹 조회 (상위 50) | ❌ |
| POST | `/api/ranking/record` | 게임 기록 저장 | ✅ JWT |

## 🔌 Socket.io 이벤트

### 룸 관련
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `room:list` | → 서버 | 룸 목록 요청 |
| `room:create` | → 서버 | 룸 생성 |
| `room:join` | → 서버 | 룸 입장 |
| `room:ready` | → 서버 | 준비 상태 토글 |
| `room:start` | → 서버 | 게임 시작 (방장) |
| `room:leave` | → 서버 | 룸 나가기 |
| `room:state` | ← 서버 | 룸 상태 업데이트 |

### 게임 관련
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `game:state` | ↔ 양방향 | 게임 상태 동기화 |
| `game:unitMove` | ↔ 양방향 | 유닛 이동 |
| `game:enemyKill` | ↔ 양방향 | 적 처치 |
| `game:over` | ↔ 양방향 | 게임 종료 |

### 채팅
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `chat:send` | → 서버 | 채팅 전송 |
| `chat:receive` | ← 서버 | 채팅 수신 |
