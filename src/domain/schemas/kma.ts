import { z } from "zod";

export const kmaRequestSchema = z.object({
  tm: z.string().optional().describe("년월일시분(KST) 또는 년월일(KST), 없으면 현재시간"),
  stn: z.string().optional().describe("지점번호, :로 구분, 0 또는 없으면 전체 지점"),
  help: z.string().optional().describe("1이면 필드 도움말 추가"),
});

export const kmaResponseItemSchema = z.object({
  TM: z.string().describe("관측시각 (KST)"),
  STN: z.string().describe("국내 지점번호"),
  WD: z.string().optional().describe("풍향"),
  WS: z.string().optional().describe("풍속"),
  GST_WD: z.string().optional().describe("돌풍향"),
  GST_WS: z.string().optional().describe("돌풍속"),
  GST_TM: z.string().optional().describe("돌풍속 관측시각"),
  PA: z.string().optional().describe("현지기압"),
  PS: z.string().optional().describe("해면기압"),
  PT: z.string().optional().describe("기압변화경향"),
  PR: z.string().optional().describe("기압변화량"),
  TA: z.string().optional().describe("기온"),
  TD: z.string().optional().describe("이슬점온도"),
  HM: z.string().optional().describe("상대습도"),
  PV: z.string().optional().describe("수증기압"),
  RN: z.string().optional().describe("강수량"),
  RN_DAY: z.string().optional().describe("일강수량"),
  RN_INT: z.string().optional().describe("강수강도"),
  SD_HR3: z.string().optional().describe("3시간 신적설"),
  SD_DAY: z.string().optional().describe("일 신적설"),
  SD_TOT: z.string().optional().describe("적설"),
  WC: z.string().optional().describe("현재일기"),
  WP: z.string().optional().describe("과거일기"),
  WW: z.string().optional().describe("국내식 일기코드"),
  CA_TOT: z.string().optional().describe("전운량"),
  CA_MID: z.string().optional().describe("중하층운량"),
  CH_MIN: z.string().optional().describe("최저운고"),
  CT: z.string().optional().describe("운형"),
  CT_TOP: z.string().optional().describe("상층운형"),
  CT_MID: z.string().optional().describe("중층운형"),
  CT_LOW: z.string().optional().describe("하층운형"),
  VS: z.string().optional().describe("시정"),
  SS: z.string().optional().describe("일조"),
  SI: z.string().optional().describe("일사"),
  ST_GD: z.string().optional().describe("지면상태 코드"),
  TS: z.string().optional().describe("지면온도"),
  TE_005: z.string().optional().describe("5cm 지중온도"),
  TE_01: z.string().optional().describe("10cm 지중온도"),
  TE_02: z.string().optional().describe("20cm 지중온도"),
  TE_03: z.string().optional().describe("30cm 지중온도"),
  ST_SEA: z.string().optional().describe("해면상태 코드"),
  WH: z.string().optional().describe("파고"),
  BF: z.string().optional().describe("최대풍력"),
  IR: z.string().optional().describe("강수/결측 구분"),
  IX: z.string().optional().describe("유인/무인관측"),
  RN_JUN: z.string().optional().describe("일강수량"),
});

export const kmaResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z.object({
      dataType: z.string(),
      items: z.object({
        item: z.array(kmaResponseItemSchema),
      }),
      pageNo: z.number(),
      numOfRows: z.number(),
      totalCount: z.number(),
    }),
  }),
});
