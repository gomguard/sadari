"use client";

import { useMultipleStockPrices } from "@/hooks/useStockPrice";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

// 코스피/코스닥 대표 종목으로 시장 분위기 파악
// (지수 직접 조회는 실전 모드에서만 가능하므로 대표 종목 활용)
const MARKET_TICKERS = {
  "삼성전자": "005930",
  "SK하이닉스": "000660",
  "셀트리온": "068270",
};

export default function LiveMarketData() {
  const tickers = Object.values(MARKET_TICKERS);
  const { prices, loading, lastUpdated, refresh } = useMultipleStockPrices(
    tickers,
    { intervalMs: 60000 }
  );

  const stocks = Object.entries(MARKET_TICKERS).map(([name, ticker]) => {
    const data = prices[ticker];
    return {
      name,
      price: data ? data.price.toLocaleString("ko-KR") + "원" : "...",
      change: data ? `${data.changeRate >= 0 ? "+" : ""}${data.changeRate}%` : "",
      volume: data ? (data.tradingValue / 100000000).toFixed(0) + "억" : "...",
      up: data ? data.changeRate >= 0 : true,
    };
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">실시간 시세</h3>
        <div className="flex items-center gap-2">
          {loading && <RefreshCw className="h-3 w-3 animate-spin text-gray-300" />}
          {lastUpdated && (
            <span className="text-[10px] text-gray-300">
              {new Date(lastUpdated).toLocaleTimeString("ko-KR")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {stocks.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5"
          >
            <span className="text-sm font-semibold text-gray-800">{s.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900">{s.price}</span>
              {s.change && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    s.up ? "text-up" : "text-down"
                  }`}
                >
                  {s.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {s.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={refresh}
        className="mt-2 w-full rounded-lg py-1.5 text-center text-[11px] text-gray-400 hover:bg-gray-50 hover:text-gray-600"
      >
        새로고침
      </button>
    </div>
  );
}
