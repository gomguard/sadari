import {
  Calendar,
  DollarSign,
  TrendingUp,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// --- 샘플 데이터 (추후 Firestore 연동) ---

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
      "美 11월 구인 및 이직(JOLTs) 보고서",
      "유로존 12월 CPI 예비치",
    ],
  },
  {
    id: "3",
    type: "market" as const,
    date: "2025.01.06",
    title: "거래대금 현황",
    stats: [
      { label: "코스피", value: "8.1조 원", change: "+1.91%", up: true },
      { label: "코스닥", value: "8.1조 원", change: "+1.73%", up: true },
      { label: "업비트·빗썸", value: "4.7조 원", change: "", up: true },
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
      주목: ["엔터 - 큐브엔터", "바이오 - 유한양행, 한미약품", "반도체 - 솔브레인, 동진쎄미켐", "화장품 - 본느, 아이패밀리에스씨"],
      고점주의: ["조선 (차트고점)", "변압기 (차트고점)"],
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
      흑자: ["조선", "반도체", "바이오(일부)", "식료품", "화장품"],
      적자주의: ["2차전지", "로봇", "바이오(대부분)", "화학"],
    },
  },
];

const typeConfig = {
  macro: { icon: TrendingUp, color: "bg-indigo-50 text-indigo-600", label: "매크로" },
  schedule: { icon: Calendar, color: "bg-amber-50 text-amber-600", label: "스케줄" },
  market: { icon: DollarSign, color: "bg-emerald-50 text-emerald-600", label: "거래대금" },
  insight: { icon: Megaphone, color: "bg-rose-50 text-rose-600", label: "인사이트" },
};

export default function FeedPage() {
  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-xl font-bold text-gray-900">정보 피드</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          매일 업데이트되는 시장 이슈와 분석
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

      {/* Feed List */}
      <div className="space-y-3 px-5 py-2">
        {feedItems.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <article
              key={item.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">{item.date}</span>
              </div>

              <h3 className="mt-2 text-sm font-bold text-gray-900">
                {item.title}
              </h3>

              {/* Content list */}
              {"content" in item && item.content && (
                <ul className="mt-2 space-y-1">
                  {item.content.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-600"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-300" />
                      {line}
                    </li>
                  ))}
                </ul>
              )}

              {/* Market stats */}
              {"stats" in item && item.stats && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {item.stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg bg-gray-50 p-2.5 text-center"
                    >
                      <p className="text-[11px] text-gray-400">{s.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-gray-900">
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

              {/* Sectors */}
              {"sectors" in item && item.sectors && (
                <div className="mt-3 space-y-2">
                  {Object.entries(item.sectors).map(([key, list]: [string, string[]]) => (
                    <div key={key}>
                      <p className="text-[11px] font-semibold text-gray-400">
                        {key}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {list.map((s) => (
                          <span
                            key={s}
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                              key.includes("주의") || key.includes("적자")
                                ? "bg-blue-50 text-blue-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
