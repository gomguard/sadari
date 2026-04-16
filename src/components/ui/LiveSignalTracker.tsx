"use client";

import { useStockPrice } from "@/hooks/useStockPrice";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

export interface SignalInfo {
  id: string;
  stockName: string;
  ticker: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  status: "active" | "hit_target" | "hit_stoploss" | "holding";
  date: string;
  sector: string;
  memo?: string;
}

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

function pct(from: number, to: number) {
  return (((to - from) / from) * 100).toFixed(1);
}

const statusConfig = {
  active: { label: "진행중", icon: Clock, color: "bg-blue-100 text-blue-700" },
  hit_target: { label: "목표 달성", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  hit_stoploss: { label: "손절", icon: XCircle, color: "bg-red-100 text-red-700" },
  holding: { label: "홀딩", icon: TrendingUp, color: "bg-amber-100 text-amber-700" },
};

export default function LiveSignalTracker({ signal }: { signal: SignalInfo }) {
  const { price, change, changeRate, loading, error, lastUpdated, refresh } = useStockPrice(
    signal.ticker,
    { intervalMs: 60000 }
  );

  const hasLivePrice = price !== null && !error;
  const currentPrice = price ?? signal.entryPrice;
  const config = statusConfig[signal.status];
  const Icon = config.icon;
  const returnPct = hasLivePrice ? Number(pct(signal.entryPrice, currentPrice)) : null;
  const isUp = returnPct !== null ? returnPct >= 0 : true;

  const range = signal.targetPrice - signal.stopLoss;
  const progress = Math.max(
    0,
    Math.min(100, ((currentPrice - signal.stopLoss) / range) * 100)
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">
            {signal.stockName}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
            {signal.sector}
          </span>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.color}`}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      {/* 현재가 & 수익률 — 핵심 영역 */}
      <div className="px-4 py-2">
        {hasLivePrice ? (
          <>
            {/* 현재가 크게 */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(currentPrice)}
                <span className="text-base font-medium text-gray-400">원</span>
              </span>
              {change !== null && (
                <span className={`text-sm font-semibold ${changeRate! >= 0 ? "text-up" : "text-down"}`}>
                  {changeRate! >= 0 ? "▲" : "▼"} {Math.abs(change).toLocaleString()}
                  ({changeRate! >= 0 ? "+" : ""}{changeRate}%)
                </span>
              )}
            </div>
            {/* 진입 대비 수익률 */}
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-lg font-bold ${isUp ? "text-up" : "text-down"}`}>
                진입 대비 {returnPct! >= 0 ? "+" : ""}{returnPct}%
              </span>
              <span className="text-xs text-gray-400">
                ({formatPrice(signal.entryPrice)}원 →{" "}
                {formatPrice(currentPrice)}원)
              </span>
            </div>
            {/* 타임스탬프 */}
            <div className="mt-1 flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-gray-300">
                {lastUpdated
                  ? new Date(lastUpdated).toLocaleTimeString("ko-KR")
                  : ""}{" "}
                실시간
              </span>
              <button onClick={refresh} className="text-[10px] text-primary-400 hover:text-primary-600">
                새로고침
              </button>
            </div>
          </>
        ) : (
          /* API 연결 안 됨 */
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-gray-300" />
                <span className="text-sm text-gray-400">시세 불러오는 중...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-300" />
                <div>
                  <span className="text-sm text-gray-400">실시간 시세 연결 대기</span>
                  <p className="text-[10px] text-gray-300">
                    API 키 설정 후 활성화됩니다
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 프로그레스 바 */}
      <div className="px-4 pb-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
              isUp
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : "bg-gradient-to-r from-red-400 to-red-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>손절 {formatPrice(signal.stopLoss)}</span>
          <span>목표 {formatPrice(signal.targetPrice)}</span>
        </div>
      </div>

      {/* 하단 가격 정보 */}
      <div className="grid grid-cols-4 border-t border-gray-50 bg-gray-50/50">
        <div className="px-3 py-2.5 text-center">
          <p className="text-[10px] text-gray-400">진입가</p>
          <p className="text-xs font-semibold text-gray-700">
            {formatPrice(signal.entryPrice)}
          </p>
        </div>
        <div className="border-l border-gray-100 px-3 py-2.5 text-center">
          <p className="text-[10px] text-gray-400">목표가</p>
          <p className="text-xs font-semibold text-emerald-600">
            {formatPrice(signal.targetPrice)}
          </p>
          <p className="text-[9px] text-emerald-500">
            +{pct(signal.entryPrice, signal.targetPrice)}%
          </p>
        </div>
        <div className="border-l border-gray-100 px-3 py-2.5 text-center">
          <p className="text-[10px] text-gray-400">손절가</p>
          <p className="text-xs font-semibold text-red-500">
            {formatPrice(signal.stopLoss)}
          </p>
          <p className="text-[9px] text-red-400">
            {pct(signal.entryPrice, signal.stopLoss)}%
          </p>
        </div>
        <div className="border-l border-gray-100 px-3 py-2.5 text-center">
          <p className="text-[10px] text-gray-400">진입일</p>
          <p className="text-xs font-semibold text-gray-700">{signal.date}</p>
        </div>
      </div>

      {/* 메모 */}
      {signal.memo && (
        <div className="border-t border-gray-50 px-4 py-2.5">
          <p className="text-[12px] leading-relaxed text-gray-500">
            💬 {signal.memo}
          </p>
        </div>
      )}
    </div>
  );
}
