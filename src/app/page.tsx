import Link from "next/link";
import {
  Newspaper,
  BookOpen,
  Users,
} from "lucide-react";
import LiveMarketData from "@/components/ui/LiveMarketData";
import SectorHeatmap, { SectorData } from "@/components/ui/SectorHeatmap";
import PerformanceSummary, {
  Performance,
} from "@/components/ui/PerformanceSummary";
import LiveHomeSections from "@/components/live/LiveHomeSections";
import UserMenu from "@/components/auth/UserMenu";

// --- 샘플 데이터 (정적 섹션용) ---

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
        <UserMenu />
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

      {/* 동적 섹션: 하슬님 한마디 + 오늘의 액션 + 매크로 데일리 + 시그널 트래커 */}
      <LiveHomeSections />

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
