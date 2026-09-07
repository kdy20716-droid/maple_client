/**
 * DB 초기화 스크립트
 * 실행: npm run db:init
 */
import pool from './mysql';
import dotenv from 'dotenv';

dotenv.config();

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    console.log('🔧 DB 초기화 시작...');

    // 유저 테이블
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        username   VARCHAR(20) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 랭킹 테이블 (게임 기록)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_records (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        score      INT NOT NULL DEFAULT 0,
        wave       INT NOT NULL DEFAULT 0,
        units_used INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ DB 초기화 완료! (users, game_records 테이블 생성)');
  } catch (err) {
    console.error('❌ DB 초기화 실패:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
};

initDB();
