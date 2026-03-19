import { z } from "zod";

export const kpxRequestSchema = z.object({
  pageNo: z.string().min(1).describe("페이지번호 (예: '1')"),
  numOfRows: z.string().min(1).describe("한 페이지 결과 수 (예: '10')"),
  dataType: z.string().min(1).describe("응답메시지 형식 (xml, json)"),
  date: z.string().optional().describe("일자 (YYYYMMDD)"),
});

export const kpxResponseItemSchema = z.object({
  date: z.string().describe("일시 (YYYYMMDD)"),
  hour: z.string().describe("시간 (1-24)"),
  areaName: z.string().describe("지역 (육지, 제주)"),
  smp: z.string().describe("계통한계가격"),
  mlfd: z.string().describe("육지 예측수요"),
  jlfd: z.string().describe("제주 예측수요"),
  slfd: z.string().describe("총 예측수요"),
  rn: z.string().describe("순번"),
});

export const kpxResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z.object({
      items: z.object({
        item: z.array(kpxResponseItemSchema),
      }),
      numOfRows: z.number(),
      pageNo: z.number(),
      totalCount: z.number(),
    }),
  }),
});
