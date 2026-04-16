"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
import { ArrowLeft, Heart, Send } from "lucide-react";

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

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<FirestoreCommunityPost | null>(null);
  const [comments, setComments] = useState<FirestoreCommunityComment[]>([]);
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        <p className="text-sm text-gray-400">로딩 중...</p>
      </main>
    );
  }

  const style = categoryStyle[post.category] ?? categoryStyle["자유"];

  return (
    <main className="pb-32">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link
          href="/community"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">게시글</h1>
      </header>

      {/* Post content */}
      <section className="px-5">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}
            >
              {post.category}
            </span>
            <span className="text-[11px] text-gray-400">
              {timeAgo(post.createdAt as unknown as { seconds: number; nanoseconds: number })}
            </span>
          </div>
          <h2 className="mt-2 text-base font-bold text-gray-900 leading-snug">
            {post.title}
          </h2>
          <p className="mt-1 text-[11px] text-gray-400">{post.nickname}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {post.content}
          </p>

          {/* Like button */}
          <div className="mt-4 border-t border-gray-100 pt-3">
            <button
              onClick={handleLikePost}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs text-gray-500 transition-colors hover:border-red-200 hover:text-red-500 active:bg-red-50"
            >
              <Heart className="h-3.5 w-3.5" />
              좋아요 {post.likes > 0 && post.likes}
            </button>
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="mt-4 px-5">
        <h3 className="mb-3 text-sm font-bold text-gray-900">
          댓글 {post.commentCount > 0 && `${post.commentCount}`}
        </h3>
        {comments.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">
            첫 댓글을 남겨보세요
          </p>
        )}
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span className="font-medium text-gray-600">{c.nickname}</span>
                <span>
                  {timeAgo(c.createdAt as unknown as { seconds: number; nanoseconds: number })}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                {c.content}
              </p>
              <button
                onClick={() => handleLikeComment(c.id!)}
                className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500"
              >
                <Heart className="h-3 w-3" />
                {c.likes > 0 && c.likes}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky comment input */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-20 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-300"
          />
          <input
            type="text"
            placeholder="댓글을 입력하세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitComment();
            }}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-300"
          />
          <button
            onClick={handleSubmitComment}
            disabled={submitting || !commentText.trim()}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-opacity disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </main>
  );
}
