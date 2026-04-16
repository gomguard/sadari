"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirestoreCommunityPost } from "@/lib/firestore";
import { Heart, MessageCircle, Bookmark, Plus } from "lucide-react";

type Category = "전체" | "자유" | "질문" | "종목토론" | "수익인증";

const categories: Category[] = ["전체", "자유", "질문", "종목토론", "수익인증"];

const categoryColor: Record<string, string> = {
  자유: "text-gray-500 bg-gray-100",
  질문: "text-blue-500 bg-blue-50",
  종목토론: "text-emerald-600 bg-emerald-50",
  수익인증: "text-amber-600 bg-amber-50",
};

function getProfileColor(nickname: string): string {
  const colors = [
    "bg-rose-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
    "bg-violet-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500",
    "bg-orange-500", "bg-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(ts: { seconds: number; nanoseconds: number } | null): string {
  if (!ts) return "";
  const seconds = Math.floor((Date.now() - ts.seconds * 1000) / 1000);
  if (seconds < 60) return "방금";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
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
      {/* Header */}
      <header className="px-4 pt-14 pb-1">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">커뮤니티</h1>
      </header>

      {/* Category pills - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
              activeCategory === cat
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 active:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div>
        {posts.length === 0 && (
          <div className="py-20 text-center text-[14px] text-gray-400">
            아직 게시글이 없습니다
          </div>
        )}
        {posts.map((post) => {
          const catStyle = categoryColor[post.category] ?? categoryColor["자유"];
          const profileColor = getProfileColor(post.nickname);
          const initial = post.nickname.charAt(0);

          return (
            <Link key={post.id} href={`/community/${post.id}`} className="block">
              <article className="px-4 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-[13px] font-bold ${profileColor}`}
                  >
                    {initial}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[14px] font-semibold text-gray-900 truncate">
                      {post.nickname}
                    </span>
                    <span className="text-[12px] text-gray-400 flex-shrink-0">
                      {timeAgo(post.createdAt as unknown as { seconds: number; nanoseconds: number })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="ml-12 mt-1">
                  <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-[14px] text-gray-600 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>

                  {/* Category tag */}
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${catStyle}`}
                  >
                    {post.category}
                  </span>

                  {/* Action bar */}
                  <div className="mt-3 flex items-center gap-4">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Heart className="h-[16px] w-[16px]" />
                      {post.likes > 0 && (
                        <span className="text-[12px]">{post.likes}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <MessageCircle className="h-[16px] w-[16px]" />
                      {post.commentCount > 0 && (
                        <span className="text-[12px]">{post.commentCount}</span>
                      )}
                    </span>
                    <span className="flex items-center text-gray-400">
                      <Bookmark className="h-[16px] w-[16px]" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* Floating write button */}
      <Link
        href="/community/write"
        className="fixed right-5 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </Link>
    </main>
  );
}
