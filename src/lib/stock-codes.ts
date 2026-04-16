/**
 * 사다리에서 다루는 종목의 종목코드 매핑
 * 종목명 → 6자리 종목코드
 */
export const STOCK_CODES: Record<string, string> = {
  "삼성전자": "005930",
  "SK하이닉스": "000660",
  "대봉엘에스": "078140",
  "본느": "417790",
  "현대로템": "064350",
  "코오롱 모빌리티": "002020",
  "유한양행": "000100",
  "LS ELECTRIC": "010120",
  "한미약품": "128940",
  "셀트리온": "068270",
  "솔브레인": "357780",
  "동진쎄미켐": "005290",
  "큐브엔터": "182360",
  "아이패밀리에스씨": "122900",
  "넥슨게임즈": "225570",
  "이랜시스": "365270",
  "HD한국조선해양": "009540",
  "한화오션": "042660",
};

/** 종목명으로 종목코드 찾기 */
export function getTickerCode(stockName: string): string | undefined {
  return STOCK_CODES[stockName];
}

/** 종목코드로 종목명 찾기 */
export function getStockName(ticker: string): string | undefined {
  return Object.entries(STOCK_CODES).find(([, code]) => code === ticker)?.[0];
}
