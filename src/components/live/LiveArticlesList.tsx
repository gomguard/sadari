"use client";

import { useArticles } from "@/lib/firestore-hooks";
import ArticleCard from "@/components/ui/ArticleCard";
import type { Article } from "@/components/ui/ArticleCard";
import type { FirestoreArticle } from "@/lib/firestore";

/** Firestore 아티클 → UI Article 변환 */
function toArticle(a: FirestoreArticle): Article {
  return {
    id: a.id ?? "",
    title: a.title,
    description: a.description,
    category: a.category,
    date: a.date,
    isPremium: a.isPremium,
  };
}

function ArticleSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 rounded-full bg-gray-200" />
          </div>
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
          <div className="h-3 w-16 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function LiveArticlesList({
  category,
}: {
  category?: string;
}) {
  const { data: articles, loading, error } = useArticles(category);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-400">
          아직 등록된 칼럼이 없습니다. 어드민에서 추가해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={toArticle(article)} />
      ))}
    </div>
  );
}
