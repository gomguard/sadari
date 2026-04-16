"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { LogOut, User } from "lucide-react";
import LoginModal from "./LoginModal";

export default function UserMenu() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // 로딩 중
  if (loading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
    );
  }

  // 비로그인 상태
  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
        >
          로그인
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  // 로그인 상태
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
    } catch {
      // 에러 무시
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* 프로필 이미지 또는 이니셜 — 클릭 시 마이페이지 이동 */}
      <Link href="/mypage" className="flex-shrink-0">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "프로필"}
            className="h-8 w-8 rounded-full object-cover transition-opacity hover:opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-xs font-bold text-white transition-opacity hover:opacity-80">
            {user.displayName?.charAt(0) || <User className="h-4 w-4" />}
          </div>
        )}
      </Link>

      {/* 이름 — 클릭 시 마이페이지 이동 */}
      <Link
        href="/mypage"
        className="max-w-[80px] truncate text-xs font-medium text-gray-700 transition-colors hover:text-gray-900"
      >
        {user.displayName || "사용자"}
      </Link>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        title="로그아웃"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
