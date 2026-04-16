"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { getPosts, deletePost } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

interface CommunityPost {
  id?: string;
  nickname: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  commentCount: number;
  createdAt: Timestamp;
}

export default function CommunityAdmin() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPosts();
      setPosts(data as CommunityPost[]);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("커뮤니티 게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      setError(null);
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `선택한 ${selectedIds.size}개의 게시글을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    )
      return;

    setDeleting(true);
    setError(null);

    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        deletePost(id)
      );
      await Promise.all(deletePromises);
      setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id!)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to bulk delete:", err);
      setError("일부 게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map((p) => p.id!)));
    }
  }

  function formatDate(ts: Timestamp | undefined): string {
    if (!ts || !ts.toDate) return "-";
    const d = ts.toDate();
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function truncateTitle(title: string, maxLen = 40): string {
    if (title.length <= maxLen) return title;
    return title.slice(0, maxLen) + "...";
  }

  const allSelected = posts.length > 0 && selectedIds.size === posts.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-gray-500">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            커뮤니티 게시글을 관리하고 모더레이션합니다.
          </p>
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting
              ? "삭제 중..."
              : `선택 삭제 (${selectedIds.size})`}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Posts table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">
            전체 게시글 ({posts.length})
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">
              아직 등록된 게시글이 없습니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-5 py-3 font-medium">제목</th>
                  <th className="px-5 py-3 font-medium">닉네임</th>
                  <th className="px-5 py-3 font-medium">카테고리</th>
                  <th className="px-5 py-3 font-medium">날짜</th>
                  <th className="px-5 py-3 font-medium text-center">좋아요</th>
                  <th className="px-5 py-3 font-medium text-center">댓글</th>
                  <th className="px-5 py-3 font-medium text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`transition-colors hover:bg-gray-50 ${
                      selectedIds.has(post.id!) ? "bg-primary-50/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post.id!)}
                        onChange={() => toggleSelect(post.id!)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="max-w-[280px] px-5 py-3">
                      <span
                        className="font-medium text-gray-900"
                        title={post.title}
                      >
                        {truncateTitle(post.title)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {post.nickname}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {post.likes ?? 0}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {post.commentCount ?? 0}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => post.id && handleDelete(post.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="게시글 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
