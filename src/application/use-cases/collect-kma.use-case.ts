import { fetchKmaObservationData } from "@/infrastructure/external/kmaApiClient";
import { saveKmaObservations } from "@/infrastructure/repositories/kmaRepository";

/**
 * 기상청 관측 데이터 수집 Use Case
 */
export async function executeCollectKmaUseCase() {
  // 대상 지점: 서울(108), 반월/안산(203), 구미(279), 동해(106), 영양(273)
  const targetStations = [108, 203, 279, 106, 273];
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  const startDt = formatDate(yesterday);
  
  let totalInserted = 0;
  const errors: string[] = [];

  for (const stn of targetStations) {
    const tmStr = `${startDt}1200`;
    try {
      const items = await fetchKmaObservationData(tmStr, stn);
      if (items && items.length > 0) {
        const insertedCount = await saveKmaObservations(items);
        totalInserted += insertedCount;
      }
    } catch (e) {
      console.error(`지점 ${stn} 패치 중 에러:`, e);
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`지점 ${stn}: ${msg}`);
    }
  }

  if (errors.length > 0 && totalInserted === 0) {
    return { success: false, error: errors.join(", ") };
  }

  return { success: true, count: totalInserted, errors: errors.length > 0 ? errors : undefined };
}
