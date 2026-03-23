/**
 * 전력거래소(KPX) 데이터 수집을 위한 외부 연동 클라이언트
 */

export interface KpxFetchResult {
  date: string;
  hour: number;
  areaName: string;
  smp?: string | null;
  mlfd?: string | null;
  jlfd?: string | null;
  slfd?: string | null;
}

export async function fetchKpxSmpDemand(): Promise<KpxFetchResult[]> {
  const apiKey = process.env.KPX_API_KEY;
  if (!apiKey || apiKey === "여기에_전력거래소_API_키를_입력하세요") {
    throw new Error("KPX_API_KEY가 설정되지 않았습니다.");
  }
  
  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch(e) {}
  const encodedKey = encodeURIComponent(safeApiKey);
  
  const url = `https://apis.data.go.kr/B552115/SmpWithForecastDemand/getSmpWithForecastDemand?serviceKey=${encodedKey}&pageNo=1&numOfRows=48&dataType=JSON`;
  
  const res = await fetch(url);
  const textData = await res.text();
  let data;
  
  try {
    data = JSON.parse(textData);
  } catch (e) {
    throw new Error(`전력거래소 API 에러 반환: ${textData}`);
  }
  
  const items = data?.response?.body?.items?.item || [];
  const results: KpxFetchResult[] = [];
  
  for (const item of items) {
    results.push({
      date: item.date,
      hour: parseInt(item.hour, 10),
      areaName: item.areaName,
      smp: item.smp || null,
      mlfd: item.mlfd || null,
      jlfd: item.jlfd || null,
      slfd: item.slfd || null
    });
  }
  
  return results;
}
