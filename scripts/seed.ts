import { config } from "dotenv";
config({ path: ".env.local" });

// '네온 풀'이 등록되기 전에 환경 변수(DATABASE_URL)가 로드될 수 있도록 import를 함수 내부나 동적(Dynamic)으로 바꿉니다.

async function seedKma() {
  const { query } = await import("../src/infrastructure/database/neon");
  const apiKey = process.env.KMA_API_KEY;
  if (!apiKey || apiKey === "여기에_기상청_API_키를_입력하세요" || apiKey.includes("\n")) {
    console.warn("⚠️ KMA_API_KEY가 설정되지 않아 기상청 시딩을 건너뜜.");
    return;
  }
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  const startDt = formatDate(yesterday);

  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch(e) {}
  const encodedKey = encodeURIComponent(safeApiKey);

  // 대상 지점: 서울(108), 반월/안산(203), 구미(279), 동해(106), 영양(273)
  const targetStations = [108, 203, 279, 106, 273];
  let totalInserted = 0;

  console.log(`🌦️ 기상청(KMA) 데이터 패치 시작 (대상: ${targetStations.length}개 지점)...`);

  for (const stn of targetStations) {
    const tmStr = `${startDt}1200`;
    const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php?tm=${tmStr}&stn=${stn}&help=0&authKey=${encodedKey}`;
    
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      const textData = await res.text();
      
      if (textData.includes("AUTH_FAIL") || textData.includes("ERR")) {
        console.error(`❌ 지점 ${stn} 인증 실패 혹은 에러 반환`);
        continue;
      }

      let insertedCount = 0;
      try {
        // 1. JSON 시도
        const data = JSON.parse(textData);
        const items = data?.response?.body?.items?.item || data?.info || (Array.isArray(data) ? data : []);
        for (const item of items) {
          const sql = `INSERT INTO kma_observation (tm, stn, wd, ws, gst_wd, gst_ws, gst_tm, pa, ps, pt, pr, ta, td, hm, pv, rn, rn_day, rn_jun, rn_int, sd_hr3, sd_day, sd_tot, wc, wp, ww, ca_tot, ca_mid, ch_min, ct, ct_top, ct_mid, ct_low, vs, ss, si, st_gd, ts, te_005, te_01, te_02, te_03, st_sea, wh, bf, ir, ix) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46) ON CONFLICT (tm, stn) DO NOTHING`;
          await query(sql, [item.TM || item.tm, parseInt(item.STN || item.stn || stn.toString(), 10), item.WD || item.wd || null, item.WS || item.ws || null, null, null, null, item.PA || item.pa || null, item.PS || item.ps || null, null, null, item.TA || item.ta || null, null, item.HM || item.hm || null, null, item.RN || item.rn || null, item.RN_DAY || item.rnDay || null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
          insertedCount++;
        }
      } catch (e) {
        // 2. CSV(Text) 시도
        const lines = textData.split('\n');
        for (const line of lines) {
          if (line.trim() === '' || line.startsWith('#')) continue;
          const cols = line.trim().split(/\s+/);
          if (cols.length < 10) continue;
          const parseVal = (val: string) => (val && !val.includes('-9')) ? val : null;
          const sql = `INSERT INTO kma_observation (tm, stn, wd, ws, gst_wd, gst_ws, gst_tm, pa, ps, pt, pr, ta, td, hm, pv, rn, rn_day, rn_jun, rn_int, sd_hr3, sd_day, sd_tot, wc, wp, ww, ca_tot, ca_mid, ch_min, ct, ct_top, ct_mid, ct_low, vs, ss, si, st_gd, ts, te_005, te_01, te_02, te_03, st_sea, wh, bf, ir, ix) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46) ON CONFLICT (tm, stn) DO NOTHING`;
          await query(sql, [cols[0], parseInt(cols[1], 10), parseVal(cols[2]), parseVal(cols[3]), parseVal(cols[4]), parseVal(cols[5]), parseVal(cols[6]), parseVal(cols[7]), parseVal(cols[8]), parseVal(cols[9]), parseVal(cols[10]), parseVal(cols[11]), parseVal(cols[12]), parseVal(cols[13]), parseVal(cols[14]), parseVal(cols[15]), parseVal(cols[16]), parseVal(cols[17]), parseVal(cols[18]), parseVal(cols[19]), parseVal(cols[20]), parseVal(cols[21]), parseVal(cols[22]), parseVal(cols[23]), parseVal(cols[24]), parseVal(cols[25]), parseVal(cols[26]), parseVal(cols[27]), parseVal(cols[28]), parseVal(cols[29]), parseVal(cols[30]), parseVal(cols[31]), parseVal(cols[32]), parseVal(cols[33]), parseVal(cols[34]), parseVal(cols[35]), parseVal(cols[36]), parseVal(cols[37]), parseVal(cols[38]), parseVal(cols[39]), parseVal(cols[40]), parseVal(cols[41]), parseVal(cols[42]), parseVal(cols[43]), parseVal(cols[44]), parseVal(cols[45])]);
          insertedCount++;
        }
      }
      console.log(`✅ 지점 ${stn} 처리 완료: ${insertedCount}건 삽입.`);
      totalInserted += insertedCount;
    } catch (error) {
      console.error(`❌ 지점 ${stn} 패치 중 에러:`, error);
    }
  }
  console.log(`🏁 기상청 총 ${totalInserted}건 적재 완료.`);
}

async function seedKpx() {
  const { query } = await import("../src/infrastructure/database/neon");
  const apiKey = process.env.KPX_API_KEY;
  if (!apiKey || apiKey === "여기에_전력거래소_API_키를_입력하세요") {
    console.warn("⚠️ KPX_API_KEY가 설정되지 않아 전력거래소 시딩을 건너뜀.");
    return;
  }
  
  console.log("⚡ 전력거래소(KPX) 데이터 패치 시작...");
  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch(e) {}
  const encodedKey = encodeURIComponent(safeApiKey);
  const url = `https://apis.data.go.kr/B552115/SmpWithForecastDemand/getSmpWithForecastDemand?serviceKey=${encodedKey}&pageNo=1&numOfRows=48&dataType=JSON`;
  
  try {
    const res = await fetch(url);
    const textData = await res.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      console.error(`❌ 전력거래소 API 에러:\n${textData}`);
      return;
    }
    const items = data?.response?.body?.items?.item || [];
    for (const item of items) {
      const sql = `INSERT INTO kpx_smp_forecast (date, hour, area_name, smp, mlfd, jlfd, slfd) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (date, hour, area_name) DO NOTHING`;
      await query(sql, [item.date, parseInt(item.hour, 10), item.areaName, item.smp || null, item.mlfd || null, item.jlfd || null, item.slfd || null]);
    }
    console.log(`✅ ${items.length}개의 전력거래소 예측 데이터 적재 완료.`);
  } catch (error) {
    console.error("❌ 전력거래소 에러:", error);
  }
}

async function main() {
  console.log("🚀 시딩 프로세스를 시작합니다...");
  await seedKma();
  await seedKpx();
  console.log("🏁 모든 시딩 작업이 완료되었습니다.");
  process.exit(0);
}

main();
