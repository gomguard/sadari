"use client";

import { useParams, useRouter } from "next/navigation";
import { useStockPrice } from "@/hooks/useStockPrice";
import { getStockName } from "@/lib/stock-codes";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
} from "lucide-react";

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

function formatVolume(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  return n.toLocaleString("ko-KR");
}

function formatMarketCap(n: number) {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}조`;
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(0)}억`;
  return formatPrice(n);
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;
  const stockName = getStockName(ticker) ?? ticker;

  const { data, price, change, changeRate, changeSign, loading, error, lastUpdated, refresh } =
    useStockPrice(ticker, { intervalMs: 15000 });

  const isUp = change !== null ? change >= 0 : true;
  const changeColor = isUp ? "text-up" : "text-down";
  const arrow = isUp ? "▲" : "▼";

  // Progress bar: where current price is between day's low and high
  const progressPct =
    data && data.high > data.low
      ? Math.max(0, Math.min(100, ((data.price - data.low) / (data.high - data.low)) * 100))
      : 50;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 pb-12">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{stockName}</h1>
          <span className="text-xs text-gray-400">{ticker}</span>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="새로고침"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Loading state */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-400" />
            <span className="text-sm text-gray-400">시세를 불러오는 중...</span>
          </div>
        )}

        {/* Error state */}
        {error && !data && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white py-16">
            <WifiOff className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">시세를 불러올 수 없습니다</p>
            <p className="text-xs text-gray-300">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Data loaded */}
        {data && (
          <>
            {/* Price hero card */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              {/* Current price */}
              <div className="flex items-end gap-3">
                <span className="text-3xl font-extrabold text-gray-900">
                  {formatPrice(data.price)}
                  <span className="text-lg font-semibold text-gray-300">원</span>
                </span>
                {isUp ? (
                  <TrendingUp className="mb-1 h-6 w-6 text-up" />
                ) : (
                  <TrendingDown className="mb-1 h-6 w-6 text-down" />
                )}
              </div>

              {/* Change */}
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-base font-bold ${changeColor}`}>
                  {arrow} {formatPrice(Math.abs(data.change))}원
                </span>
                <span className={`text-sm font-semibold ${changeColor}`}>
                  ({change! >= 0 ? "+" : ""}
                  {data.changeRate.toFixed(2)}%)
                </span>
              </div>

              {/* Timestamp */}
              <div className="mt-2 flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-gray-300">
                  {lastUpdated ? new Date(lastUpdated).toLocaleTimeString("ko-KR") : ""} 기준
                </span>
              </div>
            </div>

            {/* Day range progress bar */}
            <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium text-gray-500">오늘의 가격 범위</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-down">
                  {formatPrice(data.low)}
                </span>
                <div className="relative flex-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-down via-gray-400 to-up transition-all duration-700"
                      style={{ width: "100%" }}
                    />
                  </div>
                  {/* Indicator dot */}
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-800 shadow transition-all duration-700"
                    style={{ left: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-up">
                  {formatPrice(data.high)}
                </span>
              </div>
            </div>

            {/* Day stats grid */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard label="시가" value={`${formatPrice(data.open)}원`} />
              <StatCard label="거래량" value={formatVolume(data.volume)} />
              <StatCard label="고가" value={`${formatPrice(data.high)}원`} valueColor="text-up" />
              <StatCard label="저가" value={`${formatPrice(data.low)}원`} valueColor="text-down" />
            </div>

            {/* Fundamentals */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatCard label="PER" value={data.per ? `${data.per.toFixed(2)}배` : "-"} />
              <StatCard label="PBR" value={data.pbr ? `${data.pbr.toFixed(2)}배` : "-"} />
              <StatCard
                label="시가총액"
                value={data.marketCap ? formatMarketCap(data.marketCap) : "-"}
              />
            </div>

            {/* External links */}
            <div className="mt-6 flex flex-col gap-2">
              <a
                href={`https://m.stock.naver.com/domestic/stock/${ticker}/total`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
              >
                <ExternalLink className="h-4 w-4" />
                네이버 금융에서 보기
              </a>
              <a
                href={`https://securities.koreainvestment.com/main/stock/${ticker}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
              >
                <ExternalLink className="h-4 w-4" />
                한국투자증권에서 보기
              </a>
            </div>

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="mt-6 w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            >
              ← 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = "text-gray-900",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
