import { NextResponse } from "next/server";

/**
 * @swagger
 * /openapi/kma/observation:
 *   get:
 *     summary: 기상청 지상관측(ASOS) 조회
 *     description: 국내 지상 기상관측망(ASOS)의 관측 자료를 조회합니다.
 *     parameters:
 *       - in: query
 *         name: authKey
 *         required: true
 *         schema:
 *           type: string
 *         description: 기상청 API 인증키
 *       - in: query
 *         name: tm
 *         required: false
 *         schema:
 *           type: string
 *         description: 년월일시분(KST) 또는 년월일(KST), 없으면 현재시간
 *       - in: query
 *         name: stn
 *         required: false
 *         schema:
 *           type: string
 *         description: 지점번호, :로 구분, 0 또는 없으면 전체 지점
 *       - in: query
 *         name: help
 *         required: false
 *         schema:
 *           type: string
 *         description: 1이면 필드 도움말 추가
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
 *                   dataType: "JSON"
 *                   items:
 *                     item:
 *                       - TM: "202310121500"
 *                         STN: "108"
 *                         WD: "16"
 *                         WS: "2.3"
 *                         TA: "21.5"
 *                         HM: "45.0"
 *                         RN: "0.0"
 *                   numOfRows: 10
 *                   pageNo: 1
 *                   totalCount: 100
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  return NextResponse.json({
    response: {
      header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
      body: {
        dataType: "JSON",
        items: {
          item: [
            {
              TM: searchParams.get("tm") || "202310121500",
              STN: searchParams.get("stn") || "108",
              WD: "16",
              WS: "2.3",
              TA: "21.5",
              HM: "45.0",
              RN: "0.0",
              PA: "998.1",
              PS: "1009.2",
            }
          ]
        },
        numOfRows: 10,
        pageNo: 1,
        totalCount: 100,
      }
    }
  });
}
