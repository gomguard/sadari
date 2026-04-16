/**
 * 과거 종가 조회 API
 * GET /api/stock/history?ticker=005930&date=20250102
 */

import { NextRequest, NextResponse } from "next/server";
import { getClosingPrice } from "@/lib/kis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const date = searchParams.get("date");

  if (!ticker || !date) {
    return NextResponse.json(
      { success: false, error: "ticker와 date 파라미터가 필요합니다" },
      { status: 400 }
    );
  }

  try {
    // 디버깅: getDailyPrices 직접 호출
    const { getDailyPrices } = await import("@/lib/kis");
    const prices = await getDailyPrices(ticker, date, date);
    const closingPrice = prices.length > 0 ? prices[0].close : null;

    return NextResponse.json({
      success: true,
      data: { ticker, date, closingPrice, rawCount: prices.length, prices },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "조회 실패",
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
