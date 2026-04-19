import { config } from "dotenv";
config({ path: ".env.local" });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** YYYYMMDD 문자열 배열 생성 (시작일 ~ 종료일 포함) */
function generateDateRange(startYYYYMMDD: string, endYYYYMMDD: string): string[] {
  const dates: string[] = [];
  const start = new Date(
    `${startYYYYMMDD.slice(0, 4)}-${startYYYYMMDD.slice(4, 6)}-${startYYYYMMDD.slice(6, 8)}`
  );
  const end = new Date(
    `${endYYYYMMDD.slice(0, 4)}-${endYYYYMMDD.slice(4, 6)}-${endYYYYMMDD.slice(6, 8)}`
  );

  const cur = new Date(start);
  while (cur <= end) {
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, "0");
    const dd = String(cur.getDate()).padStart(2, "0");
    dates.push(`${yyyy}${mm}${dd}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** 오늘 날짜 YYYYMMDD (로컬 시간 기준) */
function todayStr(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// ────────────────────────────────────────────────
// 1. KMA 지상관측 (ASOS) 백필
// ────────────────────────────────────────────────
async function backfillKmaObservation(dates: string[]) {
  const { query } = await import("../src/infrastructure/database/neon");
  const apiKey = process.env.KMA_API_KEY;

  if (!apiKey || apiKey === "여기에_기상청_API_키를_입력하세요" || apiKey.includes("\n")) {
    console.warn("⚠️  KMA_API_KEY 미설정 → 기상청 관측 백필 건너뜀.");
    return;
  }

  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch (_) {}
  const encodedKey = encodeURIComponent(safeApiKey);

  const targetStations = [108, 203, 279, 106, 273];
  let totalInserted = 0;

  // DB에 이미 있는 (날짜, 지점) 조합 미리 조회
  const existingRows = await query(
    `SELECT DISTINCT substring(tm, 1, 8) AS dt, stn FROM kma_observation WHERE tm >= $1 AND tm <= $2`,
    [`${dates[0]}0000`, `${dates[dates.length - 1]}2359`]
  );
  const existingSet = new Set<string>((existingRows as any[]).map((r: any) => `${r.dt}_${r.stn}`));

  console.log(`\n🌦️  KMA 지상관측 백필 시작 (${dates[0]} ~ ${dates[dates.length - 1]}, ${dates.length}일)`);

  for (const dateStr of dates) {
    for (const stn of targetStations) {
      // 이미 DB에 있으면 건너뜀
      if (existingSet.has(`${dateStr}_${stn}`)) continue;

      const tmStr = `${dateStr}1200`; // 매일 12:00 KST 관측값
      const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php?tm=${tmStr}&stn=${stn}&help=0&authKey=${encodedKey}`;

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        const textData = await res.text();

        if (textData.includes("AUTH_FAIL") || textData.includes("ERR")) {
          console.error(`  ❌ ${dateStr} 지점 ${stn} 에러 반환`);
          continue;
        }

        let insertedCount = 0;

        try {
          // JSON 시도
          const data = JSON.parse(textData);
          const items =
            data?.response?.body?.items?.item ||
            data?.info ||
            (Array.isArray(data) ? data : []);

          for (const item of items) {
            const sql = `INSERT INTO kma_observation (tm, stn, wd, ws, gst_wd, gst_ws, gst_tm, pa, ps, pt, pr, ta, td, hm, pv, rn, rn_day, rn_jun, rn_int, sd_hr3, sd_day, sd_tot, wc, wp, ww, ca_tot, ca_mid, ch_min, ct, ct_top, ct_mid, ct_low, vs, ss, si, st_gd, ts, te_005, te_01, te_02, te_03, st_sea, wh, bf, ir, ix) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46) ON CONFLICT (tm, stn) DO NOTHING`;
            await query(sql, [
              item.TM || item.tm, parseInt(item.STN || item.stn || String(stn), 10),
              item.WD || item.wd || null, item.WS || item.ws || null,
              null, null, null,
              item.PA || item.pa || null, item.PS || item.ps || null,
              null, null,
              item.TA || item.ta || null, null,
              item.HM || item.hm || null, null,
              item.RN || item.rn || null, item.RN_DAY || item.rnDay || null,
              null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            ]);
            insertedCount++;
          }
        } catch (_) {
          // CSV 시도
          const lines = textData.split("\n");
          for (const line of lines) {
            if (line.trim() === "" || line.startsWith("#")) continue;
            const cols = line.trim().split(/\s+/);
            if (cols.length < 10) continue;

            const pv = (v: string) => (v && !v.includes("-9") ? v : null);
            const stnVal = parseInt(cols[1], 10);
            if (isNaN(stnVal)) continue; // 파싱 불가한 줄 건너뜀
            const sql = `INSERT INTO kma_observation (tm, stn, wd, ws, gst_wd, gst_ws, gst_tm, pa, ps, pt, pr, ta, td, hm, pv, rn, rn_day, rn_jun, rn_int, sd_hr3, sd_day, sd_tot, wc, wp, ww, ca_tot, ca_mid, ch_min, ct, ct_top, ct_mid, ct_low, vs, ss, si, st_gd, ts, te_005, te_01, te_02, te_03, st_sea, wh, bf, ir, ix) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46) ON CONFLICT (tm, stn) DO NOTHING`;
            await query(sql, [
              cols[0], stnVal,
              pv(cols[2]), pv(cols[3]), pv(cols[4]), pv(cols[5]), pv(cols[6]),
              pv(cols[7]), pv(cols[8]), pv(cols[9]), pv(cols[10]),
              pv(cols[11]), pv(cols[12]), pv(cols[13]), pv(cols[14]),
              pv(cols[15]), pv(cols[16]), pv(cols[17]), pv(cols[18]),
              pv(cols[19]), pv(cols[20]), pv(cols[21]),
              pv(cols[22]), pv(cols[23]), pv(cols[24]),
              pv(cols[25]), pv(cols[26]), pv(cols[27]), pv(cols[28]),
              pv(cols[29]), pv(cols[30]), pv(cols[31]),
              pv(cols[32]), pv(cols[33]), pv(cols[34]), pv(cols[35]),
              pv(cols[36]), pv(cols[37]), pv(cols[38]), pv(cols[39]), pv(cols[40]),
              pv(cols[41]), pv(cols[42]), pv(cols[43]), pv(cols[44]), pv(cols[45]),
            ]);
            insertedCount++;
          }
        }

        if (insertedCount > 0) {
          console.log(`  ✅ ${dateStr} 지점 ${stn}: ${insertedCount}건`);
          totalInserted += insertedCount;
        }
      } catch (err) {
        console.error(`  ❌ ${dateStr} 지점 ${stn} 패치 오류:`, err);
      }

      await sleep(200); // API 부하 방지
    }
  }

  console.log(`🏁 KMA 관측 백필 완료 — 총 ${totalInserted}건 적재.`);
}

// ────────────────────────────────────────────────
// 2. KMA 중기예보 (육상) 백필
// ────────────────────────────────────────────────
async function backfillKmaMidFcst(dates: string[]) {
  const { query } = await import("../src/infrastructure/database/neon");
  const apiKey = process.env.KPX_API_KEY; // 중기예보도 공공데이터포털 키 사용

  if (!apiKey || apiKey === "여기에_전력거래소_API_키를_입력하세요") {
    console.warn("⚠️  KPX_API_KEY(공공데이터포털) 미설정 → 중기예보 백필 건너뜀.");
    return;
  }

  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch (_) {}
  const encodedKey = encodeURIComponent(safeApiKey);

  const targetStations = ["108", "109"]; // 전국(108), 서울/인천/경기(109)
  // 하루 두 번 발표: 06:00 / 18:00 KST
  const issueTimes = ["0600", "1800"];

  // 오늘 날짜와 현재 KST 시각 파악 (미래 발표 시각 제외)
  const nowKst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayKstStr = `${nowKst.getUTCFullYear()}${String(nowKst.getUTCMonth() + 1).padStart(2, "0")}${String(nowKst.getUTCDate()).padStart(2, "0")}`;
  const kstHour = nowKst.getUTCHours();

  // DB에 이미 있는 (stn_id, tm_fc) 조합 미리 조회
  const existingMid = await query(
    `SELECT stn_id, tm_fc FROM kma_midfcst WHERE tm_fc >= $1 AND tm_fc <= $2`,
    [`${dates[0]}0000`, `${dates[dates.length - 1]}2359`]
  );
  const existingMidSet = new Set<string>((existingMid as any[]).map((r: any) => `${r.stn_id}_${r.tm_fc}`));

  let totalInserted = 0;

  console.log(`\n📋 KMA 중기예보 백필 시작 (${dates[0]} ~ ${dates[dates.length - 1]}, ${dates.length}일)`);

  for (const dateStr of dates) {
    for (const issueTime of issueTimes) {
      // 아직 발표되지 않은 미래 시각 건너뜀
      if (dateStr === todayKstStr && issueTime === "1800" && kstHour < 18) continue;
      if (dateStr > todayKstStr) continue;

      const tmFc = `${dateStr}${issueTime}`;

      for (const stnId of targetStations) {
        // 이미 DB에 있으면 건너뜀
        if (existingMidSet.has(`${stnId}_${tmFc}`)) continue;

        const url = `http://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst?ServiceKey=${encodedKey}&pageNo=1&numOfRows=10&dataType=JSON&stnId=${stnId}&tmFc=${tmFc}`;

        try {
          const res = await fetch(url, { method: "GET" });
          const textData = await res.text();

          if (textData.includes("OpenAPI_ServiceResponse")) {
            console.warn(`  ⚠️  ${tmFc} 지점 ${stnId}: XML 에러 응답 (한도 초과 등) — 건너뜀`);
            await sleep(1000);
            continue;
          }

          const data = JSON.parse(textData);
          const resultCode = data?.response?.header?.resultCode;

          if (resultCode && resultCode !== "00") {
            // 해당 발표 시각에 데이터 없음 (정상 케이스)
            continue;
          }

          const items: any[] = data?.response?.body?.items?.item || [];

          for (const item of items) {
            const sql = `INSERT INTO kma_midfcst (stn_id, tm_fc, wf_sv, data_type) VALUES ($1, $2, $3, $4) ON CONFLICT (stn_id, tm_fc) DO NOTHING`;
            await query(sql, [stnId, tmFc, item.wfSv || "", "JSON"]);
            totalInserted++;
          }

          if (items.length > 0) {
            console.log(`  ✅ ${tmFc} 지점 ${stnId}: ${items.length}건`);
          }
        } catch (err) {
          console.error(`  ❌ ${tmFc} 지점 ${stnId} 패치 오류:`, err);
        }

        await sleep(300); // API 부하 방지
      }
    }
  }

  console.log(`🏁 KMA 중기예보 백필 완료 — 총 ${totalInserted}건 적재.`);
}

// ────────────────────────────────────────────────
// 3. KPX SMP 및 수요예측 백필
// date 파라미터(YYYYMMDD)로 날짜별 조회 지원
// ────────────────────────────────────────────────
async function backfillKpx(dates: string[]) {
  const { query } = await import("../src/infrastructure/database/neon");
  const apiKey = process.env.KPX_API_KEY;

  if (!apiKey || apiKey === "여기에_전력거래소_API_키를_입력하세요") {
    console.warn("⚠️  KPX_API_KEY 미설정 → 전력거래소 백필 건너뜀.");
    return;
  }

  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch (_) {}
  const encodedKey = encodeURIComponent(safeApiKey);

  // DB에 이미 48건 완전히 적재된 날짜는 건너뜀
  const existingKpx = await query(
    `SELECT date FROM kpx_smp_forecast WHERE date >= $1 AND date <= $2 GROUP BY date HAVING COUNT(*) >= 48`,
    [dates[0], dates[dates.length - 1]]
  );
  const existingKpxDates = new Set<string>((existingKpx as any[]).map((r: any) => r.date));

  const pendingDates = dates.filter(d => !existingKpxDates.has(d));
  console.log(`\n⚡ KPX SMP 백필 시작 (미적재 ${pendingDates.length}일 / 전체 ${dates.length}일)`);

  let totalInserted = 0;

  for (const dateStr of pendingDates) {
    // 하루 최대 24시간 × 2지역(육지/제주) = 48건
    const url = `https://apis.data.go.kr/B552115/SmpWithForecastDemand/getSmpWithForecastDemand?serviceKey=${encodedKey}&pageNo=1&numOfRows=48&dataType=JSON&date=${dateStr}`;

    try {
      const res = await fetch(url);
      const textData = await res.text();
      let data: any;

      try {
        data = JSON.parse(textData);
      } catch (_) {
        console.error(`  ❌ ${dateStr} KPX 응답 파싱 실패:`, textData.slice(0, 200));
        continue;
      }

      const items: any[] = data?.response?.body?.items?.item || [];

      let inserted = 0;
      for (const item of items) {
        const sql = `INSERT INTO kpx_smp_forecast (date, hour, area_name, smp, mlfd, jlfd, slfd) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (date, hour, area_name) DO NOTHING`;
        await query(sql, [
          item.date,
          parseInt(item.hour, 10),
          item.areaName,
          item.smp || null,
          item.mlfd || null,
          item.jlfd || null,
          item.slfd || null,
        ]);
        inserted++;
      }

      totalInserted += inserted;
      if (inserted > 0) {
        console.log(`  ✅ ${dateStr}: ${inserted}건 적재`);
      }
    } catch (err) {
      console.error(`  ❌ ${dateStr} KPX 패치 오류:`, err);
    }

    await sleep(200); // API 부하 방지
  }

  console.log(`🏁 KPX SMP 백필 완료 — 총 ${totalInserted}건 적재.`);
}

// ────────────────────────────────────────────────
// 메인
// ────────────────────────────────────────────────
async function main() {
  const START_DATE = "20260101";
  const END_DATE = todayStr(); // 오늘 포함

  console.log(`🚀 백필 시작: ${START_DATE} ~ ${END_DATE}`);

  const dates = generateDateRange(START_DATE, END_DATE);

  await backfillKmaObservation(dates);
  await backfillKmaMidFcst(dates);
  await backfillKpx(dates);

  console.log("\n✅ 모든 백필 작업 완료.");
  process.exit(0);
}

main();
