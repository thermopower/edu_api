import { headers } from "next/headers";

/**
 * 모듈 기능: API 요청의 Header 또는 Query Parameter에서 'x-api-key'를 읽어 유효한 키인지 검증합니다.
 * 사전 발급된 20개의 랜덤 API 키 중 하나인지 확인합니다.
 * 
 * @param request (선택) Query Parameter를 검사하기 위한 Request 객체
 * @returns 유효한 경우 true, 아닐 경우 false
 */
export async function validateApiKey(request?: Request): Promise<boolean> {
  let incomingKey: string | null = null;

  // 1. Query Parameter에서 키 확인
  if (request) {
    const { searchParams } = new URL(request.url);
    incomingKey = searchParams.get("x-api-key");
  }

  // 2. Query Parameter에 없다면 Header에서 확인
  if (!incomingKey) {
    const headersList = await headers();
    incomingKey = headersList.get("x-api-key");
  }

  if (!incomingKey) {
    return false;
  }

  // .env.local 에 콤마(,) 단위로 저장된 VALID_API_KEYS 로드
  const validKeysString = process.env.VALID_API_KEYS || "";
  const validKeysArray = validKeysString.split(",").map(k => k.trim());

  return validKeysArray.includes(incomingKey);
}
