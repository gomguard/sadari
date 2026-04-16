import { BookOpen, Play, Lock, ChevronRight, GraduationCap, Star } from "lucide-react";
import ArticleCard, { Article } from "@/components/ui/ArticleCard";

// --- 샘플 데이터 ---

const categories = [
  { id: "all", label: "전체" },
  { id: "beginner", label: "입문" },
  { id: "chart", label: "차트 수업" },
  { id: "strategy", label: "전략" },
  { id: "sector", label: "섹터 분석" },
];

const curriculum = [
  {
    level: 1,
    title: "입문",
    desc: "주식을 처음 시작하는 분을 위한 기초",
    lessons: 4,
    color: "from-emerald-400 to-emerald-500",
  },
  {
    level: 2,
    title: "기초 차트",
    desc: "캔들, 이동평균선, 거래량 읽기",
    lessons: 6,
    color: "from-blue-400 to-blue-500",
  },
  {
    level: 3,
    title: "실전 매매",
    desc: "눌림목, 기술적 반등, 손절 설정",
    lessons: 5,
    color: "from-violet-400 to-violet-500",
  },
  {
    level: 4,
    title: "고급 전략",
    desc: "섹터 순환매, 포트 관리, 매크로",
    lessons: 4,
    color: "from-amber-400 to-amber-500",
    isPremium: true,
  },
];

const articles: Article[] = [
  {
    id: "1",
    title: "2025년 운영방침: 장투종목, 기술적 타점, 테마주 전략",
    description:
      "엄청 대단한걸 하지 않습니다. 다년간 올바른걸 반복할 뿐입니다. 올해의 6가지 전략을 소개합니다.",
    category: "전략",
    date: "2025.01.03",
  },
  {
    id: "2",
    title: "흑자 vs 적자 회사 구분법 - 입문자 필독",
    description:
      "조선, 반도체, 바이오(일부), 식료품, 화장품은 실적. 2차전지, 로봇, 화학은 적자 주의.",
    category: "입문",
    date: "2025.01.02",
  },
  {
    id: "3",
    title: "기술적 반등 자리를 노리는 법",
    description:
      "이재명 관련주 사례로 보는 기술적 반등 타점. 실전 차트로 살펴봅니다.",
    category: "차트 수업",
    date: "2025.01.02",
  },
  {
    id: "4",
    title: "순환매 공략법: 지수 상승 시 저평가 종목 찾기",
    description:
      "지수가 오르면 흑자 종목들은 순환매가 나옵니다. 섹터별 종목 분석.",
    category: "전략",
    date: "2025.01.06",
  },
  {
    id: "5",
    title: "손절 설정의 원칙과 익절 기준",
    description:
      "못해도 10% 이상 수익이 나는 종목으로만 접근. 손절과 익절의 원칙.",
    category: "입문",
    date: "2025.01.07",
  },
];

const videoLessons = [
  {
    id: "v1",
    title: "캔들차트 기초: 양봉과 음봉 읽는 법",
    duration: "15분",
    isPremium: false,
    level: "입문",
    views: 342,
  },
  {
    id: "v2",
    title: "이동평균선으로 추세 파악하기",
    duration: "22분",
    isPremium: false,
    level: "기초",
    views: 281,
  },
  {
    id: "v3",
    title: "눌림목 매매 실전 적용",
    duration: "31분",
    isPremium: true,
    level: "실전",
    views: 198,
  },
  {
    id: "v4",
    title: "거래량 분석으로 세력 흐름 읽기",
    duration: "28분",
    isPremium: true,
    level: "고급",
    views: 156,
  },
];

const glossary = [
  { term: "눌림목", desc: "상승 후 일시적으로 가격이 내려오는 구간. 재진입 타점." },
  { term: "분할매수", desc: "한 번에 안 사고 나눠서 사는 전략. 리스크 분산 목적." },
  { term: "손절", desc: "손해를 확정짓고 파는 것. 더 큰 손실을 막기 위한 안전장치." },
  { term: "순환매", desc: "자금이 한 섹터에서 다른 섹터로 돌아가며 오르는 현상." },
];

export default function WebzinePage() {
  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-xl font-bold text-gray-900">웹진 & 강의실</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          단계별 커리큘럼과 실전 칼럼
        </p>
      </header>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              i === 0
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 학습 커리큘럼 로드맵 */}
      <section className="px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">학습 로드맵</h2>
            <p className="text-[10px] text-gray-400">
              단계별로 따라가면 차트가 보입니다
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {curriculum.map((step) => (
            <div
              key={step.level}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-sm font-bold text-white shadow-sm`}
              >
                L{step.level}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  {step.isPremium && (
                    <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      <Lock className="h-2.5 w-2.5" />
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">{step.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600">
                  {step.lessons}강
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 차트 수업 영상 */}
      <section className="px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Play className="h-4 w-4 text-primary-600" />
            <h2 className="text-sm font-bold text-gray-900">차트 수업</h2>
          </div>
          <button className="flex items-center gap-0.5 text-xs text-gray-400">
            전체보기
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-2 flex gap-3 overflow-x-auto scrollbar-hide">
          {videoLessons.map((video) => (
            <div
              key={video.id}
              className="w-52 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                {/* 패턴 데코 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-2">
                    {[40, 65, 50, 75, 60, 80, 55, 70].map((h, i) => (
                      <div
                        key={i}
                        className="w-3 rounded-t bg-white"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play
                    className="h-4 w-4 text-white"
                    fill="currentColor"
                  />
                </div>
                {video.isPremium && (
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <Lock className="h-2.5 w-2.5" />
                    PRO
                  </div>
                )}
                <div className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  {video.duration}
                </div>
              </div>
              <div className="p-3">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {video.level}
                </span>
                <h3 className="mt-1.5 text-xs font-semibold leading-snug text-gray-900 line-clamp-2">
                  {video.title}
                </h3>
                <p className="mt-1 text-[10px] text-gray-400">
                  조회 {video.views}회
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 용어사전 — 초보자를 위한 차별화 */}
      <section className="px-5 py-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">주식 용어사전</h3>
              <p className="text-[10px] text-gray-400">
                방에서 자주 쓰이는 용어 정리
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {glossary.map((g) => (
              <div
                key={g.term}
                className="rounded-lg bg-gray-50 px-3 py-2.5"
              >
                <span className="text-xs font-bold text-primary-600">
                  {g.term}
                </span>
                <p className="mt-0.5 text-[12px] leading-relaxed text-gray-600">
                  {g.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 칼럼 */}
      <section className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-primary-600" />
          <h2 className="text-sm font-bold text-gray-900">칼럼</h2>
        </div>
        <div className="mt-2 space-y-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </main>
  );
}
