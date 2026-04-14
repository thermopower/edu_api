import { NextResponse } from "next/server";
import { validateApiKey } from "@/application/auth/apiKeyValidator";
import { getKmaMidFcst } from "@/infrastructure/repositories/kmaRepository";

/**
 * @swagger
 * /openapi/kma/mid-fcst:
 *   get:
 *     summary: 기상청 중기예보 조회
 *     description: 기상청의 중기예보(육상) 기상전망 데이터를 조회합니다.
 *     parameters:
 *       - in: query
 *         name: x-api-key
 *         required: false
 *         schema:
 *           type: string
 *         description: 사전 발급된 API 인증키

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
 *         required: false
 *         schema:
 *           type: string
 *         description: 응답메시지 형식 (XML, JSON)
 *       - in: query
 *         name: stnId
 *         required: true
 *         schema:
 *           type: string
 *         description: 지점번호 (108 전국, 109 서울/인천/경기도)
 *       - in: query
 *         name: tmFc
 *         required: true
 *         schema:
 *           type: string
 *         description: 발표시각 (YYYYMMDD0600 또는 YYYYMMDD1800)
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
 *                       - wfSv: "기상전망 내용입니다..."
 *                   numOfRows: 10
 *                   pageNo: 1
 *                   totalCount: 3
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패 (유효하지 않거나 누락된 x-api-key)
 *       500:
 *         description: 서버 내부 오류
 */
export async function GET(request: Request) {
  const isValid = await validateApiKey(request);

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing x-api-key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stnId = searchParams.get("stnId");
  const tmFc = searchParams.get("tmFc");
  const pageNoStr = searchParams.get("pageNo");
  const numOfRowsStr = searchParams.get("numOfRows");

  if (!stnId || !tmFc || !pageNoStr || !numOfRowsStr) {
    return NextResponse.json({ error: "Missing required parameters: stnId, tmFc, pageNo, numOfRows" }, { status: 400 });
  }

  const pageNo = Number(pageNoStr);
  const numOfRows = Number(numOfRowsStr);
  const dataType = searchParams.get("dataType") || "JSON";

  try {
    const { items, totalCount } = await getKmaMidFcst(stnId, tmFc, pageNo, numOfRows);

    const itemFormatted = items.map((row) => ({
      wfSv: row.wf_sv || ""
    }));

    return NextResponse.json({
      header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
      body: {
        dataType: dataType.toUpperCase(),
        totalCount: totalCount.toString(),
        numOfRows: numOfRows.toString(),
        pageNo: pageNo.toString(),
        items: {
          item: itemFormatted,
        },
      },
    });
  } catch (error) {
    console.error("MidFcst API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
