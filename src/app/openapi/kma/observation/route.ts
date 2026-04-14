import { NextResponse } from "next/server";
import { validateApiKey } from "@/application/auth/apiKeyValidator";
import { getKmaObservations } from "@/infrastructure/repositories/kmaRepository";

/**
 * @swagger
 * /openapi/kma/observation:
 *   get:
 *     summary: 기상청 지상관측(ASOS) 조회
 *     description: 국내 지상 기상관측망(ASOS)의 관측 자료를 조회합니다.
 *     parameters:
 *       - in: query
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: 사전 발급된 API 인증키
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
 *         description: 인증 실패 (유효하지 않거나 누락된 x-api-key)
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
  const isValid = await validateApiKey(request);

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing x-api-key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tm = searchParams.get("tm");
  const stn = searchParams.get("stn");

  try {
    const items = await getKmaObservations(tm, stn);

    const itemFormatted = items.map((row) => ({
      TM: row.tm,
      STN: row.stn.toString(),
      WD: row.wd || "",
      WS: row.ws || "",
      GST_WD: row.gst_wd || "",
      GST_WS: row.gst_ws || "",
      GST_TM: row.gst_tm || "",
      PA: row.pa || "",
      PS: row.ps || "",
      PT: row.pt || "",
      PR: row.pr || "",
      TA: row.ta || "",
      TD: row.td || "",
      HM: row.hm || "",
      PV: row.pv || "",
      RN: row.rn || "",
      RN_DAY: row.rn_day || "",
      RN_INT: row.rn_int || "",
      SD_HR3: row.sd_hr3 || "",
      SD_DAY: row.sd_day || "",
      SD_TOT: row.sd_tot || "",
      WC: row.wc || "",
      WP: row.wp || "",
      WW: row.ww || "",
      CA_TOT: row.ca_tot || "",
      CA_MID: row.ca_mid || "",
      CH_MIN: row.ch_min || "",
      CT: row.ct || "",
      CT_TOP: row.ct_top || "",
      CT_MID: row.ct_mid || "",
      CT_LOW: row.ct_low || "",
      VS: row.vs || "",
      SS: row.ss || "",
      SI: row.si || "",
      ST_GD: row.st_gd || "",
      TS: row.ts || "",
      TE_005: row.te_005 || "",
      TE_01: row.te_01 || "",
      TE_02: row.te_02 || "",
      TE_03: row.te_03 || "",
      ST_SEA: row.st_sea || "",
      WH: row.wh || "",
      BF: row.bf || "",
      IR: row.ir || "",
      IX: row.ix || "",
      RN_JUN: row.rn_jun || "",
    }));

    return NextResponse.json({
      header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
      body: {
        dataType: "JSON",
        totalCount: items.length.toString(),
        numOfRows: items.length.toString(),
        pageNo: "1",
        items: {
          item: itemFormatted,
        },
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
