import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import rankingRoutes from './routes/ranking';

dotenv.config();

const app = express();

// ── 미들웨어 ──────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── 헬스체크 ──────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API 라우트 ─────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/ranking', rankingRoutes);

export default app;
