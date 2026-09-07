import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'maple_defense',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL 연결 성공');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL 연결 실패:', err);
    process.exit(1);
  }
};

export default pool;
