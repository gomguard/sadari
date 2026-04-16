"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirestoreCommunityPost } from "@/lib/firestore";
import { Heart, MessageCircle, Pencil } from "lucide-react";

type Category = "전체" | "자유" | "질문" | "종목토론" | "수익인증";

const categories: Category[] = ["전체", "자유", "질문", "종목토론", "수익인증"];

const categoryStyle: Record<string, { bg: string; text: string }> = {
  자유: { bg: "bg-gray-100", text: "text-gray-600" },
  질문: { bg: "bg-blue-50", text: "text-blue-600" },
  종목토론: { bg: "bg-emerald-50", text: "text-emerald-600" },
  수익인증: { bg: "bg-amber-50", text: "text-amber-600" },
};

function timeAgo(ts: { seconds: number; nanoseconds: number } | null): string {
  if (!ts) return "";
  const now = Date.now();
  const diff = now - ts.seconds * 1000;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<FirestoreCommunityPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("전체");

  useEffect(() => {
    const postsCol = collection(db, "communityPosts");
    const constraints =
      activeCategory === "전체"
        ? [orderBy("createdAt", "desc")]
        : [where("category", "==", activeCategory), orderBy("createdAt", "desc")];

    const q = query(postsCol, ...constraints);

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FirestoreCommunityPost[];
      setPosts(data);
    });

    return () => unsub();
  }, [activeCategory]);

  return (
    <main className="pb-28">
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-xl font-bold text-gray-900">커뮤니티</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          익명으로 자유롭게 소통하세요
        </p>
      </header>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="space-y-3 px-5 py-2">
        {posts.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">
            아직 게시글이 없습니다
          </div>
        )}
        {posts.map((post) => {
          const style = categoryStyle[post.category] ?? categoryStyle["자유"];
          return (
            <Link key={post.id} href={`/community/${post.id}`}>
              <article className="overflow-hidden rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition-colors active:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}
                  >
                    {post.category}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-gray-900 leading-snug">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {post.content}
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{post.nickname}</span>
                  <span>{timeAgo(post.createdAt as unknown as { seconds: number; nanoseconds: number })}</span>
                  <span className="ml-auto flex items-center gap-0.5">
                    <Heart className="h-3 w-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle className="h-3 w-3" />
                    {post.commentCount}
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* Floating write button */}
      <Link
        href="/community/write"
        className="fixed right-5 bottom-24 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Pencil className="h-5 w-5" />
      </Link>
    </main>
  );
}
