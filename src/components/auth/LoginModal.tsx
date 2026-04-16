"use client";

import { useState } from "react";
import { signInWithKakao } from "@/lib/auth";
import { X } from "lucide-react";

interface LoginModalProps {
  onClose?: () => void;
  persistent?: boolean;
}

export default function LoginModal({
  onClose,
  persistent = false,
}: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleKakao() {
    setLoading(true);
    setError(null);
    try {
      await signInWithKakao();
      onClose?.();
    } catch {
      setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      {/* 배경 클릭 시 닫기 */}
      {!persistent && onClose && (
        <div className="absolute inset-0" onClick={onClose} />
      )}

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-white px-6 pb-10 pt-4 shadow-2xl">
        {/* 핸들 바 */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

        {/* 닫기 버튼 */}
        {!persistent && onClose && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* 로고 */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">사다리</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            시그널과 프리미엄 콘텐츠를 보려면
            <br />
            카카오로 시작하세요
          </p>
        </div>

        {/* 에러 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-xs text-red-600">
            {error}
          </div>
        )}

        {/* 카카오 로그인 */}
        <button
          onClick={handleKakao}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-[15px] font-semibold transition-all hover:brightness-95 disabled:opacity-60"
          style={{ backgroundColor: "#FEE500", color: "#191919" }}
        >
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
          {loading ? "로그인 중..." : "카카오로 시작하기"}
        </button>

        {/* 하단 안내 */}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-gray-400">
          로그인 시{" "}
          <span className="underline">서비스 이용약관</span> 및{" "}
          <span className="underline">개인정보 처리방침</span>에 동의합니다.
        </p>
      </div>
    </div>
  );
}
