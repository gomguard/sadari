"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useLatestDaily } from "@/lib/firestore-hooks";
import { useSignals } from "@/lib/firestore-hooks";
import HaseulInsight from "@/components/ui/HaseulInsight";
import TodayAction from "@/components/ui/TodayAction";
import LiveSignalTracker from "@/components/ui/LiveSignalTracker";
import type { Insight } from "@/components/ui/HaseulInsight";
import type { SignalInfo } from "@/components/ui/LiveSignalTracker";
import type { FirestoreSignal } from "@/lib/firestore";

/** Firestore 시그널 → UI SignalInfo 변환 */
function toSignalInfo(s: FirestoreSignal): SignalInfo {
  return {
    id: s.id ?? "",
    stockName: s.stockName,
    ticker: s.ticker,
    entryPrice: s.entryPrice,
    targetPrice: s.targetPrice,
    stopLoss: s.stopLoss,
    status: s.status,
    date: s.date,
    sector: s.sector,
    memo: s.memo,
  };
}

// ---- Skeleton components ----

function InsightSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="space-y-1">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-2 w-16 rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-4/5 rounded bg-gray-200" />
      </div>
    </div>
  );
}

function ActionSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gray-200" />
        <div className="h-4 w-28 rounded bg-gray-200" />
      </div>
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-full rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

function MacroSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-gray-700" />
        <div className="h-3 w-24 rounded bg-gray-700" />
      </div>
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-full rounded bg-gray-700" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-700/50" />
        ))}
      </div>
    </div>
  );
}

function SignalSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="px-4 pt-4 pb-2">
        <div className="h-5 w-32 rounded bg-gray-200" />
      </div>
      <div className="px-4 py-2">
        <div className="h-8 w-40 rounded bg-gray-100" />
      </div>
      <div className="px-4 pb-2">
        <div className="h-2 w-full rounded-full bg-gray-100" />
      </div>
      <div className="grid grid-cols-4 border-t border-gray-50 bg-gray-50/50 p-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 rounded bg-gray-100 mx-1" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-sm text-gray-400">
        아직 등록된 데이터가 없습니다. 어드민에서 추가해주세요.
      </p>
    </div>
  );
}

// ---- Main Component ----

export default function LiveHomeSections() {
  const {
    data: daily,
    loading: dailyLoading,
    error: dailyError,
  } = useLatestDaily();

  const {
    data: signals,
    loading: signalsLoading,
    error: signalsError,
  } = useSignals({ status: "active", limit: 3 });

  const isLoading = dailyLoading || signalsLoading;

  // Build insight from daily
  const insight: Insight | null = daily
    ? {
        id: daily.id ?? "daily",
        content: daily.haseulComment,
        date: daily.date,
        mood: daily.mood,
      }
    : null;

  return (
    <>
      {/* 하슬님의 한마디 */}
      <section className="px-5 py-3">
        {isLoading ? (
          <InsightSkeleton />
        ) : insight ? (
          <HaseulInsight insight={insight} />
        ) : (
          <EmptyState />
        )}
      </section>

      {/* 오늘의 액션 가이드 */}
      <section className="px-5 py-3">
        {isLoading ? (
          <ActionSkeleton />
        ) : daily && daily.actions.length > 0 ? (
          <TodayAction actions={daily.actions} />
        ) : !daily ? (
          <EmptyState />
        ) : null}
      </section>

      {/* 매크로 데일리 */}
      <section className="px-5 py-3">
        {isLoading ? (
          <MacroSkeleton />
        ) : daily ? (
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-gray-400">
                매크로 데일리
              </h2>
              <span className="text-[11px] text-gray-500">{daily.date}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {daily.summary.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-200"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            {daily.indicators.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {daily.indicators.map((ind) => (
                  <div
                    key={ind.label}
                    className="rounded-lg bg-white/10 px-2.5 py-2 text-center"
                  >
                    <p className="text-[10px] text-gray-400">{ind.label}</p>
                    <p className="mt-0.5 flex items-center justify-center gap-0.5 text-sm font-semibold">
                      {ind.up ? (
                        <ArrowUpRight className="h-3 w-3 text-red-400" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-blue-400" />
                      )}
                      {ind.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* 시그널 트래커 (홈 — 최대 3개) */}
      <section className="px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-gray-900">시그널 트래커</h2>
          </div>
        </div>
        <p className="mt-1 text-[10px] text-gray-400">1분마다 실시간 갱신</p>
        <div className="mt-2 space-y-3">
          {isLoading ? (
            <>
              <SignalSkeleton />
              <SignalSkeleton />
            </>
          ) : signals.length > 0 ? (
            signals.map((s) => (
              <LiveSignalTracker key={s.id} signal={toSignalInfo(s)} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </>
  );
}
