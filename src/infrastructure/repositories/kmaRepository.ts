import { query } from "@/infrastructure/database/neon";

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
