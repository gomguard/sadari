"use client";

import { useStockPrice } from "@/hooks/useStockPrice";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

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
  const { price, changeRate, loading, lastUpdated, refresh } = useStockPrice(
    signal.ticker,
    { intervalMs: 60000 } // 1분마다 갱신
  );

  const currentPrice = price ?? signal.entryPrice;
  const config = statusConfig[signal.status];
  const Icon = config.icon;
  const returnPct = Number(pct(signal.entryPrice, currentPrice));
  const isUp = returnPct >= 0;

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
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.color}`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        </div>
      </div>

      {/* 실시간 현재가 */}
      <div className="px-4 py-2">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-2">
            <span
              className={`text-2xl font-bold ${isUp ? "text-up" : "text-down"}`}
            >
              {isUp ? "+" : ""}
              {returnPct}%
            </span>
            <span className="pb-0.5 text-sm text-gray-400">
              {formatPrice(currentPrice)}원
            </span>
            {loading && (
              <RefreshCw className="mb-1 h-3 w-3 animate-spin text-gray-300" />
            )}
          </div>
          {changeRate !== null && (
            <div className="flex items-center gap-1 pb-0.5">
              <span className={`text-xs font-medium ${changeRate >= 0 ? "text-up" : "text-down"}`}>
                오늘 {changeRate >= 0 ? "+" : ""}{changeRate}%
              </span>
            </div>
          )}
        </div>
        {lastUpdated && (
          <p className="mt-0.5 text-[10px] text-gray-300">
            {new Date(lastUpdated).toLocaleTimeString("ko-KR")} 기준
            <button onClick={refresh} className="ml-1 text-primary-400 hover:text-primary-600">
              새로고침
            </button>
          </p>
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

      {/* 하단 정보 */}
      <div className="flex border-t border-gray-50 bg-gray-50/50">
        <div className="flex-1 px-4 py-2.5 text-center">
          <p className="text-[10px] text-gray-400">진입가</p>
          <p className="text-xs font-semibold text-gray-700">
            {formatPrice(signal.entryPrice)}
          </p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 px-4 py-2.5 text-center">
          <p className="text-[10px] text-gray-400">진입일</p>
          <p className="text-xs font-semibold text-gray-700">{signal.date}</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 px-4 py-2.5 text-center">
          <p className="text-[10px] text-gray-400">실시간 수익</p>
          <p className={`text-xs font-semibold ${isUp ? "text-up" : "text-down"}`}>
            {isUp ? "+" : ""}
            {returnPct}%
          </p>
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
