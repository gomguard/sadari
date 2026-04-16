"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Newspaper, BookOpen, TrendingUp, MessageSquare } from "lucide-react";
import { getSignals, getDailies, getArticles, getPosts } from "@/lib/firestore";

interface DashboardStats {
  signalCount: number;
  activeSignals: number;
  dailyCount: number;
  articleCount: number;
  communityCount: number;
}

const summaryCards = [
  {
    label: "전체 시그널",
    key: "signalCount" as const,
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
    href: "/admin/signals",
  },
  {
    label: "활성 시그널",
    key: "activeSignals" as const,
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
    href: "/admin/signals",
  },
  {
    label: "데일리 포스트",
    key: "dailyCount" as const,
    icon: Newspaper,
    color: "from-violet-500 to-violet-600",
    href: "/admin/daily",
  },
  {
    label: "웹진 아티클",
    key: "articleCount" as const,
    icon: BookOpen,
    color: "from-amber-500 to-amber-600",
    href: "/admin/articles",
  },
  {
    label: "커뮤니티 게시글",
    key: "communityCount" as const,
    icon: MessageSquare,
    color: "from-pink-500 to-pink-600",
    href: "/admin/community",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    signalCount: 0,
    activeSignals: 0,
    dailyCount: 0,
    articleCount: 0,
    communityCount: 0,
  });
  const [signals, setSignals] = useState<
    { id: string; stockName: string; sector: string; status: string; date: string }[]
  >([]);
  const [articles, setArticles] = useState<
    { id: string; title: string; category: string; isPremium: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const [signalsData, dailiesData, articlesData, postsData] = await Promise.all([
        getSignals(),
        getDailies(),
        getArticles(),
        getPosts(),
      ]);

      setSignals(
        signalsData as { id: string; stockName: string; sector: string; status: string; date: string }[]
      );
      setArticles(
        articlesData as { id: string; title: string; category: string; isPremium: boolean }[]
      );

      setStats({
        signalCount: signalsData.length,
        activeSignals: signalsData.filter(
          (s: { status?: string }) => s.status === "active"
        ).length,
        dailyCount: dailiesData.length,
        articleCount: articlesData.length,
        communityCount: postsData.length,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("대시보드 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-gray-500">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          사다리 콘텐츠를 관리하세요.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats[card.key]}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-600">
                {card.label}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentSignals signals={signals} />
        <RecentArticles articles={articles} />
      </div>
    </div>
  );
}

function RecentSignals({
  signals,
}: {
  signals: { id: string; stockName: string; sector: string; status: string; date: string }[];
}) {
  const recent = signals.slice(-5).reverse();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">최근 시그널</h2>
        <Link
          href="/admin/signals"
          className="text-xs text-primary-600 hover:underline"
        >
          전체보기
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="mt-4 text-center text-sm text-gray-400">
          아직 등록된 시그널이 없습니다.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {recent.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {s.stockName}
                </span>
                <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {s.sector}
                </span>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentArticles({
  articles,
}: {
  articles: { id: string; title: string; category: string; isPremium: boolean }[];
}) {
  const recent = articles.slice(-5).reverse();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">최근 아티클</h2>
        <Link
          href="/admin/articles"
          className="text-xs text-primary-600 hover:underline"
        >
          전체보기
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="mt-4 text-center text-sm text-gray-400">
          아직 등록된 아티클이 없습니다.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {recent.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800 line-clamp-1">
                  {a.title}
                </span>
                <span className="shrink-0 rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] text-primary-600">
                  {a.category}
                </span>
              </div>
              {a.isPremium && (
                <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                  PRO
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    active: { label: "진행중", cls: "bg-blue-100 text-blue-700" },
    hit_target: { label: "목표 달성", cls: "bg-emerald-100 text-emerald-700" },
    hit_stoploss: { label: "손절", cls: "bg-red-100 text-red-700" },
    holding: { label: "홀딩", cls: "bg-amber-100 text-amber-700" },
  };
  const c = config[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${c.cls}`}
    >
      {c.label}
    </span>
  );
}
