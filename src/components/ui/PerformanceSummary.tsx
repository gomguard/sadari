import { Trophy, Target, TrendingUp, BarChart3 } from "lucide-react";

export interface Performance {
  totalSignals: number;
  hitRate: number;
  avgReturn: number;
  bestReturn: number;
  bestStock: string;
  period: string;
}

export default function PerformanceSummary({
  perf,
}: {
  perf: Performance;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 text-white">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Trophy className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold">시그널 성과</h3>
          <p className="text-[11px] text-gray-400">{perf.period}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[11px] text-gray-400">총 시그널</span>
          </div>
          <p className="mt-1 text-xl font-bold">{perf.totalSignals}건</p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] text-gray-400">적중률</span>
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-400">
            {perf.hitRate}%
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] text-gray-400">평균 수익률</span>
          </div>
          <p className="mt-1 text-xl font-bold text-amber-400">
            +{perf.avgReturn}%
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-[11px] text-gray-400">최고 수익</span>
          </div>
          <p className="mt-1 text-lg font-bold text-rose-400">
            +{perf.bestReturn}%
          </p>
          <p className="text-[10px] text-gray-500">{perf.bestStock}</p>
        </div>
      </div>

      {/* 투명성 메시지 */}
      <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-center text-[11px] leading-relaxed text-gray-400">
        모든 시그널의 성과를 투명하게 공개합니다.
        <br />
        손절 포함, 있는 그대로.
      </p>
    </div>
  );
}
