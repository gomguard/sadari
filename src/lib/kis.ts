/**
 * 한국투자증권 (KIS) Open API 서비스
 *
 * 한투 오픈API를 통해 국내 주식 시세, 지수, 업종 데이터를 조회합니다.
 * - OAuth 토큰 관리 (발급/갱신)
 * - 종목별 현재가 조회
 * - 복수 종목 시세 조회
 * - 코스피/코스닥 지수 조회
 * - 업종별 시세 조회
 * - 거래대금 조회
 *
 * 환경변수:
 *   KIS_APP_KEY     - 한투 앱키
 *   KIS_APP_SECRET  - 한투 앱시크릿
 *   KIS_ACCOUNT_NO  - 계좌번호 (토큰 발급용)
 *   KIS_MODE        - "real" (실전투자) 또는 "virtual" (모의투자), 기본값: "real"
 */

// ============================================================
// 타입 정의
// ============================================================

/** 한투 API 모드 (실전투자 / 모의투자) */
type KISMode = "real" | "virtual";

/** OAuth 접근 토큰 응답 */
interface KISTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // 초 단위 (보통 86400 = 24시간)
  access_token_token_expired: string; // 만료 시각 문자열
}

/** 캐시된 토큰 정보 */
interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp (ms)
}

/** 주식 현재가 조회 API 응답의 output 필드 */
export interface KISStockPriceOutput {
  stck_prpr: string;    // 주식 현재가
  prdy_vrss: string;    // 전일 대비
  prdy_vrss_sign: string; // 전일 대비 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락)
  prdy_ctrt: string;    // 전일 대비율 (%)
  acml_vol: string;     // 누적 거래량
  acml_tr_pbmn: string; // 누적 거래대금
  stck_oprc: string;    // 시가
  stck_hgpr: string;    // 최고가
  stck_lwpr: string;    // 최저가
  stck_mxpr: string;    // 상한가
  stck_llam: string;    // 하한가
  per: string;          // PER
  pbr: string;          // PBR
  hts_avls: string;     // HTS 시가총액
}

/** 주식 현재가 API 전체 응답 */
interface KISStockPriceResponse {
  rt_cd: string;   // 응답코드 ("0" = 정상)
  msg_cd: string;  // 메시지코드
  msg1: string;    // 메시지
  output: KISStockPriceOutput;
}

/** 정제된 주식 시세 데이터 */
export interface StockPrice {
  ticker: string;        // 종목코드
  price: number;         // 현재가
  change: number;        // 전일 대비 (원)
  changeRate: number;    // 전일 대비율 (%)
  changeSign: string;    // 등락 부호
  volume: number;        // 누적 거래량
  tradingValue: number;  // 누적 거래대금
  open: number;          // 시가
  high: number;          // 최고가
  low: number;           // 최저가
  upperLimit: number;    // 상한가
  lowerLimit: number;    // 하한가
  per: number;           // PER
  pbr: number;           // PBR
  marketCap: number;     // 시가총액 (억 원)
  timestamp: number;     // 조회 시각 (Unix ms)
}

/** 지수 조회 API 응답의 output 필드 */
export interface KISIndexOutput {
  bstp_nmix_prpr: string;   // 업종 지수 현재가
  bstp_nmix_prdy_vrss: string; // 전일 대비
  prdy_vrss_sign: string;   // 전일 대비 부호
  bstp_nmix_prdy_ctrt: string; // 전일 대비율 (%)
  acml_vol: string;          // 누적 거래량
  acml_tr_pbmn: string;     // 누적 거래대금
}

/** 지수 API 전체 응답 */
interface KISIndexResponse {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  output: KISIndexOutput;
}

/** 정제된 지수 데이터 */
export interface MarketIndex {
  name: string;         // 지수명 (코스피, 코스닥)
  code: string;         // 업종코드
  value: number;        // 현재 지수
  change: number;       // 전일 대비
  changeRate: number;   // 전일 대비율 (%)
  changeSign: string;   // 등락 부호
  volume: number;       // 누적 거래량
  tradingValue: number; // 누적 거래대금
  timestamp: number;
}

/** 업종별 시세 데이터 */
export interface SectorData {
  code: string;         // 업종코드
  name: string;         // 업종명
  value: number;        // 현재 지수
  change: number;       // 전일 대비
  changeRate: number;   // 전일 대비율 (%)
  changeSign: string;
  timestamp: number;
}

/** 시장 상태 */
export type MarketStatus = "장 시작 전" | "거래중" | "장 마감";

/** 시장 개요 데이터 */
export interface MarketOverview {
  kospi: MarketIndex;
  kosdaq: MarketIndex;
  status: MarketStatus;
  timestamp: number;
}

/** API 에러 */
export class KISApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseCode?: string,
    public responseMessage?: string
  ) {
    super(message);
    this.name = "KISApiError";
  }
}

// ============================================================
// 상수 및 설정
// ============================================================

/** 실전투자 API 베이스 URL */
const REAL_BASE_URL = "https://openapi.koreainvestment.com:9443";

/** 모의투자 API 베이스 URL */
const VIRTUAL_BASE_URL = "https://openapivts.koreainvestment.com:29443";

/** API 엔드포인트 */
const ENDPOINTS = {
  /** OAuth 토큰 발급 */
  TOKEN: "/oauth2/tokenP",
  /** 주식 현재가 조회 */
  STOCK_PRICE: "/uapi/domestic-stock/v1/quotations/inquire-price",
  /** 업종(지수) 현재가 조회 */
  INDEX_PRICE: "/uapi/domestic-stock/v1/quotations/inquire-index-price",
} as const;

/**
 * 거래 ID (tr_id)
 * 실전투자와 모의투자에서 동일한 tr_id를 사용
 */
const TR_IDS = {
  /** 주식 현재가 조회 */
  STOCK_PRICE: "FHKST01010100",
  /** 업종(지수) 현재가 조회 */
  INDEX_PRICE: "FHPUP02100000",
} as const;

/**
 * 주요 업종 코드 매핑
 * 한투 API에서 사용하는 업종분류 코드
 */
export const SECTOR_CODES: Record<string, string> = {
  "0001": "종합(코스피)",
  "0002": "대형주",
  "0003": "중형주",
  "0004": "소형주",
  "0005": "음식료업",
  "0006": "섬유의복",
  "0007": "종이목재",
  "0008": "화학",
  "0009": "의약품",
  "0010": "비금속광물",
  "0011": "철강금속",
  "0012": "기계",
  "0013": "전기전자",
  "0014": "의료정밀",
  "0015": "운수장비",
  "0016": "유통업",
  "0017": "전기가스업",
  "0018": "건설업",
  "0019": "운수창고",
  "0020": "통신업",
  "0021": "금융업",
  "0022": "은행",
  "0024": "증권",
  "0025": "보험",
  "0026": "서비스업",
  "0027": "제조업",
  "1001": "종합(코스닥)",
};

/**
 * 주요 업종 코드 (프론트엔드에서 자주 조회하는 업종)
 * 업종명 -> 업종코드
 */
export const MAJOR_SECTOR_MAP: Record<string, string> = {
  코스피: "0001",
  코스닥: "1001",
  대형주: "0002",
  전기전자: "0013",  // 반도체 포함
  의약품: "0009",    // 바이오 포함
  운수장비: "0015",  // 조선 포함
  화학: "0008",
  철강금속: "0011",
  건설업: "0018",
  금융업: "0021",
  통신업: "0020",
  유통업: "0016",
  서비스업: "0026",
  기계: "0012",
};

// ============================================================
// 시세 캐시 (Rate Limit 대응)
// ============================================================

/**
 * 간단한 인메모리 캐시
 * 한투 API는 초당 요청 제한이 있으므로 캐시를 적용합니다.
 * - 주식 시세: 5초
 * - 지수 시세: 10초
 * - 토큰: 만료 1시간 전까지
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number; // Unix timestamp (ms)
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/** 캐시 TTL 설정 (밀리초) */
const CACHE_TTL = {
  STOCK_PRICE: 5_000,   // 주식 시세: 5초
  INDEX_PRICE: 10_000,  // 지수 시세: 10초
  TOKEN: 3600_000,      // 토큰 캐시는 별도 관리 (만료 1시간 전까지)
} as const;

// ============================================================
// Rate Limiter (초당 요청 제한)
// ============================================================

/**
 * 간단한 Rate Limiter
 * 한투 API는 초당 약 20건의 요청 제한이 있습니다.
 */
class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 18, windowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /** 요청 가능 여부 확인 후 대기 */
  async waitForSlot(): Promise<void> {
    const now = Date.now();
    // 윈도우 밖의 타임스탬프 제거
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      // 가장 오래된 요청이 윈도우를 벗어날 때까지 대기
      const waitTime = this.timestamps[0] + this.windowMs - now + 10;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.waitForSlot(); // 재귀 호출로 재확인
    }

    this.timestamps.push(now);
  }
}

const rateLimiter = new RateLimiter();

// ============================================================
// 토큰 관리
// ============================================================

/** 캐시된 토큰 (서버 메모리에 보관) */
let cachedToken: CachedToken | null = null;

/**
 * 현재 API 모드 (실전/모의) 에 따른 베이스 URL 반환
 */
function getBaseUrl(): string {
  const mode = (process.env.KIS_MODE || "real") as KISMode;
  return mode === "virtual" ? VIRTUAL_BASE_URL : REAL_BASE_URL;
}

/**
 * 환경변수에서 API 키 정보를 가져옵니다.
 * 설정되지 않은 경우 에러를 발생시킵니다.
 */
function getCredentials() {
  const appKey = process.env.KIS_APP_KEY;
  const appSecret = process.env.KIS_APP_SECRET;

  if (!appKey || !appSecret) {
    throw new KISApiError(
      "KIS API 인증 정보가 설정되지 않았습니다. KIS_APP_KEY, KIS_APP_SECRET 환경변수를 확인하세요.",
      401
    );
  }

  return { appKey, appSecret };
}

/**
 * OAuth 접근 토큰을 발급받습니다.
 * 이미 유효한 토큰이 캐시되어 있으면 캐시된 토큰을 반환합니다.
 *
 * @returns 접근 토큰 문자열
 */
export async function getAccessToken(): Promise<string> {
  // 캐시된 토큰이 아직 유효하면 재사용 (만료 1시간 전까지)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 3600_000) {
    return cachedToken.accessToken;
  }

  const { appKey, appSecret } = getCredentials();
  const baseUrl = getBaseUrl();

  await rateLimiter.waitForSlot();

  const response = await fetch(`${baseUrl}${ENDPOINTS.TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: appKey,
      appsecret: appSecret,
    }),
  });

  if (!response.ok) {
    throw new KISApiError(
      `토큰 발급 실패: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data: KISTokenResponse = await response.json();

  // 토큰 캐시 (expires_in은 초 단위)
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * 토큰을 강제로 갱신합니다.
 * 토큰 만료 오류 발생 시 호출합니다.
 */
export async function refreshAccessToken(): Promise<string> {
  cachedToken = null;
  return getAccessToken();
}

// ============================================================
// 공통 API 호출 헬퍼
// ============================================================

/**
 * 한투 API 공통 GET 요청 헬퍼
 * 인증 헤더, Rate Limiting, 에러 처리를 포함합니다.
 *
 * @param endpoint - API 엔드포인트 경로
 * @param trId - 거래 ID (tr_id)
 * @param params - 쿼리 파라미터
 * @returns API 응답 JSON
 */
async function kisGet<T>(
  endpoint: string,
  trId: string,
  params: Record<string, string>
): Promise<T> {
  const { appKey, appSecret } = getCredentials();
  const token = await getAccessToken();
  const baseUrl = getBaseUrl();

  // Rate Limit 대기
  await rateLimiter.waitForSlot();

  // 쿼리 스트링 생성
  const queryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}${endpoint}?${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      authorization: `Bearer ${token}`,
      appkey: appKey,
      appsecret: appSecret,
      tr_id: trId,
      // 고객타입 (개인: P, 법인: B)
      custtype: "P",
    },
  });

  if (!response.ok) {
    // 토큰 만료 시 갱신 후 1회 재시도
    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      await rateLimiter.waitForSlot();

      const retryResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          authorization: `Bearer ${newToken}`,
          appkey: appKey,
          appsecret: appSecret,
          tr_id: trId,
          custtype: "P",
        },
      });

      if (!retryResponse.ok) {
        throw new KISApiError(
          `API 요청 실패 (재시도): ${retryResponse.status}`,
          retryResponse.status
        );
      }

      return retryResponse.json();
    }

    throw new KISApiError(
      `API 요청 실패: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();

  // 한투 API 응답코드 확인 ("0"이 정상)
  if (data.rt_cd && data.rt_cd !== "0") {
    throw new KISApiError(
      `API 응답 에러: ${data.msg1}`,
      response.status,
      data.msg_cd,
      data.msg1
    );
  }

  return data as T;
}

// ============================================================
// 주식 시세 조회
// ============================================================

/**
 * 단일 종목의 현재가를 조회합니다.
 *
 * @param ticker - 종목코드 (예: "005930" = 삼성전자)
 * @returns 정제된 주식 시세 데이터
 *
 * @example
 * ```ts
 * const samsung = await getStockPrice("005930");
 * console.log(`삼성전자 현재가: ${samsung.price}원`);
 * ```
 */
export async function getStockPrice(ticker: string): Promise<StockPrice> {
  // 캐시 확인
  const cacheKey = `stock:${ticker}`;
  const cached = getCached<StockPrice>(cacheKey);
  if (cached) return cached;

  const data = await kisGet<KISStockPriceResponse>(
    ENDPOINTS.STOCK_PRICE,
    TR_IDS.STOCK_PRICE,
    {
      // FID 조건 시장 분류 코드 (J: 주식/ETF/ETN, W: ELW)
      FID_COND_MRKT_DIV_CODE: "J",
      // FID 입력 종목코드
      FID_INPUT_ISCD: ticker,
    }
  );

  const output = data.output;

  const result: StockPrice = {
    ticker,
    price: parseInt(output.stck_prpr, 10),
    change: parseInt(output.prdy_vrss, 10),
    changeRate: parseFloat(output.prdy_ctrt),
    changeSign: output.prdy_vrss_sign,
    volume: parseInt(output.acml_vol, 10),
    tradingValue: parseInt(output.acml_tr_pbmn, 10),
    open: parseInt(output.stck_oprc, 10),
    high: parseInt(output.stck_hgpr, 10),
    low: parseInt(output.stck_lwpr, 10),
    upperLimit: parseInt(output.stck_mxpr, 10),
    lowerLimit: parseInt(output.stck_llam, 10),
    per: parseFloat(output.per) || 0,
    pbr: parseFloat(output.pbr) || 0,
    marketCap: parseInt(output.hts_avls, 10) || 0,
    timestamp: Date.now(),
  };

  // 캐시 저장
  setCache(cacheKey, result, CACHE_TTL.STOCK_PRICE);

  return result;
}

/**
 * 복수 종목의 현재가를 한꺼번에 조회합니다.
 * 각 종목별로 개별 API 호출을 수행하며, Rate Limit을 준수합니다.
 *
 * @param tickers - 종목코드 배열 (예: ["005930", "000660"])
 * @returns 종목코드를 키로 하는 시세 데이터 맵
 *
 * @example
 * ```ts
 * const prices = await getMultipleStockPrices(["005930", "000660"]);
 * console.log(prices["005930"].price); // 삼성전자 현재가
 * ```
 */
export async function getMultipleStockPrices(
  tickers: string[]
): Promise<Record<string, StockPrice>> {
  const results: Record<string, StockPrice> = {};

  // 한투 API는 단건 조회만 지원하므로 순차 호출
  // Rate Limit 준수를 위해 Promise.all 대신 순차 처리
  // (캐시된 데이터는 즉시 반환되므로 성능 문제 최소화)
  for (const ticker of tickers) {
    try {
      results[ticker] = await getStockPrice(ticker);
    } catch (error) {
      // 개별 종목 오류 시 나머지는 계속 조회
      console.error(`종목 ${ticker} 조회 실패:`, error);
    }
  }

  return results;
}

// ============================================================
// 지수(코스피/코스닥) 조회
// ============================================================

/**
 * 업종(지수) 현재가를 조회합니다.
 *
 * @param sectorCode - 업종코드 (예: "0001" = 코스피, "1001" = 코스닥)
 * @returns 정제된 지수 데이터
 */
export async function getIndexPrice(sectorCode: string): Promise<MarketIndex> {
  const cacheKey = `index:${sectorCode}`;
  const cached = getCached<MarketIndex>(cacheKey);
  if (cached) return cached;

  const data = await kisGet<KISIndexResponse>(
    ENDPOINTS.INDEX_PRICE,
    TR_IDS.INDEX_PRICE,
    {
      // FID 조건 시장 분류 코드 (U: 업종)
      FID_COND_MRKT_DIV_CODE: "U",
      // FID 입력 종목코드 (업종코드)
      FID_INPUT_ISCD: sectorCode,
    }
  );

  const output = data.output;
  const name = SECTOR_CODES[sectorCode] || sectorCode;

  const result: MarketIndex = {
    name,
    code: sectorCode,
    value: parseFloat(output.bstp_nmix_prpr),
    change: parseFloat(output.bstp_nmix_prdy_vrss),
    changeRate: parseFloat(output.bstp_nmix_prdy_ctrt),
    changeSign: output.prdy_vrss_sign,
    volume: parseInt(output.acml_vol, 10),
    tradingValue: parseInt(output.acml_tr_pbmn, 10),
    timestamp: Date.now(),
  };

  setCache(cacheKey, result, CACHE_TTL.INDEX_PRICE);

  return result;
}

/**
 * 코스피, 코스닥 지수를 함께 조회합니다.
 *
 * @returns 코스피/코스닥 지수 및 시장 상태
 */
export async function getMarketOverview(): Promise<MarketOverview> {
  const cacheKey = "market:overview";
  const cached = getCached<MarketOverview>(cacheKey);
  if (cached) return cached;

  // 코스피, 코스닥 순차 조회 (Rate Limit 고려)
  const kospi = await getIndexPrice("0001");
  const kosdaq = await getIndexPrice("1001");

  const status = getMarketStatus();

  const result: MarketOverview = {
    kospi,
    kosdaq,
    status,
    timestamp: Date.now(),
  };

  setCache(cacheKey, result, CACHE_TTL.INDEX_PRICE);

  return result;
}

// ============================================================
// 업종별 시세 조회
// ============================================================

/**
 * 주요 업종의 시세를 일괄 조회합니다.
 *
 * @param sectorCodes - 업종코드 배열 (기본값: 주요 업종 전체)
 * @returns 업종별 시세 데이터 배열
 */
export async function getSectorData(
  sectorCodes?: string[]
): Promise<SectorData[]> {
  const codes = sectorCodes || Object.keys(MAJOR_SECTOR_MAP).map((k) => MAJOR_SECTOR_MAP[k]);
  const results: SectorData[] = [];

  for (const code of codes) {
    try {
      const index = await getIndexPrice(code);
      results.push({
        code: index.code,
        name: index.name,
        value: index.value,
        change: index.change,
        changeRate: index.changeRate,
        changeSign: index.changeSign,
        timestamp: index.timestamp,
      });
    } catch (error) {
      console.error(`업종 ${code} 조회 실패:`, error);
    }
  }

  return results;
}

/**
 * 거래대금 상위 데이터를 조회합니다.
 * 코스피/코스닥의 총 거래대금을 반환합니다.
 *
 * @returns 총 거래대금 정보
 */
export async function getTotalTradingValue(): Promise<{
  kospiTradingValue: number;
  kosdaqTradingValue: number;
  totalTradingValue: number;
  timestamp: number;
}> {
  const cacheKey = "trading:total";
  const cached = getCached<{
    kospiTradingValue: number;
    kosdaqTradingValue: number;
    totalTradingValue: number;
    timestamp: number;
  }>(cacheKey);
  if (cached) return cached;

  const kospi = await getIndexPrice("0001");
  const kosdaq = await getIndexPrice("1001");

  const result = {
    kospiTradingValue: kospi.tradingValue,
    kosdaqTradingValue: kosdaq.tradingValue,
    totalTradingValue: kospi.tradingValue + kosdaq.tradingValue,
    timestamp: Date.now(),
  };

  setCache(cacheKey, result, CACHE_TTL.INDEX_PRICE);

  return result;
}

// ============================================================
// 일봉 (과거 종가) 조회
// ============================================================

/** 일봉 데이터 */
export interface DailyPrice {
  date: string;       // YYYYMMDD
  close: number;      // 종가
  open: number;       // 시가
  high: number;       // 고가
  low: number;        // 저가
  volume: number;     // 거래량
}

/**
 * 특정 기간의 일봉 데이터를 조회합니다.
 * 한투 API: /uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice
 *
 * @param ticker - 종목코드
 * @param startDate - 시작일 (YYYYMMDD)
 * @param endDate - 종료일 (YYYYMMDD)
 * @returns 일봉 배열
 */
export async function getDailyPrices(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<DailyPrice[]> {
  const trId = "FHKST03010100";
  const data = await kisGet<{
    rt_cd: string;
    msg1: string;
    output2: Array<{
      stck_bsop_date: string; // 영업일자
      stck_clpr: string;     // 종가
      stck_oprc: string;     // 시가
      stck_hgpr: string;     // 고가
      stck_lwpr: string;     // 저가
      acml_vol: string;      // 거래량
    }>;
  }>("/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice", trId, {
    FID_COND_MRKT_DIV_CODE: "J",
    FID_INPUT_ISCD: ticker,
    FID_INPUT_DATE_1: startDate,
    FID_INPUT_DATE_2: endDate,
    FID_PERIOD_DIV_CODE: "D",
    FID_ORG_ADJ_PRC: "1",
  });

  return (data.output2 || [])
    .filter((d) => d.stck_bsop_date)
    .map((d) => ({
      date: d.stck_bsop_date,
      close: Number(d.stck_clpr),
      open: Number(d.stck_oprc),
      high: Number(d.stck_hgpr),
      low: Number(d.stck_lwpr),
      volume: Number(d.acml_vol),
    }));
}

/**
 * 특정 날짜의 종가를 조회합니다.
 * 해당일이 휴장이면 직전 영업일 종가를 반환합니다.
 *
 * @param ticker - 종목코드
 * @param date - 조회일 (YYYYMMDD)
 * @returns 종가
 */
export async function getClosingPrice(
  ticker: string,
  date: string
): Promise<number | null> {
  try {
    const prices = await getDailyPrices(ticker, date, date);
    if (prices.length > 0) return prices[0].close;

    // 해당일 데이터 없으면 앞뒤 5일 범위로 조회
    const d = new Date(
      `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
    );
    d.setDate(d.getDate() - 5);
    const start = d.toISOString().slice(0, 10).replace(/-/g, "");
    const extended = await getDailyPrices(ticker, start, date);
    if (extended.length > 0) return extended[extended.length - 1].close;

    return null;
  } catch {
    return null;
  }
}

// ============================================================
// 유틸리티
// ============================================================

/**
 * 현재 시장 상태를 판단합니다.
 * 한국 주식시장 정규 거래시간: 09:00 ~ 15:30 (KST)
 *
 * @returns 시장 상태 문자열
 */
export function getMarketStatus(): MarketStatus {
  // 한국 시간 기준 (KST = UTC+9)
  const now = new Date();
  const kstOffset = 9 * 60; // 분 단위
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const kstMinutes = utcMinutes + kstOffset;

  // KST 기준 시/분 계산 (24시간 형식)
  const kstHours = Math.floor(kstMinutes / 60) % 24;
  const kstMins = kstMinutes % 60;
  const totalMinutes = kstHours * 60 + kstMins;

  // 주말 체크
  const kstDay = now.getUTCDay();
  // UTC 날짜와 KST 날짜가 다를 수 있으므로 보정
  const kstDate = new Date(now.getTime() + kstOffset * 60 * 1000);
  const dayOfWeek = kstDate.getUTCDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return "장 마감"; // 주말
  }

  // 09:00 (540분) ~ 15:30 (930분)
  if (totalMinutes < 540) {
    return "장 시작 전";
  } else if (totalMinutes < 930) {
    return "거래중";
  } else {
    return "장 마감";
  }
}

/**
 * 전일대비 부호를 읽기 쉬운 문자로 변환합니다.
 *
 * @param sign - 한투 API 부호 코드 (1~5)
 * @returns 부호 문자열
 */
export function formatChangeSign(sign: string): string {
  switch (sign) {
    case "1":
      return "▲"; // 상한
    case "2":
      return "▲"; // 상승
    case "3":
      return "-"; // 보합
    case "4":
      return "▼"; // 하한
    case "5":
      return "▼"; // 하락
    default:
      return "";
  }
}
