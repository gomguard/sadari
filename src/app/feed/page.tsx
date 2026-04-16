import {
  Calendar,
  DollarSign,
  TrendingUp,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
} from "lucide-react";
import HaseulInsight from "@/components/ui/HaseulInsight";

// --- 샘플 데이터 ---

const haseulComment = {
  id: "feed-1",
  content:
    "이럴 때는 지금 반등 시원하게 안 나온 종목들 공략하시면 좋습니다. 지수가 오른다는 전제가 있으면 흑자 종목들은 순환매가 나올 거에요.",
  date: "01.06",
  mood: "bullish" as const,
};

const feedItems = [
  {
    id: "1",
    type: "macro" as const,
    date: "2025.01.07",
    title: "매크로 데일리",
    content: [
      "트럼프 관세를 핵심 수입품에만 부과할 것이라는 WP 보도 부인",
      "MSFT AI 데이터센터 투자 발표 → 엔비디아·TSMC 신고가",
      "필수소비재↓ 리튬 관련주↑ 경기 베팅 증가",
    ],
    indicators: [
      { label: "K200 야간선물", value: "+1.07%", up: true },
      { label: "NDF 환율", value: "1,461원", up: false },
    ],
  },
  {
    id: "2",
    type: "schedule" as const,
    date: "2025.01.07",
    title: "내일의 이슈 & 테마 스케줄",
    content: [
      "CES 2025 (국제전자제품박람회) 개최",
      "美 12월 ISM 비제조업지수",
      "美 11월 무역수지",
      "美 11월 JOLTs 보고서",
      "유로존 12월 CPI 예비치",
    ],
    highlight: "CES 2025",
  },
  {
    id: "3",
    type: "market" as const,
    date: "2025.01.06",
    title: "거래대금 현황",
    stats: [
      { label: "코스피", value: "8.1조", change: "+1.91%", up: true },
      { label: "코스닥", value: "8.1조", change: "+1.73%", up: true },
      { label: "업비트·빗썸", value: "4.7조", change: "", up: true },
    ],
  },
  {
    id: "4",
    type: "insight" as const,
    date: "2025.01.06",
    title: "시장 인사이트",
    content: [
      "코스피·코스닥 중장기 하락추세 깨고 상승추세 전환",
      "1분기 내내 장이 우상향할 가능성 농후",
      "급하게 사지 마시고 저평가 종목 중 순환매 노리기",
    ],
    sectors: {
      "주목 섹터": [
        { name: "엔터", stock: "큐브엔터", hot: true },
        { name: "바이오", stock: "유한양행, 한미약품", hot: true },
        { name: "반도체", stock: "솔브레인, 동진쎄미켐", hot: true },
        { name: "화장품", stock: "본느, 아이패밀리에스씨", hot: true },
      ],
      "고점 주의": [
        { name: "조선", stock: "차트 고점", hot: false },
        { name: "변압기", stock: "차트 고점", hot: false },
      ],
    },
  },
  {
    id: "5",
    type: "macro" as const,
    date: "2025.01.06",
    title: "섹터별 주목 포인트",
    content: [
      "반도체 — CES 기대감",
      "바이오 — JP모건 헬스케어 컨퍼런스",
      "로봇 — 레인보우로보틱스 테마",
    ],
  },
  {
    id: "6",
    type: "insight" as const,
    date: "2025.01.02",
    title: "장 마감 정리",
    content: [
      "새해 첫날 약보합 마감. 삼전 양봉이나 의미 제한",
      "로봇 섹터 - 실적 찍히기 전까진 주의 필요",
    ],
    sectors: {
      "흑자 종목": [
        { name: "조선", stock: "", hot: true },
        { name: "반도체", stock: "", hot: true },
        { name: "바이오(일부)", stock: "", hot: true },
        { name: "식료품", stock: "", hot: true },
        { name: "화장품", stock: "", hot: true },
      ],
      "적자 주의": [
        { name: "2차전지", stock: "", hot: false },
        { name: "로봇", stock: "", hot: false },
        { name: "바이오(대부분)", stock: "", hot: false },
        { name: "화학", stock: "", hot: false },
      ],
    },
  },
];

const typeConfig = {
  macro: {
    icon: TrendingUp,
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    label: "매크로",
  },
  schedule: {
    icon: Calendar,
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    text: "text-amber-600",
    label: "스케줄",
  },
  market: {
    icon: DollarSign,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    label: "거래대금",
  },
  insight: {
    icon: Megaphone,
    gradient: "from-rose-500 to-rose-600",
    bg: "bg-rose-50",
    text: "text-rose-600",
    label: "인사이트",
  },
};

export default function FeedPage() {
  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-xl font-bold text-gray-900">정보 피드</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          매일 업데이트되는 시장 이슈와 하슬님의 분석
        </p>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
        {["전체", "매크로", "스케줄", "거래대금", "인사이트"].map((tab, i) => (
          <button
            key={tab}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              i === 0
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 하슬님 한마디 */}
      <section className="px-5 py-2">
        <HaseulInsight insight={haseulComment} />
      </section>

      {/* Feed List */}
      <div className="space-y-3 px-5 py-2">
        {feedItems.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              {/* Header with gradient accent */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-gray-400">{item.date}</span>
                </div>
              </div>

              <div className="px-4 pb-4">
                {/* Content list */}
                {"content" in item && item.content && (
                  <ul className="space-y-1.5">
                    {item.content.map((line, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-600"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300" />
                        {line}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Indicators */}
                {"indicators" in item && item.indicators && (
                  <div className="mt-3 flex gap-2">
                    {item.indicators.map((ind) => (
                      <div
                        key={ind.label}
                        className="flex-1 rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <p className="text-[10px] text-gray-400">
                          {ind.label}
                        </p>
                        <p className="mt-0.5 flex items-center gap-0.5 text-sm font-bold text-gray-900">
                          {ind.up ? (
                            <ArrowUpRight className="h-3 w-3 text-up" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-down" />
                          )}
                          {ind.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Highlight badge */}
                {"highlight" in item && item.highlight && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2">
                    <p className="text-xs font-semibold text-amber-700">
                      핵심 이벤트: {item.highlight}
                    </p>
                  </div>
                )}

                {/* Market stats */}
                {"stats" in item && item.stats && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {item.stats.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg bg-gray-50 p-2.5 text-center"
                      >
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                        <p className="mt-0.5 text-base font-bold text-gray-900">
                          {s.value}
                        </p>
                        {s.change && (
                          <p
                            className={`flex items-center justify-center gap-0.5 text-xs font-medium ${
                              s.up ? "text-up" : "text-down"
                            }`}
                          >
                            {s.up ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {s.change}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sectors — visual chips */}
                {"sectors" in item && item.sectors && (
                  <div className="mt-3 space-y-3">
                    {Object.entries(item.sectors).map(
                      ([key, list]: [string, Array<{ name: string; stock: string; hot: boolean }>]) => (
                        <div key={key}>
                          <p className="mb-1.5 text-[11px] font-bold text-gray-500">
                            {key}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {list.map((s) => (
                              <div
                                key={s.name}
                                className={`rounded-lg px-2.5 py-1.5 ${
                                  s.hot
                                    ? "bg-red-50 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                <span className="text-xs font-semibold">
                                  {s.name}
                                </span>
                                {s.stock && (
                                  <span className="ml-1 text-[11px] opacity-70">
                                    {s.stock}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* 반응 바 */}
              <div className="flex items-center gap-4 border-t border-gray-50 bg-gray-50/50 px-4 py-2.5">
                <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
                  <MessageCircle className="h-3.5 w-3.5" />
                  댓글
                </button>
                <button className="text-[11px] text-gray-400 hover:text-gray-600">
                  👍 도움됐어요
                </button>
                <button className="text-[11px] text-gray-400 hover:text-gray-600">
                  🔖 저장
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
