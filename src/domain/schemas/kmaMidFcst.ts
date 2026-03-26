import { z } from "zod";

/**
 * 모듈 기능: 기상청 중기예보 요청 및 응답에 대한 Zod 스키마 정의를 제공합니다.
 */
export const kmaMidFcstRequestSchema = z.object({
  pageNo: z.string().optional().describe("페이지번호 (예: '1')"),
  numOfRows: z.string().optional().describe("한 페이지 결과 수 (예: '10')"),
  dataType: z.string().optional().describe("응답메시지 형식 (XML, JSON)"),
  stnId: z.string().min(1).describe("지점번호 (예: 108)"),
  tmFc: z.string().min(12).describe("발표시각 (YYYYMMDD0600 또는 YYYYMMDD1800)"),
});

export const kmaMidFcstResponseItemSchema = z.object({
  wfSv: z.string().describe("기상전망 정보"),
});

export const kmaMidFcstResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z.object({
      dataType: z.string(),
      items: z.object({
        item: z.array(kmaMidFcstResponseItemSchema),
      }),
      numOfRows: z.number(),
      pageNo: z.number(),
      totalCount: z.number(),
    }),
  }),
});
