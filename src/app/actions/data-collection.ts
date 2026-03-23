"use server";

import { executeCollectKmaUseCase } from "@/application/use-cases/collect-kma.use-case";
import { executeCollectKpxUseCase } from "@/application/use-cases/collect-kpx.use-case";

export async function collectKmaDataAction() {
  return await executeCollectKmaUseCase();
}

export async function collectKpxDataAction() {
  return await executeCollectKpxUseCase();
}
