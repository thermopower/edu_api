import { fetchKpxSmpDemand } from "@/infrastructure/external/kpxApiClient";
import { saveKpxForecasts } from "@/infrastructure/repositories/kpxRepository";

/**
 * 전력거래소 SMP 및 예측 수요 수집 Use Case
 */
export async function executeCollectKpxUseCase() {
  try {
    const items = await fetchKpxSmpDemand();
    let totalInserted = 0;
    
    if (items && items.length > 0) {
      totalInserted = await saveKpxForecasts(items);
    }
    
    return { success: true, count: totalInserted };
  } catch (e) {
    console.error("전력거래소 수집 에러:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}
