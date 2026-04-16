"use client";

import { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  BarChart3,
} from "lucide-react";
import {
  historicalSignals as rawSignals,
  type HistoricalSignal,
} from "@/data/signals-history";

// 보유일수 계산 헬퍼
function calcHoldingDays(entry: string, exit: string | null): number {
  if (!exit) return 0;
  const d1 = new Date(entry);
  const d2 = new Date(exit);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// 결과가 확정된 시그널만 필터 (profit 또는 loss)
const historicalSignals = rawSignals
  .filter((s) => s.result === "profit" || s.result === "loss")
  .map((s) => ({
    ...s,
    returnPct: s.returnPct ?? 0,
    exitDate: s.exitDate ?? s.date,
    holdingDays: calcHoldingDays(s.date, s.exitDate),
  }));

// 통계 계산
const totalSignals = historicalSignals.length;
const profits = historicalSignals.filter((s) => s.result === "profit");
const losses = historicalSignals.filter((s) => s.result === "loss");
const withReturn = historicalSignals.filter((s) => s.returnPct !== 0);
const hitRate = ((profits.length / totalSignals) * 100).toFixed(1);
const avgReturn =
  withReturn.length > 0
    ? (
        withReturn.reduce((sum, s) => sum + s.returnPct, 0) / withReturn.length
      ).toFixed(1)
    : "0";
const avgHoldingDays = Math.round(
  historicalSignals.reduce((sum, s) => sum + s.holdingDays, 0) / totalSignals
);
const bestSignal = historicalSignals.reduce((best, s) =>
  s.returnPct > best.returnPct ? s : best
);
const totalReturn = withReturn.reduce((sum, s) => sum + s.returnPct, 0);

type FilterType = "all" | "profit" | "loss";

export default function SignalHistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<"date" | "return">("date");

  const filtered = historicalSignals
    .filter((s) => filter === "all" || s.result === filter)
    .sort((a, b) =>
      sortBy === "date"
        ? b.date.localeCompare(a.date)
        : b.returnPct - a.returnPct
    );

  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-xl font-bold text-gray-900">시그널 히스토리</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          과거 추천 종목의 실제 성과를 투명하게 공개합니다
        </p>
      </header>

      {/* 성과 대시보드 */}
      <section className="px-5 py-3">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 text-white">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold">전체 성과 요약</h2>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            2025.01 ~ 현재 사다리 추천 기록 기반
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">총 시그널</p>
              <p className="mt-1 text-2xl font-bold">{totalSignals}건</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">적중률</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {hitRate}%
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">평균 수익률</p>
              <p className="mt-1 text-2xl font-bold text-amber-400">
                +{avgReturn}%
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">평균 보유일</p>
              <p className="mt-1 text-2xl font-bold">{avgHoldingDays}일</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <p className="text-[11px] text-emerald-300">최고 수익</p>
              <p className="text-lg font-bold text-emerald-400">
                +{bestSignal.returnPct}%
              </p>
              <p className="text-[10px] text-gray-400">
                {bestSignal.stockName}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">누적 수익률 합계</p>
              <p className="text-lg font-bold text-amber-400">
                +{totalReturn}%
              </p>
              <p className="text-[10px] text-gray-400">{totalSignals}건 합산</p>
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-center text-[11px] text-gray-400">
            손절 포함, 있는 그대로. 사다리 원문 기반.
          </p>
        </div>
      </section>

      {/* 필터 */}
      <div className="flex items-center justify-between px-5 py-2">
        <div className="flex gap-2">
          {([
            { key: "all" as FilterType, label: "전체", count: totalSignals },
            { key: "profit" as FilterType, label: "수익", count: profits.length },
            { key: "loss" as FilterType, label: "손실", count: losses.length },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 text-[10px] ${
                filter === f.key ? "bg-white/20" : "bg-gray-200"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortBy(sortBy === "date" ? "return" : "date")}
          className="flex items-center gap-1 text-[11px] text-gray-400"
        >
          <Filter className="h-3 w-3" />
          {sortBy === "date" ? "날짜순" : "수익순"}
        </button>
      </div>

      {/* 시그널 리스트 */}
      <div className="space-y-2 px-5 py-2">
        {filtered.map((signal) => (
          <div
            key={signal.id}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {signal.stockName}
                </span>
                {signal.result === "profit" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : signal.result === "loss" ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
              </div>
              {signal.returnPct !== 0 && (
                <span
                  className={`text-lg font-bold ${
                    signal.returnPct >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {signal.returnPct >= 0 ? "+" : ""}
                  {signal.returnPct}%
                </span>
              )}
            </div>

            {/* 타임라인 */}
            <div className="flex items-center gap-2 px-4 py-1.5">
              <div className="flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5">
                <ArrowUpRight className="h-3 w-3 text-primary-500" />
                <span className="text-[11px] text-gray-600">{signal.date}</span>
              </div>
              <span className="text-[10px] text-gray-300">&rarr;</span>
              <div className="flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5">
                {signal.result === "profit" ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className="text-[11px] text-gray-600">
                  {signal.exitDate}
                </span>
              </div>
              {signal.holdingDays > 0 && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {signal.holdingDays}일
                </span>
              )}
            </div>

            {/* 메모 */}
            <div className="border-t border-gray-50 px-4 py-2.5">
              <p className="text-[12px] leading-relaxed text-gray-500">
                {signal.memo}
              </p>
              {signal.exitMemo && (
                <p
                  className={`mt-1 text-[12px] font-medium leading-relaxed ${
                    signal.result === "profit"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  &rarr; {signal.exitMemo}
                </p>
              )}
            </div>

            {/* 진입가/손절가 */}
            {(signal.entryPrice || signal.stopLoss) && (
              <div className="flex gap-2 border-t border-gray-50 bg-gray-50/50 px-4 py-2">
                {signal.entryPrice && (
                  <span className="text-[11px] text-gray-500">
                    진입가 {signal.entryPrice.toLocaleString()}원
                  </span>
                )}
                {signal.stopLoss && (
                  <span className="text-[11px] text-gray-500">
                    손절가 {signal.stopLoss.toLocaleString()}원
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 면책 */}
      <div className="mx-5 my-4 rounded-xl bg-amber-50 p-3.5">
        <p className="text-xs leading-relaxed text-amber-700">
          <span className="font-semibold">면책사항:</span> 위 데이터는 사다리
          추천 기록에서 추출한 것으로, 실제 수익률은 진입/청산 시점에 따라 달라질
          수 있습니다. 투자의 책임은 본인에게 있습니다.
        </p>
      </div>
    </main>
  );
}
