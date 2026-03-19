import { config } from "dotenv";
config({ path: ".env.local" });

import { query } from "../src/infrastructure/database/neon";

async function seedKma() {
  const apiKey = process.env.KMA_API_KEY;
  if (!apiKey || apiKey === "여기에_기상청_API_키를_입력하세요") {
    console.warn("⚠️ KMA_API_KEY가 설정되지 않아 기상청 시딩을 건너뜁니다.");
    return;
  }
  
  console.log("🌦️ 기상청(KMA) 데이터 패치 시작...");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  
  const startDt = formatDate(yesterday);
  const endDt = formatDate(today);
  
  // url format (stnIds=108 -> 서울)
  const url = `http://apis.data.go.kr/1360000/AsosHourlyInfoService/getWthrDataList?serviceKey=${apiKey}&pageNo=1&numOfRows=100&dataType=JSON&dataCd=ASOS&dateCd=HR&stnIds=108&startDt=${startDt}&startHr=00&endDt=${endDt}&endHr=23`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.response?.body?.items?.item || [];
    
    if (items.length === 0) {
      console.log("KMA 데이터가 없습니다. 원인:", JSON.stringify(data));
      return;
    }

    for (const item of items) {
      const sql = `
        INSERT INTO kma_observation (
          tm, stn, wd, ws, pa, ps, ta, hm, rn, rn_day
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (tm, stn) DO NOTHING
      `;
      await query(sql, [
        item.tm, 
        parseInt(item.stnId, 10) || 108, 
        item.wd || null, 
        item.ws || null, 
        item.pa || null, 
        item.ps || null, 
        item.ta || null, 
        item.hm || null, 
        item.rn || null, 
        item.rnDay || null
      ]);
    }
    console.log(`✅ ${items.length}개의 기상청 관측 데이터 적재 완료.`);
  } catch (error) {
    console.error("❌ 기상청 데이터 파싱 에러:", error);
  }
}

async function seedKpx() {
  const apiKey = process.env.KPX_API_KEY;
  if (!apiKey || apiKey === "여기에_전력거래소_API_키를_입력하세요") {
    console.warn("⚠️ KPX_API_KEY가 설정되지 않아 전력거래소 시딩을 건너뜁니다.");
    return;
  }
  
  console.log("⚡ 전력거래소(KPX) 데이터 패치 시작...");
  // 보통 당일/명일 데이터를 제공하지만 가동 실습용이므로 날짜 필터 생략
  const url = `http://apis.data.go.kr/B552115/SmpDemandPredictInfoService/getSmpDemandPredictInfo_D?serviceKey=${apiKey}&pageNo=1&numOfRows=48&dataType=JSON`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.response?.body?.items?.item || [];
    
    if (items.length === 0) {
      console.log("KPX 데이터가 없습니다. 원인:", JSON.stringify(data));
      return;
    }

    for (const item of items) {
      const sql = `
        INSERT INTO kpx_smp_forecast (
          date, hour, area_name, smp, mlfd, jlfd, slfd
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (date, hour, area_name) DO NOTHING
      `;
      await query(sql, [
        item.date, 
        parseInt(item.hour, 10), 
        item.areaName, 
        item.smp || null, 
        item.mlfd || null, 
        item.jlfd || null, 
        item.slfd || null
      ]);
    }
    console.log(`✅ ${items.length}개의 전력거래소 예측 데이터 적재 완료.`);
  } catch (error) {
    console.error("❌ 전력거래소 데이터 파싱 에러:", error);
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
