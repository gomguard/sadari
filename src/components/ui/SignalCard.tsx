import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface Signal {
  id: string;
  stockName: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  sector: string;
  date: string;
  memo?: string;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function calcPercent(from: number, to: number) {
  return (((to - from) / from) * 100).toFixed(1);
}

export default function SignalCard({ signal }: { signal: Signal }) {
  const upside = calcPercent(signal.entryPrice, signal.targetPrice);
  const downside = calcPercent(signal.entryPrice, signal.stopLoss);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">
            {signal.stockName}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {signal.sector}
          </span>
        </div>
        <span className="text-xs text-gray-400">{signal.date}</span>
      </div>

      {/* Price Grid */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-2.5 text-center">
          <p className="text-[11px] text-gray-400">진입가</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-800">
            {formatPrice(signal.entryPrice)}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 p-2.5 text-center">
          <p className="flex items-center justify-center gap-0.5 text-[11px] text-up">
            <TrendingUp className="h-3 w-3" />
            목표가
          </p>
          <p className="mt-0.5 text-sm font-semibold text-up">
            {formatPrice(signal.targetPrice)}
          </p>
          <p className="text-[10px] text-up">+{upside}%</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2.5 text-center">
          <p className="flex items-center justify-center gap-0.5 text-[11px] text-down">
            <TrendingDown className="h-3 w-3" />
            손절가
          </p>
          <p className="mt-0.5 text-sm font-semibold text-down">
            {formatPrice(signal.stopLoss)}
          </p>
          <p className="text-[10px] text-down">{downside}%</p>
        </div>
      </div>

      {/* Memo */}
      {signal.memo && (
        <p className="mt-3 flex items-start gap-1 rounded-lg bg-primary-50 p-2.5 text-xs leading-relaxed text-primary-700">
          <Minus className="mt-0.5 h-3 w-3 flex-shrink-0" />
          {signal.memo}
        </p>
      )}
    </div>
  );
}
