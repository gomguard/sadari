import Link from "next/link";
import { BarChart3, Filter, History } from "lucide-react";
import PerformanceSummary, {
  Performance,
} from "@/components/ui/PerformanceSummary";
import LiveSignalsList from "@/components/live/LiveSignalsList";
import AuthGuard from "@/components/auth/AuthGuard";

// --- 샘플 데이터 (정적 섹션용) ---

const performance: Performance = {
  totalSignals: 38,
  hitRate: 94.7,
  avgReturn: 12.5,
  bestReturn: 24,
  bestStock: "동서",
  period: "2025년 1월 ~ 현재",
};

export default function SignalsPage() {
  return (
    <AuthGuard>
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

      {/* 과거 기록 링크 */}
      <section className="px-5 py-2">
        <Link
          href="/signals/history"
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">과거 시그널 히스토리</p>
              <p className="text-[11px] text-gray-400">
                38건 · 적중률 94.7% · 평균 수익률 +12.5%
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400">→</span>
        </Link>
      </section>

      {/* 성과 요약 */}
      <section className="px-5 py-3">
        <PerformanceSummary perf={performance} />
      </section>

      {/* 투자 유의사항 */}
      <div className="mx-5 mt-2 rounded-xl bg-amber-50 p-3.5">
        <p className="text-xs leading-relaxed text-amber-700">
          <span className="font-semibold">투자의 책임은 본인에게 있습니다.</span>{" "}
          못해도 10% 이상 수익이 나는 종목들로만 접근합니다. 손절이 필수인 종목은
          별도 안내드립니다.
        </p>
      </div>

      {/* Signal Tracker Cards — Firestore 실시간 연동 */}
      <div className="mx-5 mt-2 flex items-center gap-1.5 text-[10px] text-gray-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        실시간 시세 · 1분마다 갱신
      </div>
      <div className="px-5 py-4">
        <LiveSignalsList />
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
    </AuthGuard>
  );
}
