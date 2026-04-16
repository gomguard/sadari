"use client";

import { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  BarChart3,
} from "lucide-react";

// 카카오톡 대화에서 추출한 실제 과거 시그널 데이터
// 결과가 명확히 언급된 것들만 포함

interface HistoricalSignal {
  id: string;
  date: string; // 언급일
  stockName: string;
  entryPrice: number | null;
  stopLoss: number | null;
  result: "profit" | "loss" | "breakeven";
  returnPct: number; // 수익률 (%)
  exitDate: string; // 결과 확인일
  holdingDays: number;
  memo: string; // 하슬님 원문 요약
  exitMemo: string; // 결과 요약
}

const historicalSignals: HistoricalSignal[] = [
  {
    id: "h1", date: "2025-01-02", stockName: "LS Electric",
    entryPrice: null, stopLoss: 161500, result: "profit", returnPct: 5,
    exitDate: "2025-01-14", holdingDays: 12,
    memo: "161,500원 손절잡고 매매. 변압기 섹터.",
    exitMemo: "5% 수익권에서 전량 매도",
  },
  {
    id: "h2", date: "2025-01-07", stockName: "현대로템",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 20,
    exitDate: "2025-01-07", holdingDays: 0,
    memo: "이전 매수 종목",
    exitMemo: "20% 수익마감",
  },
  {
    id: "h3", date: "2025-01-07", stockName: "대봉엘에스",
    entryPrice: 14000, stopLoss: 13400, result: "profit", returnPct: 35,
    exitDate: "2025-03-05", holdingDays: 57,
    memo: "차트 좋음. 손절 13,400. 목표가 19,000 (35%).",
    exitMemo: "수익권 진입 후 매도사인",
  },
  {
    id: "h4", date: "2025-01-07", stockName: "SK바이오팜",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 17,
    exitDate: "2025-01-07", holdingDays: 0,
    memo: "작년 12월부터 보유",
    exitMemo: "15~18% 수익권 도달, 분할 매도",
  },
  {
    id: "h5", date: "2025-01-09", stockName: "아이패밀리에스씨",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 14,
    exitDate: "2025-01-09", holdingDays: 0,
    memo: "화장품 섹터",
    exitMemo: "14% 수익 매도",
  },
  {
    id: "h6", date: "2025-01-17", stockName: "큐브엔터",
    entryPrice: null, stopLoss: 13600, result: "profit", returnPct: 20,
    exitDate: "2025-02-20", holdingDays: 34,
    memo: "13,600 손절 놓고 진입.",
    exitMemo: "6% 상승 → 20% 수익권에서 매도",
  },
  {
    id: "h7", date: "2025-01-21", stockName: "SK텔레콤",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 7,
    exitDate: "2025-02-20", holdingDays: 30,
    memo: "박스 하단 위치. 배당 5~7%.",
    exitMemo: "7% 수익에서 전량 매도",
  },
  {
    id: "h8", date: "2025-02-04", stockName: "동서",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 24,
    exitDate: "2025-03-26", holdingDays: 50,
    memo: "커피값 상승에 동서 많이 눌려있음.",
    exitMemo: "5% → 13% → 24% 돌파. 70% 매도 사인",
  },
  {
    id: "h9", date: "2025-02-04", stockName: "엔씨소프트",
    entryPrice: 172000, stopLoss: 168000, result: "loss", returnPct: -3,
    exitDate: "2025-03-05", holdingDays: 29,
    memo: "172,000원 진입. 손절가 168,000원 (-2~3%).",
    exitMemo: "수익권 갔다가 손절가 도달. 아쉬운 건",
  },
  {
    id: "h10", date: "2025-02-05", stockName: "롯데웰푸드",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 8,
    exitDate: "2025-02-21", holdingDays: 16,
    memo: "바닥에서 차트 변곡. 롯데그룹 중 알짜.",
    exitMemo: "8%에서 매도",
  },
  {
    id: "h11", date: "2025-02-10", stockName: "LG유플러스",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 5,
    exitDate: "2025-02-14", holdingDays: 4,
    memo: "통신사 방어주, 배당 5~7%.",
    exitMemo: "약수익권 매도",
  },
  {
    id: "h12", date: "2025-02-11", stockName: "테슬라",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 5,
    exitDate: "2025-02-14", holdingDays: 3,
    memo: "과대 낙폭 구간에 1차매수.",
    exitMemo: "절반 익절",
  },
  {
    id: "h13", date: "2025-02-19", stockName: "솔브레인",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 8,
    exitDate: "2025-02-19", holdingDays: 0,
    memo: "이전 매수 반도체 종목",
    exitMemo: "약 8% 수익 매도",
  },
  {
    id: "h14", date: "2025-02-21", stockName: "록히드마틴",
    entryPrice: null, stopLoss: 604000, result: "profit", returnPct: 3,
    exitDate: "2025-03-04", holdingDays: 11,
    memo: "604,000 손절. 미국 방산주.",
    exitMemo: "460불에 매도, 2%+ 수익",
  },
  {
    id: "h15", date: "2025-03-04", stockName: "농심",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 5,
    exitDate: "2025-03-06", holdingDays: 2,
    memo: "장투 좋아보임.",
    exitMemo: "가격인상 소식에 상승, 전량 매도",
  },
  {
    id: "h16", date: "2025-03-05", stockName: "한화엔진",
    entryPrice: null, stopLoss: 22000, result: "profit", returnPct: 15,
    exitDate: "2025-03-10", holdingDays: 5,
    memo: "조선섹터 22,000 손절.",
    exitMemo: "홀딩 → 계속 상승",
  },
  {
    id: "h17", date: "2025-03-12", stockName: "파크시스템즈",
    entryPrice: null, stopLoss: 187500, result: "profit", returnPct: 12,
    exitDate: "2025-03-21", holdingDays: 9,
    memo: "187,500 손절잡고 진입.",
    exitMemo: "12% 수익마감 매도",
  },
  {
    id: "h18", date: "2025-03-12", stockName: "삼성전자",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 10,
    exitDate: "2025-07-28", holdingDays: 138,
    memo: "슬슬 반도체 다시 담으셔도 됩니다.",
    exitMemo: "6.2만부터 분할매도 → 7.8만 2차매도",
  },
  {
    id: "h19", date: "2025-03-17", stockName: "KT&G",
    entryPrice: null, stopLoss: 94000, result: "profit", returnPct: 9,
    exitDate: "2025-04-14", holdingDays: 28,
    memo: "94,000원 손절. 물려도 되는 회사.",
    exitMemo: "약 9% 수익권 도달, 정리",
  },
  {
    id: "h20", date: "2025-03-17", stockName: "노루홀딩스",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 10,
    exitDate: "2025-04-28", holdingDays: 42,
    memo: "선박도료회사. 타점 좋음.",
    exitMemo: "신고가돌파, 10% 수익권",
  },
  {
    id: "h21", date: "2025-03-19", stockName: "한네트",
    entryPrice: null, stopLoss: 3995, result: "profit", returnPct: 12,
    exitDate: "2025-05-09", holdingDays: 51,
    memo: "3,995 손절. 비중 작게.",
    exitMemo: "12% 수익",
  },
  {
    id: "h22", date: "2025-03-24", stockName: "JYP",
    entryPrice: null, stopLoss: 60200, result: "profit", returnPct: 7,
    exitDate: "2025-04-29", holdingDays: 36,
    memo: "60,200 손절. 물리면 장투 가능.",
    exitMemo: "7% 수익",
  },
  {
    id: "h23", date: "2025-03-25", stockName: "한국단자",
    entryPrice: null, stopLoss: 65700, result: "profit", returnPct: 9,
    exitDate: "2025-12-04", holdingDays: 254,
    memo: "65,700 손절. 현대차 대신.",
    exitMemo: "9% 수익",
  },
  {
    id: "h24", date: "2025-04-04", stockName: "한화오션",
    entryPrice: null, stopLoss: 66200, result: "profit", returnPct: 27,
    exitDate: "2025-07-28", holdingDays: 115,
    memo: "차트변곡 66,200 손절 진입.",
    exitMemo: "신고가 → 27% 수익권",
  },
  {
    id: "h25", date: "2025-04-22", stockName: "아세아제지",
    entryPrice: null, stopLoss: 7000, result: "profit", returnPct: 20,
    exitDate: "2025-07-09", holdingDays: 78,
    memo: "세종시 노른자땅. 눌림 이쁨.",
    exitMemo: "1차 손절 후 재진입 → 20% 전량 매도",
  },
  {
    id: "h26", date: "2025-05-02", stockName: "KCC",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 11,
    exitDate: "2026-02-05", holdingDays: 279,
    memo: "분할매수 진행",
    exitMemo: "10% 수익에서 80% 익절 → 11% 정리",
  },
  {
    id: "h27", date: "2025-06-25", stockName: "현대차",
    entryPrice: 184000, stopLoss: null, result: "profit", returnPct: 20,
    exitDate: "2025-06-25", holdingDays: 0,
    memo: "184,000원 진입.",
    exitMemo: "20% 수익 전량 매도",
  },
  {
    id: "h28", date: "2025-06-16", stockName: "한양이엔지",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 20,
    exitDate: "2025-09-12", holdingDays: 88,
    memo: "11% 수익 홀딩 중",
    exitMemo: "20% 수익에서 전량 매도",
  },
  {
    id: "h29", date: "2025-06-18", stockName: "휴메딕스",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 30,
    exitDate: "2025-07-22", holdingDays: 34,
    memo: "9% 수익 홀딩 중",
    exitMemo: "70% 매도, 상한가",
  },
  {
    id: "h30", date: "2025-06-26", stockName: "포스코홀딩스",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 16,
    exitDate: "2025-07-08", holdingDays: 12,
    memo: "9% 수익권 돌파",
    exitMemo: "16% 수익 → 70% 매도 → 전량 매도",
  },
  {
    id: "h31", date: "2025-06-27", stockName: "이구산업",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 25,
    exitDate: "2025-06-27", holdingDays: 0,
    memo: "비철금속 섹터",
    exitMemo: "25% 수익권 마무리",
  },
  {
    id: "h32", date: "2025-07-02", stockName: "대웅제약",
    entryPrice: 146000, stopLoss: 142300, result: "profit", returnPct: 10,
    exitDate: "2025-09-05", holdingDays: 65,
    memo: "142,300 손절. 진입가 146,000. 손절 -3%.",
    exitMemo: "5% → 추가상승, 부분 익절",
  },
  {
    id: "h33", date: "2025-07-03", stockName: "삼성SDI",
    entryPrice: null, stopLoss: 170000, result: "profit", returnPct: 14,
    exitDate: "2025-10-17", holdingDays: 106,
    memo: "17만원 손절 진입.",
    exitMemo: "5% → 20% → 14% 수익에서 매도",
  },
  {
    id: "h34", date: "2025-09-18", stockName: "LG전자",
    entryPrice: null, stopLoss: null, result: "profit", returnPct: 7,
    exitDate: "2025-09-18", holdingDays: 85,
    memo: "3% 수익 홀딩 중",
    exitMemo: "7% 수익 마감 매도",
  },
];

// 통계 계산
const totalSignals = historicalSignals.length;
const profits = historicalSignals.filter((s) => s.result === "profit");
const losses = historicalSignals.filter((s) => s.result === "loss");
const hitRate = ((profits.length / totalSignals) * 100).toFixed(1);
const avgReturn = (
  historicalSignals.reduce((sum, s) => sum + s.returnPct, 0) / totalSignals
).toFixed(1);
const avgHoldingDays = Math.round(
  historicalSignals.reduce((sum, s) => sum + s.holdingDays, 0) / totalSignals
);
const bestSignal = historicalSignals.reduce((best, s) =>
  s.returnPct > best.returnPct ? s : best
);
const totalReturn = historicalSignals.reduce((sum, s) => sum + s.returnPct, 0);

type FilterType = "all" | "profit" | "loss";

export default function SignalHistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<"date" | "return">("date");

  const filtered = historicalSignals
    .filter((s) => filter === "all" || s.result === filter)
    .sort((a, b) =>
      sortBy === "date"
        ? b.date.localeCompare(a.date)
        : b.returnPct - a.returnPct
    );

  return (
    <main>
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-xl font-bold text-gray-900">시그널 히스토리</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          과거 추천 종목의 실제 성과를 투명하게 공개합니다
        </p>
      </header>

      {/* 성과 대시보드 */}
      <section className="px-5 py-3">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 text-white">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold">전체 성과 요약</h2>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            2025.01 ~ 2026.02 카카오톡 추천 기록 기반
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">총 시그널</p>
              <p className="mt-1 text-2xl font-bold">{totalSignals}건</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">적중률</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {hitRate}%
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">평균 수익률</p>
              <p className="mt-1 text-2xl font-bold text-amber-400">
                +{avgReturn}%
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">평균 보유일</p>
              <p className="mt-1 text-2xl font-bold">{avgHoldingDays}일</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <p className="text-[11px] text-emerald-300">최고 수익</p>
              <p className="text-lg font-bold text-emerald-400">
                +{bestSignal.returnPct}%
              </p>
              <p className="text-[10px] text-gray-400">
                {bestSignal.stockName}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[11px] text-gray-400">누적 수익률 합계</p>
              <p className="text-lg font-bold text-amber-400">
                +{totalReturn}%
              </p>
              <p className="text-[10px] text-gray-400">{totalSignals}건 합산</p>
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-center text-[11px] text-gray-400">
            손절 포함, 있는 그대로. 카카오톡 원문 기반.
          </p>
        </div>
      </section>

      {/* 필터 */}
      <div className="flex items-center justify-between px-5 py-2">
        <div className="flex gap-2">
          {([
            { key: "all" as FilterType, label: "전체", count: totalSignals },
            { key: "profit" as FilterType, label: "수익", count: profits.length },
            { key: "loss" as FilterType, label: "손실", count: losses.length },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 text-[10px] ${
                filter === f.key ? "bg-white/20" : "bg-gray-200"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortBy(sortBy === "date" ? "return" : "date")}
          className="flex items-center gap-1 text-[11px] text-gray-400"
        >
          <Filter className="h-3 w-3" />
          {sortBy === "date" ? "날짜순" : "수익순"}
        </button>
      </div>

      {/* 시그널 리스트 */}
      <div className="space-y-2 px-5 py-2">
        {filtered.map((signal) => (
          <div
            key={signal.id}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {signal.stockName}
                </span>
                {signal.result === "profit" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : signal.result === "loss" ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <span
                className={`text-lg font-bold ${
                  signal.returnPct >= 0 ? "text-up" : "text-down"
                }`}
              >
                {signal.returnPct >= 0 ? "+" : ""}
                {signal.returnPct}%
              </span>
            </div>

            {/* 타임라인 */}
            <div className="flex items-center gap-2 px-4 py-1.5">
              <div className="flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5">
                <ArrowUpRight className="h-3 w-3 text-primary-500" />
                <span className="text-[11px] text-gray-600">{signal.date}</span>
              </div>
              <span className="text-[10px] text-gray-300">→</span>
              <div className="flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5">
                {signal.result === "profit" ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className="text-[11px] text-gray-600">
                  {signal.exitDate}
                </span>
              </div>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                {signal.holdingDays}일
              </span>
            </div>

            {/* 메모 */}
            <div className="border-t border-gray-50 px-4 py-2.5">
              <p className="text-[12px] leading-relaxed text-gray-500">
                📝 {signal.memo}
              </p>
              <p
                className={`mt-1 text-[12px] font-medium leading-relaxed ${
                  signal.result === "profit"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                → {signal.exitMemo}
              </p>
            </div>

            {/* 진입가/손절가 */}
            {(signal.entryPrice || signal.stopLoss) && (
              <div className="flex gap-2 border-t border-gray-50 bg-gray-50/50 px-4 py-2">
                {signal.entryPrice && (
                  <span className="text-[11px] text-gray-500">
                    진입가 {signal.entryPrice.toLocaleString()}원
                  </span>
                )}
                {signal.stopLoss && (
                  <span className="text-[11px] text-gray-500">
                    손절가 {signal.stopLoss.toLocaleString()}원
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 면책 */}
      <div className="mx-5 my-4 rounded-xl bg-amber-50 p-3.5">
        <p className="text-xs leading-relaxed text-amber-700">
          <span className="font-semibold">면책사항:</span> 위 데이터는 카카오톡
          대화 기록에서 추출한 것으로, 실제 수익률은 진입/청산 시점에 따라 달라질
          수 있습니다. 투자의 책임은 본인에게 있습니다.
        </p>
      </div>
    </main>
  );
}
