# Educational API Practice - API Specification

본 프로젝트는 학생들이 공공 데이터(기상청, 전력거래소)의 API 활용법을 실습하기 위해 만들어진 **Next.js (App Router)** 기반의 모의 API(Mock API) 서버입니다. 내부적으로 `Zod`와 `next-swagger-doc`을 사용하여 OpenAPI(Swagger) 스펙을 자동 생성합니다.

## 1. 전력거래소 (KPX) SMP 및 수요예측 API
* **Endpoint**: `GET /openapi/kpx/smp-demand`
* **설명**: 일자 및 시간별 제주/육지 계통한계가격(SMP)과 전력수요 예측 데이터를 조회합니다.

### 요청 파라미터 (Query)
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| `serviceKey` | `string` | Y | 공공데이터포털 인증키 |
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

### 요청 파라미터 (Query)
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| `authKey` | `string` | Y | 기상청 API 인증키 |
| `tm` | `string` | N | 년월일시분(KST) 또는 년월일(KST) (생략 시 현재 시각) |
| `stn` | `string` | N | 지점번호 (`:`로 구분, `0` 또는 생략 시 전체 지점) |
| `help` | `string` | N | `1` 이면 필드 도움말 추가 |

### 응답 구조 (JSON)
응답은 `response > body > items > item`의 계층 구조를 갖습니다.
* `TM`: 관측시각 (KST)
* `STN`: 국내 지점번호
* `TA`: 기온 (Temperature)
* `HM`: 상대습도 (Humidity)
* `RN`: 강수량 (Rainfall)
* `WD` / `WS`: 풍향 / 풍속 등 다수지표 포함

---

## 3. Swagger 명세(UI) 접근 방법
서버가 실행 중일 때 브라우저에서 아래 주소로 접속하면 Swagger 인터랙티브 UI를 통해 API 테스트가 가능합니다.
* **접속 주소**: `http://localhost:3000/api-docs`
