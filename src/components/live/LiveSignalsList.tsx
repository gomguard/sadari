"use client";

import { useSignals } from "@/lib/firestore-hooks";
import LiveSignalTracker from "@/components/ui/LiveSignalTracker";
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

function SignalSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-5 w-16 rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="px-4 py-2">
        <div className="h-8 w-40 rounded bg-gray-100" />
        <div className="mt-2 h-5 w-32 rounded bg-gray-100" />
      </div>
      <div className="px-4 pb-2">
        <div className="h-2 w-full rounded-full bg-gray-100" />
        <div className="mt-1 flex justify-between">
          <div className="h-3 w-16 rounded bg-gray-100" />
          <div className="h-3 w-16 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-gray-50 bg-gray-50/50 p-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mx-1 h-8 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default function LiveSignalsList() {
  const { data: signals, loading, error } = useSignals();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <SignalSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-400">
          아직 등록된 시그널이 없습니다. 어드민에서 추가해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {signals.map((signal) => (
        <LiveSignalTracker key={signal.id} signal={toSignalInfo(signal)} />
      ))}
    </div>
  );
}
