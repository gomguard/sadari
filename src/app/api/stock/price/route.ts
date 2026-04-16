/**
 * 주식 현재가 조회 API 라우트
 *
 * GET /api/stock/price?ticker=005930         - 단일 종목 조회
 * GET /api/stock/price?tickers=005930,000660 - 복수 종목 조회
 *
 * 응답:
 * {
 *   success: boolean,
 *   data: StockPrice | Record<string, StockPrice>,
 *   timestamp: number
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getStockPrice,
  getMultipleStockPrices,
  type StockPrice,
} from "@/lib/kis";

/** 응답 캐시 헤더 설정 (CDN/브라우저 캐시 5초) */
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const tickers = searchParams.get("tickers");

    // 단일 종목 조회
    if (ticker) {
      // 종목코드 형식 검증 (6자리 숫자)
      if (!/^\d{6}$/.test(ticker)) {
        return NextResponse.json(
          {
            success: false,
            error: "종목코드는 6자리 숫자여야 합니다. (예: 005930)",
          },
          { status: 400 }
        );
      }

      const data = await getStockPrice(ticker);

      return NextResponse.json(
        { success: true, data, timestamp: Date.now() },
        { headers: CACHE_HEADERS }
      );
    }

    // 복수 종목 조회
    if (tickers) {
      const tickerList = tickers
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // 최대 20종목 제한 (Rate Limit 보호)
      if (tickerList.length > 20) {
        return NextResponse.json(
          {
            success: false,
            error: "한 번에 최대 20종목까지 조회할 수 있습니다.",
          },
          { status: 400 }
        );
      }

      // 각 종목코드 형식 검증
      const invalidTickers = tickerList.filter((t) => !/^\d{6}$/.test(t));
      if (invalidTickers.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `잘못된 종목코드: ${invalidTickers.join(", ")}`,
          },
          { status: 400 }
        );
      }

      const data = await getMultipleStockPrices(tickerList);

      return NextResponse.json(
        { success: true, data, timestamp: Date.now() },
        { headers: CACHE_HEADERS }
      );
    }

    // ticker, tickers 둘 다 없는 경우
    return NextResponse.json(
      {
        success: false,
        error:
          "ticker 또는 tickers 파라미터가 필요합니다. (예: ?ticker=005930 또는 ?tickers=005930,000660)",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[/api/stock/price] 에러:", error);

    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status: statusCode }
    );
  }
}
