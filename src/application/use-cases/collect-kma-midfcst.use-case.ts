import { fetchKmaMidFcst } from "@/infrastructure/external/kmaApiClient";
import { saveKmaMidFcst } from "@/infrastructure/repositories/kmaRepository";

/**
 * 모듈 기능: 기상청 중기예보(육상) 기상전망 데이터를 공공데이터포털 API를 통해 수집하여 데이터베이스에 저장합니다.
 * 정기적으로 실행되어 최신 예보를 업데이트하는 용도로 사용됩니다.
 */
export async function executeCollectKmaMidFcstUseCase() {
  const targetStations = ["108", "109"]; // 전국(108), 서울/인천/경기(109)
  
  const today = new Date();
  const formatTmFc = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    // 중기예보는 0600, 1800 두번 발표. 보통 최신 데이터로 업데이트를 위해 임시로 당일 0600으로 설정
    return `${yyyy}${mm}${dd}0600`;
  };
  const tmFcStr = formatTmFc(today);
  
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
