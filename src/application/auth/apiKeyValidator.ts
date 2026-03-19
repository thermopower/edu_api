import { headers } from "next/headers";

/**
 * 사전 발급된 20개의 랜덤 API 키 중 하나인지 검증합니다.
 * @returns 유효한 경우 true, 아닐 경우 false
 */
export async function validateApiKey(): Promise<boolean> {
  const headersList = await headers();
  // Header 기반 키 검사 (x-api-key)
  const incomingKey = headersList.get("x-api-key");

  if (!incomingKey) {
    return false;
  }

  // .env.local 에 콤마(,) 단위로 저장된 VALID_API_KEYS 로드
  const validKeysString = process.env.VALID_API_KEYS || "";
  const validKeysArray = validKeysString.split(",").map(k => k.trim());

  return validKeysArray.includes(incomingKey);
}
