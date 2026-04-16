"use client";

import { useState } from "react";
import { signInWithKakao, signInWithGoogle } from "@/lib/auth";
import { X } from "lucide-react";

interface LoginModalProps {
  onClose?: () => void;
  /** true이면 닫기 버튼을 숨깁니다 (AuthGuard에서 사용) */
  persistent?: boolean;
}

export default function LoginModal({
  onClose,
  persistent = false,
}: LoginModalProps) {
  const [loading, setLoading] = useState<"kakao" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleKakao() {
    setLoading("kakao");
    setError(null);
    try {
      await signInWithKakao();
      onClose?.();
    } catch {
      setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setLoading("google");
    setError(null);
    try {
      await signInWithGoogle();
      onClose?.();
    } catch {
      setError("구글 로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        {/* 닫기 버튼 */}
        {!persistent && onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* 로고 / 타이틀 */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">사다리</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            시그널과 프리미엄 콘텐츠를 보려면
            <br />
            로그인하세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-xs text-red-600">
            {error}
          </div>
        )}

        {/* 로그인 버튼들 */}
        <div className="space-y-3">
          {/* 카카오 로그인 */}
          <button
            onClick={handleKakao}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-60"
            style={{ backgroundColor: "#FEE500", color: "#191919" }}
          >
            {/* 카카오 아이콘 */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 0.5C4.029 0.5 0 3.636 0 7.514C0 9.968 1.558 12.128 3.932 13.398L2.933 17.044C2.845 17.367 3.213 17.624 3.496 17.437L7.873 14.477C8.242 14.507 8.617 14.528 9 14.528C13.971 14.528 18 11.392 18 7.514C18 3.636 13.971 0.5 9 0.5Z"
                fill="#191919"
              />
            </svg>
            {loading === "kakao" ? "로그인 중..." : "카카오로 시작하기"}
          </button>

          {/* 구글 로그인 */}
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-60"
          >
            {/* 구글 아이콘 */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            {loading === "google" ? "로그인 중..." : "Google로 시작하기"}
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
          로그인 시{" "}
          <span className="underline">서비스 이용약관</span> 및{" "}
          <span className="underline">개인정보 처리방침</span>에 동의합니다.
        </p>
      </div>
    </div>
  );
}
