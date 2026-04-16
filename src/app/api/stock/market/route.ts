/**
 * 시장 개요 조회 API 라우트
 *
 * GET /api/stock/market
 *
 * 응답:
 * {
 *   success: boolean,
 *   data: {
 *     kospi: MarketIndex,    // 코스피 지수
 *     kosdaq: MarketIndex,   // 코스닥 지수
 *     tradingValue: { ... }, // 거래대금 정보
 *     status: MarketStatus,  // 시장 상태
 *   },
 *   timestamp: number
 * }
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import {
  getMarketOverview,
  getTotalTradingValue,
  getMarketStatus,
} from "@/lib/kis";

/** 응답 캐시 헤더 (10초 캐시) */
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
};

export async function GET() {
  try {
    // 시장 개요 및 거래대금 조회
    const overview = await getMarketOverview();
    const tradingValue = await getTotalTradingValue();
    const status = getMarketStatus();

    return NextResponse.json(
      {
        success: true,
        data: {
          kospi: overview.kospi,
          kosdaq: overview.kosdaq,
          tradingValue: {
            kospi: tradingValue.kospiTradingValue,
            kosdaq: tradingValue.kosdaqTradingValue,
            total: tradingValue.totalTradingValue,
          },
          status,
        },
        timestamp: Date.now(),
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("[/api/stock/market] 에러:", error);

    const message =
      error instanceof Error ? error.message : "시장 데이터 조회 중 오류가 발생했습니다.";
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
