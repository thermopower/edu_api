import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Educational API Practice (KPX/KMA)",
        version: "1.0",
        description: "전력거래소(KPX) 및 기상청(KMA) 데이터 교육용 API Swagger 문서입니다.",
      },
      components: {},
      security: [],
    },
  });
  return spec;
};
