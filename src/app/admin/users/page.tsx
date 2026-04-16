"use client";

import { useEffect, useState } from "react";
import { Search, ShieldOff, ShieldCheck, UserX } from "lucide-react";
import {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  deleteUserProfile,
  getPosts,
  type FirestoreUserProfile,
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

interface UserWithPostCount extends FirestoreUserProfile {
  postCount: number;
  suspended?: boolean;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserWithPostCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const [allUsers, allPosts] = await Promise.all([
        getAllUsers(),
        getPosts(),
      ]);

      // Count posts per nickname
      const postCountMap: Record<string, number> = {};
      for (const post of allPosts) {
        const nick = post.nickname;
        postCountMap[nick] = (postCountMap[nick] || 0) + 1;
      }

      const usersWithCounts: UserWithPostCount[] = allUsers.map((u) => ({
        ...u,
        postCount: postCountMap[u.nickname] || 0,
        suspended: (u as unknown as Record<string, unknown>).suspended === true,
      }));

      setUsers(usersWithCounts);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("회원 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend(uid: string) {
    const user = users.find((u) => u.uid === uid);
    if (!user) return;

    if (user.suspended) {
      if (!confirm(`${user.nickname} 회원의 정지를 해제하시겠습니까?`)) return;
      try {
        await unsuspendUser(uid);
        setUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, suspended: false } : u))
        );
      } catch (err) {
        console.error("Failed to unsuspend user:", err);
        setError("정지 해제에 실패했습니다.");
      }
    } else {
      if (!confirm(`${user.nickname} 회원을 정지 처리하시겠습니까?`)) return;
      try {
        await suspendUser(uid);
        setUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, suspended: true } : u))
        );
      } catch (err) {
        console.error("Failed to suspend user:", err);
        setError("정지 처리에 실패했습니다.");
      }
    }
  }

  async function handleDelete(uid: string) {
    const user = users.find((u) => u.uid === uid);
    if (!user) return;
    if (
      !confirm(
        `${user.nickname} 회원을 탈퇴 처리하시겠습니까?\nFirestore 프로필만 삭제되며, Firebase Auth 계정 삭제는 서버(Admin SDK)에서 별도 처리가 필요합니다.`
      )
    )
      return;

    try {
      setError(null);
      // NOTE: Firebase Auth 계정은 클라이언트에서 삭제할 수 없습니다.
      // Firebase Admin SDK를 사용하는 서버 API를 통해 별도로 삭제해야 합니다.
      await deleteUserProfile(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("탈퇴 처리에 실패했습니다.");
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

  const filteredUsers = searchQuery
    ? users.filter((u) =>
        u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-gray-500">회원 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          전체 회원 {users.length}명
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="닉네임 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">
            회원 목록 ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">
              {searchQuery
                ? "검색 결과가 없습니다."
                : "등록된 회원이 없습니다."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                  <th className="px-5 py-3 font-medium">프로필</th>
                  <th className="px-5 py-3 font-medium">닉네임</th>
                  <th className="px-5 py-3 font-medium">연락처</th>
                  <th className="px-5 py-3 font-medium">관심섹터</th>
                  <th className="px-5 py-3 font-medium">가입일</th>
                  <th className="px-5 py-3 font-medium text-center">
                    게시글수
                  </th>
                  <th className="px-5 py-3 font-medium text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className={`transition-colors hover:bg-gray-50 ${
                      user.suspended ? "bg-red-50/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                        {user.nickname?.charAt(0) || "?"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {user.nickname}
                        </span>
                        {user.suspended && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            정지
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {user.contact || "-"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.sectors && user.sectors.length > 0 ? (
                          user.sectors.map((sector) => (
                            <span
                              key={sector}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                            >
                              {sector}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {formatDate(user.updatedAt)}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {user.postCount}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSuspend(user.uid)}
                          className={`rounded-lg p-2 transition-colors ${
                            user.suspended
                              ? "text-green-500 hover:bg-green-50"
                              : "text-amber-500 hover:bg-amber-50"
                          }`}
                          title={
                            user.suspended ? "정지 해제" : "회원 정지"
                          }
                        >
                          {user.suspended ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="탈퇴 처리"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
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
