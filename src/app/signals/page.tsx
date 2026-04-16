import { BarChart3, Filter } from "lucide-react";
import SignalCard, { Signal } from "@/components/ui/SignalCard";

// --- 샘플 데이터 (추후 Firestore 연동) ---

const signals: Signal[] = [
  {
    id: "1",
    stockName: "대봉엘에스",
    entryPrice: 13400,
    targetPrice: 15000,
    stopLoss: 12500,
    sector: "바이오",
    date: "2025.01.07",
    memo: "비만치료제 관련주. 차트 자리가 좋습니다.",
  },
  {
    id: "2",
    stockName: "본느",
    entryPrice: 1315,
    targetPrice: 1600,
    stopLoss: 1250,
    sector: "화장품",
    date: "2025.01.06",
    memo: "마녀공장 M&A 이슈 낙수 효과. 1,315 손절잡고 거래",
  },
  {
    id: "3",
    stockName: "코오롱 모빌리티그룹",
    entryPrice: 2475,
    targetPrice: 3000,
    stopLoss: 2400,
    sector: "정치테마",
    date: "2025.01.03",
    memo: "우원식 관련주. 2,475 손절잡고 기술적 반등 노리기",
  },
  {
    id: "4",
    stockName: "유한양행",
    entryPrice: 85000,
    targetPrice: 100000,
    stopLoss: 80000,
    sector: "바이오",
    date: "2025.01.03",
    memo: "윤대통령 체포로 불확실성 해소. 분할매수 추천",
  },
  {
    id: "5",
    stockName: "LS ELECTRIC",
    entryPrice: 161500,
    targetPrice: 185000,
    stopLoss: 155000,
    sector: "변압기",
    date: "2025.01.02",
    memo: "변압기 섹터. 초보자분들은 상승 후 진입 비추",
  },
  {
    id: "6",
    stockName: "한미약품",
    entryPrice: 320000,
    targetPrice: 370000,
    stopLoss: 305000,
    sector: "바이오",
    date: "2025.01.02",
    memo: "시장에 마땅히 큰돈으로 사고 싶은 종목은 없지만 한미약품은 매수",
  },
];

const sectors = ["전체", "바이오", "반도체", "화장품", "변압기", "정치테마"];

export default function SignalsPage() {
  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">종목 시그널</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              추천 종목 · 진입가 · 목표가 · 손절가
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </header>

      {/* Sector filter */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
        {sectors.map((sector, i) => (
          <button
            key={sector}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              i === 0
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* 투자 유의사항 */}
      <div className="mx-5 rounded-xl bg-amber-50 p-3.5">
        <p className="text-xs leading-relaxed text-amber-700">
          <span className="font-semibold">투자의 책임은 본인에게 있습니다.</span>{" "}
          방에서 책임져드리지 않습니다. 되도록이면 손절 안하고 익절할 종목들만
          말씀드리려 합니다.
        </p>
      </div>

      {/* Signal Cards */}
      <div className="space-y-3 px-5 py-4">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>

      {/* Summary */}
      <div className="mx-5 mb-4 rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-bold text-gray-900">운영 원칙</h3>
        </div>
        <ul className="mt-2 space-y-1.5">
          {[
            "1년 장투종목 1개 설정",
            "기술적 타점 접근 (손절 필수)",
            "강력한 테마주 접근 (손절 필수)",
            "거시적 환경 수혜 실적 종목",
            "장기채권으로 포트 방어",
            "투자조합으로 IPO 투자 (하반기)",
          ].map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-2 text-[13px] text-gray-600"
            >
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary-400" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
