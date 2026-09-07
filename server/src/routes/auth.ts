import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/mysql';

const router = Router();

// ── 회원가입 ──────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: '아이디와 비밀번호를 입력해 주세요.' });
    return;
  }
  if (username.length < 2 || username.length > 12) {
    res.status(400).json({ message: '아이디는 2~12자여야 합니다.' });
    return;
  }
  if (password.length < 4 || password.length > 20) {
    res.status(400).json({ message: '비밀번호는 4~20자여야 합니다.' });
    return;
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT id FROM users WHERE username = ?', [username]
    );
    if (rows.length > 0) {
      res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashed]
    );

    res.status(201).json({ message: '회원가입 성공! 로그인 해주세요.' });
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ── 로그인 ──────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: '아이디와 비밀번호를 입력해 주세요.' });
    return;
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      res.status(401).json({ message: '아이디 또는 비밀번호가 틀립니다.' });
      return;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: '아이디 또는 비밀번호가 틀립니다.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
