"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  likePost,
  addComment,
  likeComment,
  type FirestoreCommunityPost,
  type FirestoreCommunityComment,
} from "@/lib/firestore";
import { ArrowLeft, Heart, Send, MoreHorizontal } from "lucide-react";

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<FirestoreCommunityPost | null>(null);
  const [comments, setComments] = useState<FirestoreCommunityComment[]>([]);
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  // Real-time post listener
  useEffect(() => {
    if (!postId) return;
    const unsub = onSnapshot(doc(db, "communityPosts", postId), (snap) => {
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() } as FirestoreCommunityPost);
      }
    });
    return () => unsub();
  }, [postId]);

  // Real-time comments listener
  useEffect(() => {
    if (!postId) return;
    const q = query(
      collection(db, "communityComments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as FirestoreCommunityComment
        )
      );
    });
    return () => unsub();
  }, [postId]);

  const handleLikePost = async () => {
    if (!postId) return;
    setLiked(true);
    await likePost(postId);
  };

  const handleLikeComment = async (commentId: string) => {
    await likeComment(commentId);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const finalNickname =
        nickname.trim() || `익명${Math.floor(Math.random() * 9000) + 1000}`;
      await addComment({
        postId,
        nickname: finalNickname,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <p className="text-[13px] text-gray-400">로딩 중...</p>
        </div>
      </main>
    );
  }

  const profileColor = getProfileColor(post.nickname);
  const initial = post.nickname.charAt(0);
  const catStyle = categoryColor[post.category] ?? categoryColor["자유"];

  return (
    <main className="pb-32">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900" />
        </button>
        <h1 className="text-[15px] font-semibold text-gray-900">스레드</h1>
        <div className="w-9" />
      </header>

      {/* Post */}
      <section className="px-4 pt-4">
        {/* Author */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white text-[14px] font-bold ${profileColor}`}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-gray-900">
                  {post.nickname}
                </span>
                <span className="text-[12px] text-gray-400">
                  {timeAgo(post.createdAt as unknown as { seconds: number; nanoseconds: number })}
                </span>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Title + Content */}
            <h2 className="mt-1 text-[16px] font-bold text-gray-900 leading-snug">
              {post.title}
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700">
              {post.content}
            </p>

            {/* Category tag */}
            <span
              className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${catStyle}`}
            >
              {post.category}
            </span>

            {/* Like button */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleLikePost}
                className="flex items-center gap-1.5 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    liked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
                  }`}
                />
                {post.likes > 0 && (
                  <span className={`text-[13px] ${liked ? "text-red-500" : "text-gray-400"}`}>
                    {post.likes}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="mx-4 mt-4 border-b border-gray-100" />

      {/* Comments */}
      <section className="px-4 pt-4">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-4">
          댓글 {post.commentCount > 0 && `${post.commentCount}개`}
        </h3>
        {comments.length === 0 && (
          <p className="py-10 text-center text-[13px] text-gray-400">
            첫 댓글을 남겨보세요
          </p>
        )}
        <div>
          {comments.map((c) => {
            const cColor = getProfileColor(c.nickname);
            const cInitial = c.nickname.charAt(0);
            return (
              <div
                key={c.id}
                className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0"
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold ${cColor}`}
                >
                  {cInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-gray-900">
                      {c.nickname}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {timeAgo(c.createdAt as unknown as { seconds: number; nanoseconds: number })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-gray-700">
                    {c.content}
                  </p>
                  <button
                    onClick={() => handleLikeComment(c.id!)}
                    className="mt-1.5 flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    {c.likes > 0 && (
                      <span className="text-[11px]">{c.likes}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sticky comment input */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-16 flex-shrink-0 rounded-full bg-gray-100 px-3 py-2 text-[12px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-gray-200 transition-colors"
            />
            <div className="flex flex-1 items-center rounded-full bg-gray-100 px-3 py-2">
              <input
                type="text"
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmitComment();
                }}
                className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none"
              />
              <button
                onClick={handleSubmitComment}
                disabled={submitting || !commentText.trim()}
                className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-opacity disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
