import Link from "next/link";
import {
  TrendingUp,
  Newspaper,
  BookOpen,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import SignalCard, { Signal } from "@/components/ui/SignalCard";
import ArticleCard, { Article } from "@/components/ui/ArticleCard";

// --- 샘플 데이터 (추후 Firestore 연동) ---

const dailyMacro = {
  date: "2025년 1월 7일",
  summary: [
    "트럼프가 관세를 핵심 수입품에만 부과할 것이라는 WP의 보도를 부인",
    "MSFT의 AI 데이터센터 투자 발표로 엔비디아 TSMC가 신고가 경신",
    "필수소비재가 내리고 리튬 관련주가 오르는 등 경기 베팅 증가",
  ],
  indicators: [
    { label: "K200 야간선물", value: "+1.07%", up: true },
    { label: "1개월 NDF 환율", value: "1,461.42원", up: false },
  ],
};

const latestSignals: Signal[] = [
  {
    id: "1",
    stockName: "대봉엘에스",
    entryPrice: 13400,
    targetPrice: 15000,
    stopLoss: 12500,
    sector: "바이오",
    date: "01.07",
    memo: "비만치료제 관련 - 차트가 좋습니다. 손절 13,400",
  },
  {
    id: "2",
    stockName: "LS ELECTRIC",
    entryPrice: 161500,
    targetPrice: 185000,
    stopLoss: 155000,
    sector: "변압기",
    date: "01.02",
    memo: "변압기 섹터. 손절 잡고 매매해보시면 좋겠네요",
  },
];

const latestArticles: Article[] = [
  {
    id: "1",
    title: "2025년 운영방침: 장투종목, 기술적 타점, 테마주 전략",
    description:
      "엄청 대단한걸 하지 않습니다. 다년간 올바른걸 반복할 뿐입니다.",
    category: "전략",
    date: "01.03",
  },
  {
    id: "2",
    title: "실적 나오는 종목 vs 적자 회사 구분법",
    description:
      "조선, 반도체, 바이오(일부), 식료품, 화장품은 실적. 2차전지, 로봇, 화학은 주의.",
    category: "입문",
    date: "01.02",
  },
];

const marketOverview = [
  { label: "코스피", value: "8.1조", change: "+1.91%", up: true },
  { label: "코스닥", value: "8.1조", change: "+1.73%", up: true },
  { label: "업비트·빗썸", value: "4.7조", change: "", up: true },
];

export default function HomePage() {
  return (
    <main>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          사다리
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          주식 정보 커뮤니티
        </p>
      </header>

      {/* 매크로 데일리 요약 */}
      <section className="px-5 py-3">
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-gray-400">
              매크로 데일리
            </h2>
            <span className="text-xs text-gray-500">{dailyMacro.date}</span>
          </div>
          <ul className="mt-3 space-y-2">
            {dailyMacro.summary.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed text-gray-200"
              >
                <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
          {/* 지표 */}
          <div className="mt-4 flex gap-3">
            {dailyMacro.indicators.map((ind) => (
              <div
                key={ind.label}
                className="flex-1 rounded-lg bg-white/10 px-3 py-2"
              >
                <p className="text-[11px] text-gray-400">{ind.label}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
                  {ind.up ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-blue-400" />
                  )}
                  {ind.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 거래대금 */}
      <section className="px-5 py-3">
        <div className="grid grid-cols-3 gap-2">
          {marketOverview.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-gray-100 bg-white p-3 text-center"
            >
              <p className="text-[11px] text-gray-400">{m.label}</p>
              <p className="mt-0.5 text-base font-bold text-gray-900">
                {m.value}
              </p>
              {m.change && (
                <p
                  className={`mt-0.5 text-xs font-medium ${
                    m.up ? "text-up" : "text-down"
                  }`}
                >
                  {m.change}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 최근 시그널 */}
      <section className="px-5 py-3">
        <SectionHeader title="종목 시그널" href="/signals" icon={BarChart3} />
        <div className="mt-2 space-y-3">
          {latestSignals.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      </section>

      {/* 최신 웹진 */}
      <section className="px-5 py-3">
        <SectionHeader title="웹진 & 칼럼" href="/webzine" icon={BookOpen} />
        <div className="mt-2 space-y-3">
          {latestArticles.map((a) => (
            <ArticleCard key={a.id} article={a} />
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
          />
          <QuickLink
            href="/webzine"
            icon={BookOpen}
            label="차트 수업"
            desc="기술적 분석 교육"
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
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition-shadow hover:shadow-sm"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
        <Icon className="h-4.5 w-4.5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-[11px] text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}
