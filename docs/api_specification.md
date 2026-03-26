# Educational API Practice - API Specification

본 프로젝트는 학생들이 공공 데이터(기상청, 전력거래소)의 API 활용법을 실습하기 위해 만들어진 **Next.js (App Router)** 기반의 API 서버입니다. **Neon Serverless PostgreSQL** 에 연동되어 실제 저장된 관측/예측 데이터를 제공하도록 설계되었습니다 (단방향 레이어드 아키텍처 적용). 내부적으로 `Zod`와 `next-swagger-doc`을 사용하여 OpenAPI(Swagger) 스펙을 자동 생성합니다.

## 1. 전력거래소 (KPX) SMP 및 수요예측 API
* **Endpoint**: `GET /openapi/kpx/smp-demand`
* **설명**: 일자 및 시간별 제주/육지 계통한계가격(SMP)과 전력수요 예측 데이터를 조회합니다.

### 요청 파라미터
| 파라미터명 | 방식 | 필수 여부 | 설명 |
|---|---|---|---|
| `x-api-key` | `Query/Header` | Y | 사전 발급된 API 인증키 (20개 중 택 1) |
| `pageNo` | `string` | Y | 페이지 번호 |
| `numOfRows` | `string` | Y | 한 페이지 결과 수 |
| `dataType` | `string` | Y | 응답메시지 형식 (`xml` 또는 `json`) |
| `date` | `string` | N | 일자 (`YYYYMMDD`) |

### 응답 구조 (JSON)
응답은 `response > body > items > item`의 계층 구조를 갖습니다.
* `date`: 일시 (`YYYYMMDD`)
* `hour`: 시간 (1~24)
* `areaName`: 지역 (육지, 제주)
* `smp`: 계통한계가격
* `mlfd`: 육지 예측수요
* `jlfd`: 제주 예측수요
* `slfd`: 총 예측수요
* `rn`: 순번

---

## 2. 기상청 (KMA) 지상관측망(ASOS) 자료 API
* **Endpoint**: `GET /openapi/kma/observation`
* **설명**: 국내 지상 기상관측망(ASOS)의 관측 자료(온도, 강수량, 습도 등)를 조회합니다.

### 요청 파라미터
| 파라미터명 | 방식 | 필수 여부 | 설명 |
|---|---|---|---|
| `x-api-key` | `Query/Header` | Y | 사전 발급된 API 인증키 (20개 중 택 1) |
| `tm` | `string` | N | 년월일시분(KST) 또는 년월일(KST) (생략 시 현재 시각) |
| `stn` | `string` | N | 지점번호 (`:`로 구분, `0` 또는 생략 시 전체 지점) |
| `help` | `string` | N | `1` 이면 필드 도움말 추가 |

### 응답 구조 (JSON)
응답은 `response > body > items > item`의 계층 구조를 갖습니다. 기상청 API 허브의 46개 모든 필드를 포함합니다.

*   **주요 관측 필드**:
    *   `TM`: 관측시각 (KST, `YYYYMMDDHHmm`)
    *   `STN`: 국내 지점번호 (예: 108 서울)
    *   `TA`: 기온 (°C)
    *   `HM`: 상대습도 (%)
    *   `RN`: 강수량 (mm)
    *   `WS`: 풍속 (m/s)
    *   `WD`: 풍속 (36방위)
    *   `PA` / `PS`: 현지기압 / 해면기압 (hPa)
    *   `TS`: 지면온도 (°C)
*   **기타**: `GST_WS`(순간최대풍속), `VS`(시정), `SS`(일조), `SI`(일사) 등 총 46개 지표 제공


---

## 3. 기상청 (KMA) 중기예보(육상) API
* **Endpoint**: `GET /openapi/kma/mid-fcst`
* **설명**: 기상청 중기예보(육상) 기상전망 데이터를 조회합니다.

### 요청 파라미터
| 파라미터명 | 방식 | 필수 여부 | 설명 |
|---|---|---|---|
| `x-api-key` | `Query/Header` | Y | 사전 발급된 API 인증키 (20개 중 택 1) |
| `pageNo` | `string` | Y | 페이지 번호 |
| `numOfRows` | `string` | Y | 한 페이지 결과 수 |
| `dataType` | `string` | N | 응답 형식 (`XML` 또는 `JSON`) |
| `stnId` | `string` | Y | 지점번호 (108 전국, 109 서울 등) |
| `tmFc` | `string` | Y | 발표시각 (예: 202310170600) |

### 응답 구조 (JSON)
*   `wfSv`: 1000자 이내의 기상전망 상세 텍스트 정보

---

## 4. 공통 HTTP 상태 코드 (Responses)
모든 API 응답은 아래의 HTTP 상태 코드를 따릅니다.

| 상태 코드 | 의미 | 설명 |
|---|---|---|
| `200` | **OK** | 요청이 성공적으로 처리되었으며 데이터를 정상 반환함 |
| `400` | **Bad Request** | 필수 파라미터 누락, 잘못된 타입 등 클라이언트 측 요청 오류 |
| `401` | **Unauthorized** | 파라미터나 헤더에 `x-api-key`가 누락되었거나 유효하지 않은 키를 사용함 |
| `500` | **Internal Server Error** | 서버 내부 또는 외부 공공데이터 연동 과정에서 알 수 없는 오류 발생 |

---

## 5. Swagger 명세(UI) 접근 방법
서버가 실행 중일 때 브라우저에서 아래 주소로 접속하면 Swagger 인터랙티브 UI를 통해 API 테스트가 가능합니다.
* **접속 주소**: `http://localhost:3000/api-docs`
