import { BookOpen, Play, Lock, ChevronRight } from "lucide-react";
import ArticleCard, { Article } from "@/components/ui/ArticleCard";

// --- 샘플 데이터 (추후 Firestore 연동) ---

const categories = [
  { id: "all", label: "전체" },
  { id: "beginner", label: "입문" },
  { id: "chart", label: "차트 수업" },
  { id: "strategy", label: "전략" },
  { id: "sector", label: "섹터 분석" },
];

const articles: Article[] = [
  {
    id: "1",
    title: "2025년 운영방침: 장투종목, 기술적 타점, 테마주 전략",
    description:
      "1년 장투종목 설정, 기술적 타점 접근, 강력한 테마주 접근, 장기채권 포트 방어, IPO 투자까지. 올해의 전략을 소개합니다.",
    category: "전략",
    date: "2025.01.03",
  },
  {
    id: "2",
    title: "흑자 vs 적자 회사 구분법 - 입문자 필독",
    description:
      "조선, 반도체, 바이오(일부), 식료품, 화장품은 실적이 나오는 종목. 2차전지, 로봇, 화학은 적자 주의.",
    category: "입문",
    date: "2025.01.02",
  },
  {
    id: "3",
    title: "기술적 반등 자리를 노리는 법",
    description:
      "이재명 관련주 사례로 보는 기술적 반등 타점. 좋은 자리가 나오면 어떻게 진입하는지 차트로 살펴봅니다.",
    category: "차트 수업",
    date: "2025.01.02",
  },
  {
    id: "4",
    title: "순환매 공략법: 지수 상승 시 저평가 종목 찾기",
    description:
      "지수가 오른다는 전제가 있으면 흑자 종목들은 순환매가 나옵니다. 섹터별 자리 좋은 종목들을 분석합니다.",
    category: "전략",
    date: "2025.01.06",
  },
  {
    id: "5",
    title: "손절 설정의 원칙과 익절 기준",
    description:
      "못해도 10% 이상 수익이 나는 종목으로만 접근합니다. 손절과 익절의 원칙을 알아봅니다.",
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
  },
  {
    id: "v2",
    title: "이동평균선으로 추세 파악하기",
    duration: "22분",
    isPremium: false,
  },
  {
    id: "v3",
    title: "눌림목 매매 실전 적용 (실습)",
    duration: "31분",
    isPremium: true,
  },
  {
    id: "v4",
    title: "거래량 분석으로 세력 흐름 읽기",
    duration: "28분",
    isPremium: true,
  },
];

export default function WebzinePage() {
  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-xl font-bold text-gray-900">웹진 & 강의실</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          칼럼, 차트 수업, 투자 교육 자료
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

      {/* 차트 수업 영상 섹션 */}
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
              className="w-48 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              {/* Thumbnail placeholder */}
              <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
                  <Play className="h-4 w-4 text-gray-700" fill="currentColor" />
                </div>
                {video.isPremium && (
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <Lock className="h-2.5 w-2.5" />
                    PRO
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-xs font-semibold leading-snug text-gray-900 line-clamp-2">
                  {video.title}
                </h3>
                <p className="mt-1 text-[11px] text-gray-400">
                  {video.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 칼럼 & 글 섹션 */}
      <section className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-primary-600" />
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
