import { query } from "@/infrastructure/database/neon";
import type { KmaFetchResult, KmaMidFcstFetchResult } from "@/infrastructure/external/kmaApiClient";

export interface KmaObservation {
  id: string;
  tm: string;
  stn: number;
  wd: string | null;
  ws: string | null;
  gst_wd: string | null;
  gst_ws: string | null;
  gst_tm: string | null;
  pa: string | null;
  ps: string | null;
  pt: string | null;
  pr: string | null;
  ta: string | null;
  td: string | null;
  hm: string | null;
  pv: string | null;
  rn: string | null;
  rn_day: string | null;
  rn_int: string | null;
  sd_hr3: string | null;
  sd_day: string | null;
  sd_tot: string | null;
  wc: string | null;
  wp: string | null;
  ww: string | null;
  ca_tot: string | null;
  ca_mid: string | null;
  ch_min: string | null;
  ct: string | null;
  ct_top: string | null;
  ct_mid: string | null;
  ct_low: string | null;
  vs: string | null;
  ss: string | null;
  si: string | null;
  st_gd: string | null;
  ts: string | null;
  te_005: string | null;
  te_01: string | null;
  te_02: string | null;
  te_03: string | null;
  st_sea: string | null;
  wh: string | null;
  bf: string | null;
  ir: string | null;
  ix: string | null;
  rn_jun: string | null;
  created_at: Date;
}

export async function getKmaObservations(tm: string | null, stnStr: string | null) {
  let sql = "SELECT * FROM kma_observation WHERE 1=1";
  const params: unknown[] = [];
  
  if (tm) {
    params.push(tm);
    sql += ` AND tm = $${params.length}`;
  }
  
  if (stnStr && stnStr !== "0") {
    // stn은 콜론(:) 단위로 여러 지점이 올 수 있음
    const stns = stnStr.split(":").map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    if (stns.length > 0) {
      params.push(stns);
      sql += ` AND stn = ANY($${params.length}::int[])`;
    }
  }
  
  sql += " ORDER BY tm DESC, stn ASC LIMIT 1000";
  
  const items = await query<KmaObservation>(sql, params);
  return items;
}

export async function saveKmaObservations(items: KmaFetchResult[]) {
  if (!items || items.length === 0) return 0;
  
  let insertedCount = 0;
  const sql = `
    INSERT INTO kma_observation (
      tm, stn, wd, ws, gst_wd, gst_ws, gst_tm, pa, ps, pt, pr, ta, td, hm, pv, 
      rn, rn_day, rn_jun, rn_int, sd_hr3, sd_day, sd_tot, wc, wp, ww, ca_tot, ca_mid, 
      ch_min, ct, ct_top, ct_mid, ct_low, vs, ss, si, st_gd, ts, te_005, te_01, te_02, te_03, 
      st_sea, wh, bf, ir, ix
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 
      $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46
    ) ON CONFLICT (tm, stn) DO NOTHING
  `;

  for (const item of items) {
    await query(sql, [
      item.tm, item.stn, item.wd || null, item.ws || null, item.gst_wd || null, 
      item.gst_ws || null, item.gst_tm || null, item.pa || null, item.ps || null, 
      item.pt || null, item.pr || null, item.ta || null, item.td || null, 
      item.hm || null, item.pv || null, item.rn || null, item.rn_day || null, 
      item.rn_jun || null, item.rn_int || null, item.sd_hr3 || null, item.sd_day || null, 
      item.sd_tot || null, item.wc || null, item.wp || null, item.ww || null, 
      item.ca_tot || null, item.ca_mid || null, item.ch_min || null, item.ct || null, 
      item.ct_top || null, item.ct_mid || null, item.ct_low || null, item.vs || null, 
      item.ss || null, item.si || null, item.st_gd || null, item.ts || null, 
      item.te_005 || null, item.te_01 || null, item.te_02 || null, item.te_03 || null, 
      item.st_sea || null, item.wh || null, item.bf || null, item.ir || null, item.ix || null
    ]);
    insertedCount++;
  }
  
  return insertedCount;
}

export interface KmaMidFcst {
  stn_id: string;
  tm_fc: string;
  wf_sv: string;
  data_type: string | null;
  created_at: Date;
}

export async function getKmaMidFcst(stnId: string | null, tmFc: string | null, pageNo: number, numOfRows: number) {
  let sql = "SELECT * FROM kma_midfcst WHERE 1=1";
  const params: unknown[] = [];
  
  if (stnId) {
    params.push(stnId);
    sql += ` AND stn_id = $${params.length}`;
  }
  if (tmFc) {
    params.push(tmFc);
    sql += ` AND tm_fc = $${params.length}`;
  }
  
  sql += " ORDER BY tm_fc DESC, stn_id ASC";
  
  const offset = (pageNo - 1) * numOfRows;
  
  params.push(numOfRows);
  sql += ` LIMIT $${params.length}`;
  
  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  let countSql = "SELECT COUNT(*) as cnt FROM kma_midfcst WHERE 1=1";
  const countParams: unknown[] = [];
  if (stnId) {
    countParams.push(stnId);
    countSql += ` AND stn_id = $${countParams.length}`;
  }
  if (tmFc) {
    countParams.push(tmFc);
    countSql += ` AND tm_fc = $${countParams.length}`;
  }
  
  const [items, countResult] = await Promise.all([
    query<KmaMidFcst>(sql, params),
    query<{ cnt: string }>(countSql, countParams)
  ]);
  
  const totalCount = parseInt(countResult[0]?.cnt || "0", 10);
  
  return { items, totalCount };
}

export async function saveKmaMidFcst(items: KmaMidFcstFetchResult[]) {
  if (!items || items.length === 0) return 0;
  
  let insertedCount = 0;
  const sql = `
    INSERT INTO kma_midfcst (stn_id, tm_fc, wf_sv, data_type) 
    VALUES ($1, $2, $3, $4) 
    ON CONFLICT (stn_id, tm_fc) DO UPDATE SET 
      wf_sv = EXCLUDED.wf_sv, 
      data_type = EXCLUDED.data_type
  `;

  for (const item of items) {
    await query(sql, [
      item.stnId, item.tmFc, item.wfSv || null, item.dataType || null
    ]);
    insertedCount++;
  }
  
  return insertedCount;
}
