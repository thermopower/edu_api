import { fetchKmaMidFcst } from "@/infrastructure/external/kmaApiClient";
import { saveKmaMidFcst } from "@/infrastructure/repositories/kmaRepository";

/**
 * 모듈 기능: 기상청 중기예보(육상) 기상전망 데이터를 공공데이터포털 API를 통해 수집하여 데이터베이스에 저장합니다.
 * 정기적으로 실행되어 최신 예보를 업데이트하는 용도로 사용됩니다.
 */
export async function executeCollectKmaMidFcstUseCase() {
  const targetStations = ["108", "109"]; // 전국(108), 서울/인천/경기(109)
  
  const getLatestTmFc = (): string => {
    const now = new Date();
    // UTC to KST
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const yyyy = kst.getUTCFullYear();
    const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(kst.getUTCDate()).padStart(2, '0');
    const hours = kst.getUTCHours();

    if (hours < 6) {
      // 전날 18:00
      const prev = new Date(kst.getTime() - 24 * 60 * 60 * 1000);
      const pyyyy = prev.getUTCFullYear();
      const pmm = String(prev.getUTCMonth() + 1).padStart(2, '0');
      const pdd = String(prev.getUTCDate()).padStart(2, '0');
      return `${pyyyy}${pmm}${pdd}1800`;
    } else if (hours < 18) {
      // 오늘 06:00
      return `${yyyy}${mm}${dd}0600`;
    } else {
      // 오늘 18:00
      return `${yyyy}${mm}${dd}1800`;
    }
  };
  
  const tmFcStr = getLatestTmFc();
  
  let totalInserted = 0;
  const errors: string[] = [];

  for (const stn of targetStations) {
    try {
      const items = await fetchKmaMidFcst(stn, tmFcStr, "1", "10", "JSON");
      if (items && items.length > 0) {
        const insertedCount = await saveKmaMidFcst(items);
        totalInserted += insertedCount;
      }
    } catch (e) {
      console.error(`중기예보 지점 ${stn} 패치 중 에러:`, e);
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`지점 ${stn}: ${msg}`);
    }
  }

  if (errors.length > 0 && totalInserted === 0) {
    return { success: false, error: errors.join(", ") };
  }

  return { success: true, count: totalInserted, errors: errors.length > 0 ? errors : undefined };
}
