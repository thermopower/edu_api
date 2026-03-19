import { NextResponse } from "next/server";
import { validateApiKey } from "@/application/auth/apiKeyValidator";

/**
 * @swagger
 * /openapi/kpx/smp-demand:
 *   get:
 *     summary: 전력거래소 SMP 및 수요예측 조회
 *     description: 미래의 시간별 제주 및 육지 계통한계가격(SMP)과 예상되는 전력수요 예측 데이터를 조회합니다.
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: 사전 발급된 API 인증키 (20개 중 택 1)
 *       - in: query
 *         name: pageNo
 *         required: true
 *         schema:
 *           type: string
 *         description: 페이지번호
 *       - in: query
 *         name: numOfRows
 *         required: true
 *         schema:
 *           type: string
 *         description: 한 페이지 결과 수
 *       - in: query
 *         name: dataType
 *         required: true
 *         schema:
 *           type: string
 *         description: 응답메시지 형식 (xml, json)
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *         description: 일자 (YYYYMMDD)
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               response:
 *                 header:
 *                   resultCode: "00"
 *                   resultMsg: "NORMAL SERVICE."
 *                 body:
 *                   items:
 *                     item:
 *                       - date: "20231012"
 *                         hour: "1"
 *                         areaName: "육지"
 *                         smp: "140.24"
 *                         mlfd: "65000.00"
 *                         jlfd: "1200.00"
 *                         slfd: "66200.00"
 *                         rn: "1"
 *                   numOfRows: 10
 *                   pageNo: 1
 *                   totalCount: 100
 *       400:
 *         description: 잘못된 요청 (파라미터 오류 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: 인증 실패 (유효하지 않거나 누락된 x-api-key 헤더)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: 서버 내부 오류
 */
export async function GET(request: Request) {
  const isValid = await validateApiKey();
  
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing x-api-key header" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  
  return NextResponse.json({
    response: {
      header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
      body: {
        items: {
          item: [
            {
              date: searchParams.get("date") || "20231012",
              hour: "1",
              areaName: "육지",
              smp: "140.24",
              mlfd: "65000.00",
              jlfd: "1200.00",
              slfd: "66200.00",
              rn: "1",
            }
          ]
        },
        numOfRows: Number(searchParams.get("numOfRows") || 10),
        pageNo: Number(searchParams.get("pageNo") || 1),
        totalCount: 100,
      }
    }
  });
}
