import Link from "next/link";
import {
  TrendingUp,
  Newspaper,
  BookOpen,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Bell,
} from "lucide-react";
import LiveSignalTracker, {
  SignalInfo,
} from "@/components/ui/LiveSignalTracker";
import LiveMarketData from "@/components/ui/LiveMarketData";
import HaseulInsight from "@/components/ui/HaseulInsight";
import SectorHeatmap, { SectorData } from "@/components/ui/SectorHeatmap";
import TodayAction, { ActionItem } from "@/components/ui/TodayAction";
import PerformanceSummary, {
  Performance,
} from "@/components/ui/PerformanceSummary";

// --- 샘플 데이터 (추후 Firestore 연동) ---

const haseulInsight = {
  id: "1",
  content:
    "코스피·코스닥 중장기 하락추세를 깨고 상승추세로 전환합니다. 1분기 내내 장이 우상향할 가능성이 농후합니다. 급하게 사지 마시고 저평가된 종목들 중에 순환매가 이어질 가능성이 높으니 상승 후 눌림에 종목들을 공략하세요.",
  date: "01.06",
  mood: "bullish" as const,
};

const todayActions: ActionItem[] = [
  {
    type: "buy",
    content: "대봉엘에스 — 비만치료제 관련, 차트 자리 좋음. 손절 13,400",
  },
  {
    type: "watch",
    content: "반도체 섹터 — CES 2025 기대감으로 흐름 양호, 눌림 대기",
  },
  {
    type: "caution",
    content:
      "로봇 섹터 — 실적 찍히기 전까진 조심. 적자 회사 다수",
  },
  {
    type: "target",
    content: "유한양행, 한미약품 — 바이오 중 흑자 종목, 분할매수 검토",
  },
];

const performance: Performance = {
  totalSignals: 38,
  hitRate: 94.7,
  avgReturn: 12.5,
  bestReturn: 24,
  bestStock: "동서",
  period: "2025년 1월 ~ 현재",
};

const sectorData: SectorData[] = [
  { name: "반도체", status: "hot", change: "+2.8%", note: "CES 기대감, 삼전 양봉" },
  { name: "바이오", status: "warm", change: "+1.2%", note: "JP모건 컨퍼런스 수혜" },
  { name: "화장품", status: "warm", change: "+1.5%", note: "M&A 낙수효과" },
  { name: "조선", status: "neutral", change: "-0.3%", note: "차트 고점, 쉬어가는 중" },
  { name: "로봇", status: "cool", change: "+0.5%", note: "적자 기업 다수, 주의" },
  { name: "2차전지", status: "cold", change: "-1.8%", note: "적자 지속, 비추" },
];

const latestSignals: SignalInfo[] = [
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
    stockName: "현대로템",
    ticker: "064350",
    entryPrice: 45000,
    targetPrice: 54000,
    stopLoss: 42000,
    status: "hit_target",
    date: "01.03",
    sector: "방산",
  },
];

const dailyMacro = {
  date: "2025년 1월 7일",
  summary: [
    "트럼프가 관세를 핵심 수입품에만 부과할 것이라는 WP 보도 부인",
    "MSFT AI 데이터센터 투자 발표 → 엔비디아·TSMC 신고가",
    "필수소비재↓ 리튬 관련주↑ 경기 베팅 증가",
  ],
  indicators: [
    { label: "K200 야간선물", value: "+1.07%", up: true },
    { label: "NDF 환율", value: "1,461원", up: false },
    { label: "코스피 거래대금", value: "8.1조", up: true },
  ],
};

export default function HomePage() {
  return (
    <main>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            사다리
          </h1>
          <p className="mt-0.5 text-xs text-gray-400">
            엄청 대단한걸 하지 않습니다. 올바른걸 반복할 뿐.
          </p>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </header>

      {/* 멤버 카운트 */}
      <div className="px-5 py-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users className="h-3.5 w-3.5" />
          <span>
            사다리 2기 멤버{" "}
            <span className="font-semibold text-gray-600">105명</span> 함께하는 중
          </span>
          <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* 하슬님의 한마디 — 사다리 핵심 차별화 */}
      <section className="px-5 py-3">
        <HaseulInsight insight={haseulInsight} />
      </section>

      {/* 오늘의 액션 가이드 — 증권사 앱에 없는 것 */}
      <section className="px-5 py-3">
        <TodayAction actions={todayActions} />
      </section>

      {/* 매크로 데일리 */}
      <section className="px-5 py-3">
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-gray-400">
              매크로 데일리
            </h2>
            <span className="text-[11px] text-gray-500">
              {dailyMacro.date}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {dailyMacro.summary.map((item, i) => (
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
          <div className="mt-4 grid grid-cols-3 gap-2">
            {dailyMacro.indicators.map((ind) => (
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
        </div>
      </section>

      {/* 실시간 시세 — API 연동 */}
      <section className="px-5 py-3">
        <LiveMarketData />
      </section>

      {/* 섹터 온도계 — 증권사 앱에 없는 직관적 시각화 */}
      <section className="px-5 py-3">
        <SectorHeatmap sectors={sectorData} />
      </section>

      {/* 시그널 성과 — 투명한 적중률 공개 */}
      <section className="px-5 py-3">
        <PerformanceSummary perf={performance} />
      </section>

      {/* 실시간 시그널 트래커 — API 연동 */}
      <section className="px-5 py-3">
        <SectionHeader title="시그널 트래커" href="/signals" icon={BarChart3} />
        <p className="mt-1 text-[10px] text-gray-400">1분마다 실시간 갱신</p>
        <div className="mt-2 space-y-3">
          {latestSignals.map((s) => (
            <LiveSignalTracker key={s.id} signal={s} />
          ))}
        </div>
      </section>

      {/* 퀵 링크 */}
      <section className="px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          <QuickLink
            href="/feed"
            icon={Newspaper}
            label="정보 피드"
            desc="시장 이슈 & 스케줄"
            color="from-blue-500 to-blue-600"
          />
          <QuickLink
            href="/webzine"
            icon={BookOpen}
            label="차트 수업"
            desc="기술적 분석 교육"
            color="from-violet-500 to-violet-600"
          />
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-primary-600" />
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600"
      >
        더보기
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  desc,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition-all hover:shadow-md"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-sm`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-[11px] text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}
