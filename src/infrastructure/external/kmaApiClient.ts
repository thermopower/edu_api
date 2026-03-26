/**
 * 기상청(KMA) 데이터 수집을 위한 외부 연동 클라이언트
 */

export interface KmaFetchResult {
  tm: string;
  stn: number;
  wd?: string | null;
  ws?: string | null;
  gst_wd?: string | null;
  gst_ws?: string | null;
  gst_tm?: string | null;
  pa?: string | null;
  ps?: string | null;
  pt?: string | null;
  pr?: string | null;
  ta?: string | null;
  td?: string | null;
  hm?: string | null;
  pv?: string | null;
  rn?: string | null;
  rn_day?: string | null;
  rn_jun?: string | null;
  rn_int?: string | null;
  sd_hr3?: string | null;
  sd_day?: string | null;
  sd_tot?: string | null;
  wc?: string | null;
  wp?: string | null;
  ww?: string | null;
  ca_tot?: string | null;
  ca_mid?: string | null;
  ch_min?: string | null;
  ct?: string | null;
  ct_top?: string | null;
  ct_mid?: string | null;
  ct_low?: string | null;
  vs?: string | null;
  ss?: string | null;
  si?: string | null;
  st_gd?: string | null;
  ts?: string | null;
  te_005?: string | null;
  te_01?: string | null;
  te_02?: string | null;
  te_03?: string | null;
  st_sea?: string | null;
  wh?: string | null;
  bf?: string | null;
  ir?: string | null;
  ix?: string | null;
}

export async function fetchKmaObservationData(dateStr: string, stn: number): Promise<KmaFetchResult[]> {
  const apiKey = process.env.KMA_API_KEY;
  if (!apiKey || apiKey === "여기에_기상청_API_키를_입력하세요" || apiKey.includes("\n")) {
    throw new Error("KMA_API_KEY가 설정되지 않았습니다.");
  }

  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch(e) {}
  const encodedKey = encodeURIComponent(safeApiKey);

  const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php?tm=${dateStr}&stn=${stn}&help=0&authKey=${encodedKey}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  });

  const textData = await res.text();

  if (textData.includes("AUTH_FAIL") || textData.includes("ERR")) {
    throw new Error(`KMA API 에러 반환: ${textData}`);
  }

  const items: KmaFetchResult[] = [];

  try {
    // 1. JSON 시도
    const data = JSON.parse(textData);
    const resultItems = data?.response?.body?.items?.item || data?.info || (Array.isArray(data) ? data : []);
    
    for (const item of resultItems) {
      items.push({
        tm: item.TM || item.tm,
        stn: parseInt(item.STN || item.stn || stn.toString(), 10),
        wd: item.WD || item.wd || null,
        ws: item.WS || item.ws || null,
        pa: item.PA || item.pa || null,
        ps: item.PS || item.ps || null,
        ta: item.TA || item.ta || null,
        hm: item.HM || item.hm || null,
        rn: item.RN || item.rn || null,
        rn_day: item.RN_DAY || item.rnDay || null,
      });
    }
  } catch (e) {
    // 2. CSV(Text) 시도
    const lines = textData.split('\n');
    for (const line of lines) {
      if (line.trim() === '' || line.startsWith('#')) continue;
      const cols = line.trim().split(/\s+/);
      if (cols.length < 10) continue;
      
      const parseVal = (val: string) => (val && !val.includes('-9')) ? val : null;
      items.push({
        tm: cols[0],
        stn: parseInt(cols[1], 10),
        wd: parseVal(cols[2]),
        ws: parseVal(cols[3]),
        gst_wd: parseVal(cols[4]),
        gst_ws: parseVal(cols[5]),
        gst_tm: parseVal(cols[6]),
        pa: parseVal(cols[7]),
        ps: parseVal(cols[8]),
        pt: parseVal(cols[9]),
        pr: parseVal(cols[10]),
        ta: parseVal(cols[11]),
        td: parseVal(cols[12]),
        hm: parseVal(cols[13]),
        pv: parseVal(cols[14]),
        rn: parseVal(cols[15]),
        rn_day: parseVal(cols[16]),
        rn_jun: parseVal(cols[17]),
        rn_int: parseVal(cols[18]),
        sd_hr3: parseVal(cols[19]),
        sd_day: parseVal(cols[20]),
        sd_tot: parseVal(cols[21]),
        wc: parseVal(cols[22]),
        wp: parseVal(cols[23]),
        ww: parseVal(cols[24]),
        ca_tot: parseVal(cols[25]),
        ca_mid: parseVal(cols[26]),
        ch_min: parseVal(cols[27]),
        ct: parseVal(cols[28]),
        ct_top: parseVal(cols[29]),
        ct_mid: parseVal(cols[30]),
        ct_low: parseVal(cols[31]),
        vs: parseVal(cols[32]),
        ss: parseVal(cols[33]),
        si: parseVal(cols[34]),
        st_gd: parseVal(cols[35]),
        ts: parseVal(cols[36]),
        te_005: parseVal(cols[37]),
        te_01: parseVal(cols[38]),
        te_02: parseVal(cols[39]),
        te_03: parseVal(cols[40]),
        st_sea: parseVal(cols[41]),
        wh: parseVal(cols[42]),
        bf: parseVal(cols[43]),
        ir: parseVal(cols[44]),
        ix: parseVal(cols[45])
      });
    }
  }

  return items;
}

export interface KmaMidFcstFetchResult {
  stnId: string;
  tmFc: string;
  wfSv: string;
  dataType: string;
}

/**
 * 기상청 중기예보(육상) API 호출 함수
 */
export async function fetchKmaMidFcst(stnId: string, tmFc: string, pageNo: string = "1", numOfRows: string = "10", dataType: string = "JSON"): Promise<KmaMidFcstFetchResult[]> {
  // 공공데이터포털 API를 사용하므로 KPX_API_KEY를 재사용합니다.
  const apiKey = process.env.KPX_API_KEY;
  if (!apiKey || apiKey === "여기에_기상청_API_키를_입력하세요" || apiKey.includes("\n")) {
    throw new Error("KPX_API_KEY가 설정되지 않았습니다.");
  }

  let safeApiKey = apiKey;
  try { safeApiKey = decodeURIComponent(apiKey); } catch(e) {}
  const encodedKey = encodeURIComponent(safeApiKey);

  const url = `http://apis.data.go.kr/1360000/MidFcstInfoService/getMidFcst?ServiceKey=${encodedKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&dataType=${dataType}&stnId=${stnId}&tmFc=${tmFc}`;

  const res = await fetch(url, {
    method: "GET"
  });

  const textData = await res.text();
  
  try {
    const data = JSON.parse(textData);
    const resultCode = data?.response?.header?.resultCode;

    if (resultCode && resultCode !== '00') {
      throw new Error(`KMA MidFcst API 에러: ${data?.response?.header?.resultMsg}`);
    }

    const items = data?.response?.body?.items?.item || [];
    
    return items.map((item: any) => ({
      stnId,
      tmFc,
      wfSv: item.wfSv || "",
      dataType
    }));
  } catch (error) {
    if (textData.includes("OpenAPI_ServiceResponse")) {
      throw new Error("외부 KMA API 서버에서 XML 포맷 에러 메시지를 반환했습니다(상태이상 또는 제공 한도 초과 등).");
    }
    throw error;
  }
}
