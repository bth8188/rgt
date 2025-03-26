import { Pool } from '@neondatabase/serverless';

// 환경 변수에서 데이터베이스 URL 가져오기
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 데이터베이스 쿼리 함수
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows;
}

// 애플리케이션 종료 시 연결 닫기 (선택 사항)
export async function closePool(): Promise<void> {
  await pool.end();
}
