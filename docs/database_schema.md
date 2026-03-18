# PostgreSQL Database Schema

이 문서는 교육용 API 실습 페이지에서 사용할 외부 데이터(전력거래소, 기상청)의 원천 데이터를 원본에 가깝게 저장하기 위한 PostgreSQL 테이블 스키마입니다.

## 1. 전력거래소 SMP/수요예측 테이블 (`kpx_smp_forecast`)

전력거래소의 SMP 및 예측수요 데이터를 저장합니다.

```sql
CREATE TABLE kpx_smp_forecast (
    id BIGSERIAL PRIMARY KEY,           -- 내부 식별자
    date VARCHAR(8) NOT NULL,           -- 일자 (YYYYMMDD)
    hour INTEGER NOT NULL,              -- 시간 (1-24)
    area_name VARCHAR(10) NOT NULL,     -- 지역 (육지, 제주)
    smp NUMERIC(12,4),                  -- 계통한계가격
    mlfd NUMERIC(14,2),                 -- 육지 예측수요
    jlfd NUMERIC(14,2),                 -- 제주 예측수요
    slfd NUMERIC(14,2),                 -- 총 예측수요
    created_at TIMESTAMP DEFAULT NOW(), -- 저장시각
    
    CONSTRAINT uq_kpx_date_hour_area UNIQUE (date, hour, area_name)
);
```

### 컬럼 설명
* `date`: `YYYYMMDD` 형식의 날짜 문자열
* `hour`: 1부터 24까지의 시간
* `area_name`: '육지' 또는 '제주'
* `smp`: 소수점 4자리까지의 정밀도를 가지는 계통한계가격
* `mlfd`, `jlfd`, `slfd`: 소수점 2자리까지의 정밀도를 가지는 수요 데이터

---

## 2. 기상청 관측자료 테이블 (`kma_observation`)

기상청의 종관기상관측(ASOS) 등 지상관측자료를 저장합니다.

```sql
CREATE TABLE kma_observation (
    id BIGSERIAL PRIMARY KEY,           -- 내부 식별자
    tm VARCHAR(12) NOT NULL,            -- 관측시각 (YYYYMMDDHHmm)
    stn INTEGER NOT NULL,               -- 지점번호
    wd VARCHAR(20),                     -- 풍향
    ws VARCHAR(20),                     -- 풍속
    gst_wd VARCHAR(20),                 -- 돌풍향
    gst_ws VARCHAR(20),                 -- 돌풍속
    gst_tm VARCHAR(4),                  -- 돌풍속 관측시각
    pa VARCHAR(20),                     -- 현지기압
    ps VARCHAR(20),                     -- 해면기압
    pt VARCHAR(20),                     -- 기압변화경향
    pr VARCHAR(20),                     -- 기압변화량
    ta VARCHAR(20),                     -- 기온
    td VARCHAR(20),                     -- 이슬점온도
    hm VARCHAR(20),                     -- 상대습도
    pv VARCHAR(20),                     -- 수증기압
    rn VARCHAR(20),                     -- 강수량
    rn_day VARCHAR(20),                 -- 일강수량
    rn_int VARCHAR(20),                 -- 강수강도
    sd_hr3 VARCHAR(20),                 -- 3시간 신적설
    sd_day VARCHAR(20),                 -- 일 신적설
    sd_tot VARCHAR(20),                 -- 적설
    wc VARCHAR(50),                     -- 현재일기
    wp VARCHAR(50),                     -- 과거일기
    ww VARCHAR(100),                    -- 국내식 일기코드
    ca_tot VARCHAR(20),                 -- 전운량
    ca_mid VARCHAR(20),                 -- 중하층운량
    ch_min VARCHAR(20),                 -- 최저운고
    ct VARCHAR(50),                     -- 운형
    ct_top VARCHAR(20),                 -- 상층운형
    ct_mid VARCHAR(20),                 -- 중층운형
    ct_low VARCHAR(20),                 -- 하층운형
    vs VARCHAR(20),                     -- 시정
    ss VARCHAR(20),                     -- 일조
    si VARCHAR(20),                     -- 일사
    st_gd VARCHAR(20),                  -- 지면상태 코드
    ts VARCHAR(20),                     -- 지면온도
    te_005 VARCHAR(20),                 -- 5cm 지중온도
    te_01 VARCHAR(20),                  -- 10cm 지중온도
    te_02 VARCHAR(20),                  -- 20cm 지중온도
    te_03 VARCHAR(20),                  -- 30cm 지중온도
    st_sea VARCHAR(20),                 -- 해면상태 코드
    wh VARCHAR(20),                     -- 파고
    bf VARCHAR(20),                     -- 최대풍력
    ir VARCHAR(20),                     -- 강수/결측 구분
    ix VARCHAR(20),                     -- 유인/무인관측
    rn_jun VARCHAR(20),                 -- 일강수량
    created_at TIMESTAMP DEFAULT NOW(), -- 저장시각

    CONSTRAINT uq_kma_tm_stn UNIQUE (tm, stn)
);
```

### 컬럼 설명
* `tm`: `YYYYMMDDHHmm` 형식 (예: 202310121500)
* `stn`: 기상청 지점번호 (예: 108 서울)
* 관측값이 없는 경우를 대비하여 주요 수치들은 Nullable한 구조 혹은 문자열로 저장 후 앱단에서 처리합니다. (외부 API 응답 스펙을 최대한 원본 그대로 반영하기 위해 `VARCHAR`가 주로 사용되었습니다.)
