"use client";

import { useAuth } from "@/context/AuthContext";
import LoginModal from "./LoginModal";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * 인증이 필요한 콘텐츠를 감싸는 가드 컴포넌트.
 * - 로딩 중: 스켈레톤 표시
 * - 비로그인: LoginModal 표시 (닫기 불가)
 * - 로그인 완료: children 렌더링
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  // 로딩 중 — 스켈레톤 UI
  if (loading) {
    return (
      <div className="px-5 pt-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded-lg bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-100" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-40 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 비로그인 — 로그인 모달 (닫기 불가)
  if (!user) {
    return (
      <div className="relative min-h-[60vh]">
        {/* 블러 처리된 배경 콘텐츠 (미리보기 느낌) */}
        <div className="pointer-events-none select-none blur-sm brightness-75">
          <div className="px-5 pt-12">
            <div className="space-y-4">
              <div className="h-6 w-32 rounded-lg bg-gray-200" />
              <div className="h-4 w-48 rounded bg-gray-100" />
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 rounded bg-gray-200" />
                        <div className="h-3 w-40 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <LoginModal persistent />
      </div>
    );
  }

  // 로그인 완료
  return <>{children}</>;
}
