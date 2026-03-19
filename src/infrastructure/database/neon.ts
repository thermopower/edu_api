import { Pool } from '@neondatabase/serverless';

// 핫 리로딩(HMR) 환경에서 Pool 인스턴스가 무한 생성되는 것을 방지하기 위한 싱글톤 패턴
const globalForNeon = global as unknown as { neonPool: Pool };

export const dbPool =
  globalForNeon.neonPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // fetchConnectionCache: true // 서버리스/엣지 환경에서 필요 시 주석 해제하세요
  });

if (process.env.NODE_ENV !== 'production') globalForNeon.neonPool = dbPool;

/**
 * 안전한 쿼리 실행을 위한 유틸리티 함수
 * @param text 실행할 SQL 쿼리 (예: 'SELECT * FROM users WHERE id = $1')
 * @param params 쿼리에 바인딩할 파라미터 (SQL Injection 방지를 위해 필수)
 */
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  // DB 연결 URL 누락을 조기에 감지 (Fail-fast)
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }

  const client = await dbPool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } catch (error) {
    // 운영 환경에서는 민감한 에러 내역이 그대로 노출되지 않도록 서버 쪽에만 로깅합니다.
    console.error('Database query error:', error);
    throw new Error('Failed to execute database query.');
  } finally {
    // 정상/에러 여부와 관계없이 풀에 커넥션을 반환해야 연결이 고갈되지 않습니다.
    client.release();
  }
}
