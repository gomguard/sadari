import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle } from "lucide-react";

export interface TrackedSignal {
  id: string;
  stockName: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  currentPrice: number;
  status: "active" | "hit_target" | "hit_stoploss" | "holding";
  date: string;
  sector: string;
}

function pct(from: number, to: number) {
  return (((to - from) / from) * 100).toFixed(1);
}

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

const statusConfig = {
  active: { label: "진행중", icon: Clock, color: "bg-blue-100 text-blue-700" },
  hit_target: {
    label: "목표 달성",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700",
  },
  hit_stoploss: {
    label: "손절",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
  holding: {
    label: "홀딩",
    icon: TrendingUp,
    color: "bg-amber-100 text-amber-700",
  },
};

export default function SignalTracker({
  signal,
}: {
  signal: TrackedSignal;
}) {
  const config = statusConfig[signal.status];
  const Icon = config.icon;
  const returnPct = Number(pct(signal.entryPrice, signal.currentPrice));
  const isUp = returnPct >= 0;

  // 진입가 → 목표가 사이에서 현재가의 진행률
  const range = signal.targetPrice - signal.stopLoss;
  const progress = Math.max(
    0,
    Math.min(100, ((signal.currentPrice - signal.stopLoss) / range) * 100)
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

      {/* 수익률 메인 */}
      <div className="px-4 py-2">
        <div className="flex items-end gap-2">
          <span
            className={`text-2xl font-bold ${
              isUp ? "text-up" : "text-down"
            }`}
          >
            {isUp ? "+" : ""}
            {returnPct}%
          </span>
          <span className="pb-0.5 text-sm text-gray-400">
            {formatPrice(signal.currentPrice)}원
          </span>
        </div>
      </div>

      {/* 프로그레스 바 (손절 → 현재 → 목표) */}
      <div className="px-4 pb-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all ${
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
          <p className="text-[10px] text-gray-400">현재 수익</p>
          <p
            className={`text-xs font-semibold ${
              isUp ? "text-up" : "text-down"
            }`}
          >
            {isUp ? "+" : ""}
            {returnPct}%
          </p>
        </div>
      </div>
    </div>
  );
}
