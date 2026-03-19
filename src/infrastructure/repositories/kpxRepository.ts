import { query } from "@/infrastructure/database/neon";

export interface KpxSmpForecast {
  id: string;
  date: string;
  hour: number;
  area_name: string;
  smp: string | null;
  mlfd: string | null;
  jlfd: string | null;
  slfd: string | null;
  created_at: Date;
}

export async function getKpxSmpDemand(date: string | null, pageNo: number, numOfRows: number) {
  let sql = "SELECT * FROM kpx_smp_forecast WHERE 1=1";
  const params: unknown[] = [];
  
  if (date) {
    params.push(date);
    sql += ` AND date = $${params.length}`;
  }
  
  sql += " ORDER BY date DESC, hour ASC";
  
  const offset = (pageNo - 1) * numOfRows;
  
  // pagination
  params.push(numOfRows);
  sql += ` LIMIT $${params.length}`;
  
  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  // total count
  let countSql = "SELECT COUNT(*) as cnt FROM kpx_smp_forecast WHERE 1=1";
  const countParams: unknown[] = [];
  if (date) {
    countParams.push(date);
    countSql += ` AND date = $${countParams.length}`;
  }
  
  const [items, countResult] = await Promise.all([
    query<KpxSmpForecast>(sql, params),
    query<{ cnt: string }>(countSql, countParams)
  ]);
  
  const totalCount = parseInt(countResult[0]?.cnt || "0", 10);
  
  return { items, totalCount };
}
