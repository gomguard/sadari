import { BarChart3, Filter, CheckCircle2, XCircle, Clock } from "lucide-react";
import LiveSignalTracker, {
  SignalInfo,
} from "@/components/ui/LiveSignalTracker";
import PerformanceSummary, {
  Performance,
} from "@/components/ui/PerformanceSummary";

// --- 샘플 데이터 ---

const performance: Performance = {
  totalSignals: 24,
  hitRate: 79,
  avgReturn: 12.4,
  bestReturn: 23.5,
  bestStock: "현대로템",
  period: "2025년 1월 ~ 현재",
};

const signals: SignalInfo[] = [
  {
    id: "1",
    stockName: "대봉엘에스",
    ticker: "078140",
    entryPrice: 13400,
    targetPrice: 15000,
    stopLoss: 12500,
    status: "active",
    date: "01.07",
    sector: "바이오",
    memo: "비만치료제 관련, 차트 자리 좋음",
  },
  {
    id: "2",
    stockName: "본느",
    ticker: "417790",
    entryPrice: 1315,
    targetPrice: 1600,
    stopLoss: 1250,
    status: "active",
    date: "01.06",
    sector: "화장품",
    memo: "마녀공장 M&A 낙수효과, 1,315 손절",
  },
  {
    id: "3",
    stockName: "현대로템",
    ticker: "064350",
    entryPrice: 45000,
    targetPrice: 54000,
    stopLoss: 42000,
    status: "hit_target",
    date: "01.03",
    sector: "방산",
    memo: "20% 수익 마감",
  },
  {
    id: "4",
    stockName: "코오롱 모빌리티",
    ticker: "002020",
    entryPrice: 2475,
    targetPrice: 3000,
    stopLoss: 2400,
    status: "holding",
    date: "01.03",
    sector: "정치테마",
    memo: "우원식 관련주, 2,475 손절",
  },
  {
    id: "5",
    stockName: "유한양행",
    ticker: "000100",
    entryPrice: 85000,
    targetPrice: 100000,
    stopLoss: 80000,
    status: "active",
    date: "01.03",
    sector: "바이오",
    memo: "불확실성 해소, 분할매수 추천",
  },
  {
    id: "6",
    stockName: "LS ELECTRIC",
    ticker: "010120",
    entryPrice: 161500,
    targetPrice: 185000,
    stopLoss: 155000,
    status: "holding",
    date: "01.02",
    sector: "변압기",
    memo: "변압기 섹터, 초보자 상승 후 진입 비추",
  },
  {
    id: "7",
    stockName: "한미약품",
    ticker: "128940",
    entryPrice: 320000,
    targetPrice: 370000,
    stopLoss: 305000,
    status: "active",
    date: "01.02",
    sector: "바이오",
    memo: "바이오 중 흑자 종목",
  },
];

const statusFilters = [
  { key: "all", label: "전체", count: signals.length },
  {
    key: "active",
    label: "진행중",
    icon: Clock,
    count: signals.filter((s) => s.status === "active").length,
  },
  {
    key: "hit_target",
    label: "목표달성",
    icon: CheckCircle2,
    count: signals.filter((s) => s.status === "hit_target").length,
  },
  {
    key: "holding",
    label: "홀딩",
    count: signals.filter((s) => s.status === "holding").length,
  },
  {
    key: "hit_stoploss",
    label: "손절",
    icon: XCircle,
    count: signals.filter((s) => s.status === "hit_stoploss").length,
  },
];

export default function SignalsPage() {
  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">종목 시그널</h1>
            <p className="mt-0.5 text-xs text-gray-400">
              추천 · 추적 · 성과까지 투명하게
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </header>

      {/* 성과 요약 */}
      <section className="px-5 py-3">
        <PerformanceSummary perf={performance} />
      </section>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto px-5 py-2 scrollbar-hide">
        {statusFilters.map((f, i) => (
          <button
            key={f.key}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              i === 0
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                i === 0 ? "bg-white/20" : "bg-gray-200"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* 투자 유의사항 */}
      <div className="mx-5 mt-2 rounded-xl bg-amber-50 p-3.5">
        <p className="text-xs leading-relaxed text-amber-700">
          <span className="font-semibold">투자의 책임은 본인에게 있습니다.</span>{" "}
          못해도 10% 이상 수익이 나는 종목들로만 접근합니다. 손절이 필수인 종목은
          별도 안내드립니다.
        </p>
      </div>

      {/* Signal Tracker Cards — 실시간 API 연동 */}
      <div className="mx-5 mt-2 flex items-center gap-1.5 text-[10px] text-gray-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        실시간 시세 · 1분마다 갱신
      </div>
      <div className="space-y-3 px-5 py-4">
        {signals.map((signal) => (
          <LiveSignalTracker key={signal.id} signal={signal} />
        ))}
      </div>

      {/* 운영 원칙 */}
      <div className="mx-5 mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
            <BarChart3 className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">2025 운영 원칙</h3>
        </div>
        <ul className="mt-3 space-y-2">
          {[
            { num: "1", text: "1년 장투종목 1개 설정 (국정 안정 후 판단)" },
            { num: "2", text: "기술적 타점 접근 — 손절 필수" },
            { num: "3", text: "강력한 테마주 접근 — 손절 필수" },
            { num: "4", text: "거시적 환경 수혜 실적 종목 (조선, 바이오)" },
            { num: "5", text: "장기채권으로 포트 방어 (미 10년물)" },
            { num: "6", text: "투자조합으로 IPO 투자 (하반기)" },
          ].map((rule) => (
            <li key={rule.num} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-700">
                {rule.num}
              </span>
              <span className="text-[13px] leading-relaxed text-gray-600">
                {rule.text}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-lg bg-gray-50 p-2.5 text-center text-[11px] font-medium text-gray-500">
          &ldquo;엄청 대단한걸 하지 않습니다. 다년간 올바른걸 반복할 뿐입니다.&rdquo;
        </p>
      </div>
    </main>
  );
}
