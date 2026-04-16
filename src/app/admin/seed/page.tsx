"use client";

import { useState } from "react";
import { addSignal, addDaily, addArticle, addPost, addComment } from "@/lib/firestore";

type SeedStatus = "idle" | "loading" | "success" | "error";

interface SeedState {
  signals: SeedStatus;
  daily: SeedStatus;
  articles: SeedStatus;
  posts: SeedStatus;
  all: SeedStatus;
}

const today = new Date().toISOString().slice(0, 10);

const sampleSignals = [
  {
    stockName: "대봉엘에스",
    ticker: "078140",
    sector: "바이오",
    entryPrice: 14000,
    targetPrice: 19000,
    stopLoss: 13400,
    status: "active" as const,
    date: today,
  },
  {
    stockName: "유한양행",
    ticker: "000100",
    sector: "바이오",
    entryPrice: 119200,
    targetPrice: 140000,
    stopLoss: 110000,
    status: "active" as const,
    date: today,
  },
  {
    stockName: "한화오션",
    ticker: "042660",
    sector: "조선",
    entryPrice: 69300,
    targetPrice: 88000,
    stopLoss: 66200,
    status: "active" as const,
    date: today,
  },
  {
    stockName: "KT&G",
    ticker: "033780",
    sector: "식료품",
    entryPrice: 96300,
    targetPrice: 106000,
    stopLoss: 94000,
    status: "holding" as const,
    date: today,
  },
  {
    stockName: "삼성전자",
    ticker: "005930",
    sector: "반도체",
    entryPrice: 53400,
    targetPrice: 65000,
    stopLoss: 50000,
    status: "active" as const,
    date: today,
  },
];

const sampleDaily = {
  date: today,
  mood: "bullish" as const,
  haseulComment:
    "코스피·코스닥 중장기 하락추세를 깨고 상승추세로 전환합니다. 급하게 사지 마시고 저평가된 종목들 중에 순환매를 공략하세요.",
  summary: [
    "반도체 섹터 CES 기대감으로 강세",
    "바이오 JP모건 컨퍼런스 수혜",
    "로봇 섹터 실적 미확인 주의",
  ],
  indicators: [
    { label: "K200 야간선물", value: "+1.07%", up: true },
    { label: "NDF 환율", value: "1,461원", up: false },
  ],
  actions: [
    { type: "buy" as const, content: "대봉엘에스 — 비만치료제 관련, 차트 자리 좋음" },
    { type: "watch" as const, content: "반도체 섹터 — CES 기대감으로 흐름 양호" },
    { type: "caution" as const, content: "로봇 섹터 — 실적 찍히기 전까진 조심" },
    { type: "target" as const, content: "유한양행, 한미약품 — 바이오 중 흑자 종목" },
  ],
};

const sampleArticles = [
  {
    title: "2025년 운영방침: 장투종목, 기술적 타점, 테마주 전략",
    description: "사다리 운영 전략과 종목 선정 기준을 정리합니다.",
    category: "전략",
    isPremium: false,
    date: today,
  },
  {
    title: "흑자 vs 적자 회사 구분법 - 입문자 필독",
    description: "재무제표에서 흑자/적자를 구분하는 핵심 포인트를 알려드립니다.",
    category: "입문",
    isPremium: false,
    date: today,
  },
  {
    title: "기술적 반등 자리를 노리는 법",
    description: "차트에서 반등 자리를 찾는 기술적 분석 방법론입니다.",
    category: "차트수업",
    isPremium: false,
    date: today,
  },
];

const samplePosts = [
  {
    nickname: "주린이",
    title: "삼전 언제 탈출 가능할까요?",
    category: "종목토론" as const,
    content: "52000에 물렸는데...",
  },
  {
    nickname: "익명123",
    title: "사다리 덕분에 첫 수익!",
    category: "수익인증" as const,
    content: "대봉엘에스 15% 수익...",
  },
  {
    nickname: "차트공부중",
    title: "눌림목 매매 질문",
    category: "질문" as const,
    content: "눌림목이 정확히 뭔가요?",
  },
];

export default function SeedPage() {
  const [status, setStatus] = useState<SeedState>({
    signals: "idle",
    daily: "idle",
    articles: "idle",
    posts: "idle",
    all: "idle",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateStatus = (key: keyof SeedState, value: SeedStatus) => {
    setStatus((prev) => ({ ...prev, [key]: value }));
  };

  const setError = (key: string, msg: string) => {
    setErrors((prev) => ({ ...prev, [key]: msg }));
  };

  const seedSignals = async () => {
    updateStatus("signals", "loading");
    try {
      for (const signal of sampleSignals) {
        await addSignal(signal);
      }
      updateStatus("signals", "success");
    } catch (e) {
      updateStatus("signals", "error");
      setError("signals", e instanceof Error ? e.message : "알 수 없는 오류");
    }
  };

  const seedDaily = async () => {
    updateStatus("daily", "loading");
    try {
      await addDaily(sampleDaily);
      updateStatus("daily", "success");
    } catch (e) {
      updateStatus("daily", "error");
      setError("daily", e instanceof Error ? e.message : "알 수 없는 오류");
    }
  };

  const seedArticles = async () => {
    updateStatus("articles", "loading");
    try {
      for (const article of sampleArticles) {
        await addArticle(article);
      }
      updateStatus("articles", "success");
    } catch (e) {
      updateStatus("articles", "error");
      setError("articles", e instanceof Error ? e.message : "알 수 없는 오류");
    }
  };

  const seedPosts = async () => {
    updateStatus("posts", "loading");
    try {
      const postIds: string[] = [];
      for (const post of samplePosts) {
        const id = await addPost(post);
        postIds.push(id);
      }
      // Add a sample comment to the first post
      if (postIds[0]) {
        await addComment({
          postId: postIds[0],
          nickname: "하슬",
          content: "삼전은 반도체 업황 회복 시점을 봐야 합니다. 조금만 더 기다려보세요.",
        });
      }
      updateStatus("posts", "success");
    } catch (e) {
      updateStatus("posts", "error");
      setError("posts", e instanceof Error ? e.message : "알 수 없는 오류");
    }
  };

  const seedAll = async () => {
    updateStatus("all", "loading");
    try {
      await seedSignals();
      await seedDaily();
      await seedArticles();
      await seedPosts();
      updateStatus("all", "success");
    } catch (e) {
      updateStatus("all", "error");
      setError("all", e instanceof Error ? e.message : "알 수 없는 오류");
    }
  };

  const getButtonStyle = (s: SeedStatus) => {
    switch (s) {
      case "loading":
        return "bg-gray-400 cursor-not-allowed text-white";
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      default:
        return "bg-primary-600 hover:bg-primary-700 text-white";
    }
  };

  const getLabel = (s: SeedStatus, defaultLabel: string) => {
    switch (s) {
      case "loading":
        return "시딩 중...";
      case "success":
        return "완료!";
      case "error":
        return "오류 발생";
      default:
        return defaultLabel;
    }
  };

  const sections: {
    key: keyof SeedState;
    label: string;
    description: string;
    action: () => Promise<void>;
  }[] = [
    {
      key: "signals",
      label: "시그널 시딩 (5개)",
      description:
        "대봉엘에스, 유한양행, 한화오션, KT&G, 삼성전자 시그널을 추가합니다.",
      action: seedSignals,
    },
    {
      key: "daily",
      label: "데일리 매크로 시딩 (1개)",
      description: "오늘 날짜의 데일리 매크로 브리핑을 추가합니다.",
      action: seedDaily,
    },
    {
      key: "articles",
      label: "아티클 시딩 (3개)",
      description: "전략, 입문, 차트수업 카테고리 아티클을 추가합니다.",
      action: seedArticles,
    },
    {
      key: "posts",
      label: "커뮤니티 게시글 시딩 (3개 + 댓글 1개)",
      description:
        "종목토론, 수익인증, 질문 카테고리의 게시글과 샘플 댓글을 추가합니다.",
      action: seedPosts,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        샘플 데이터 시딩
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Firestore에 샘플 데이터를 추가합니다. 빈 화면을 채우기 위한 테스트
        데이터입니다.
      </p>

      {/* Warning */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">
          주의: 기존 데이터가 삭제되지는 않지만, 버튼을 여러 번 누르면 중복
          데이터가 추가됩니다.
        </p>
      </div>

      {/* Seed All */}
      <div className="mb-8">
        <button
          onClick={seedAll}
          disabled={status.all === "loading"}
          className={`w-full rounded-lg px-6 py-3 text-base font-semibold transition-colors ${getButtonStyle(
            status.all
          )}`}
        >
          {getLabel(status.all, "전체 시딩")}
        </button>
        {status.all === "error" && errors.all && (
          <p className="mt-2 text-sm text-red-600">{errors.all}</p>
        )}
      </div>

      <div className="mb-4 border-t border-gray-200" />
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
        개별 시딩
      </p>

      {/* Individual Sections */}
      <div className="space-y-4">
        {sections.map(({ key, label, description, action }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4"
          >
            <div className="mr-4">
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{description}</p>
              {status[key] === "error" && errors[key] && (
                <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
              )}
            </div>
            <button
              onClick={action}
              disabled={status[key] === "loading"}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getButtonStyle(
                status[key]
              )}`}
            >
              {getLabel(status[key], "시딩")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
