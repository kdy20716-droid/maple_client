import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import { testConnection } from './db/mysql';
import { registerRoomHandler } from './socket/roomHandler';
import { registerChatHandler } from './socket/chatHandler';
import { registerGameHandler } from './socket/gameHandler';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── HTTP + Socket.io 서버 생성 ─────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Socket.io 연결 처리 ─────────────────────────
io.on('connection', (socket) => {
  const username = (socket.handshake.auth as any).username || '익명';
  console.log(`🔌 연결: ${socket.id} (${username})`);

  registerRoomHandler(io, socket);
  registerChatHandler(io, socket);
  registerGameHandler(io, socket);

  socket.on('disconnect', () => {
    console.log(`🔌 연결 해제: ${socket.id} (${username})`);
  });
});

// ── 서버 시작 ──────────────────────────────────
const start = async () => {
  await testConnection();

  httpServer.listen(PORT, () => {
    console.log('');
    console.log('🍁 ================================');
    console.log(`🍁  MapleStory Defense Server`);
    console.log(`🍁  http://localhost:${PORT}`);
    console.log('🍁 ================================');
    console.log('');
  });
};

start();
