import { Router, Request, Response } from 'express';
import pool from '../db/mysql';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// ── 랭킹 조회 (상위 50명) ─────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        u.username,
        MAX(gr.score)      AS best_score,
        MAX(gr.wave)       AS best_wave,
        COUNT(gr.id)       AS games_played,
        MAX(gr.created_at) AS last_played
      FROM game_records gr
      JOIN users u ON gr.user_id = u.id
      GROUP BY gr.user_id, u.username
      ORDER BY best_score DESC
      LIMIT 50
    `);
    res.json({ ranking: rows });
  } catch (err) {
    console.error('랭킹 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ── 게임 기록 저장 (로그인 필요) ──────────────
router.post(
  '/record',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { score, wave, units_used } = req.body;

    if (score === undefined || wave === undefined) {
      res.status(400).json({ message: 'score, wave 값이 필요합니다.' });
      return;
    }

    try {
      await pool.query(
        'INSERT INTO game_records (user_id, score, wave, units_used) VALUES (?, ?, ?, ?)',
        [req.userId, score, wave, units_used || 0]
      );
      res.status(201).json({ message: '기록 저장 완료' });
    } catch (err) {
      console.error('기록 저장 오류:', err);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
);

export default router;
