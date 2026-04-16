"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { getUserProfile, saveUserProfile } from "@/lib/firestore";
import { ArrowLeft, LogOut, Bell, Crown } from "lucide-react";

const SECTOR_OPTIONS = [
  "반도체",
  "바이오",
  "조선",
  "화장품",
  "2차전지",
  "로봇",
  "변압기",
  "식료품",
];

export default function MyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [nickname, setNickname] = useState("");
  const [contact, setContact] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [notificationOn, setNotificationOn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing profile from Firestore
  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }

    async function loadProfile() {
      try {
        const profile = await getUserProfile(user!.uid);
        if (profile) {
          setNickname(profile.nickname || user!.displayName || "");
          setContact(profile.contact || "");
          setSectors(profile.sectors || []);
        } else {
          setNickname(user!.displayName || "");
        }
      } catch {
        setNickname(user!.displayName || "");
      } finally {
        setFetching(false);
      }
    }

    loadProfile();
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading || fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!user) return null;

  const toggleSector = (sector: string) => {
    setSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveUserProfile(user.uid, {
        nickname,
        contact,
        sectors,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("프로필 저장 에러:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      // ignore
    } finally {
      setLoggingOut(false);
    }
  };

  const creationDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "알 수 없음";

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">마이페이지</h1>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Profile Section */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "프로필"}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-xl font-bold text-white ring-2 ring-gray-100">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900">
                {user.displayName || "사용자"}
              </p>
              <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                카카오 로그인됨
              </span>
              <p className="mt-1.5 text-xs text-gray-400">
                가입일: {creationDate}
              </p>
            </div>
          </div>
        </section>

        {/* Editable Info Form */}
        <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-900">내 정보 수정</h2>

          {/* 닉네임 */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400 focus:bg-white"
            />
          </div>

          {/* 전화번호 */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              전화번호
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400 focus:bg-white"
            />
          </div>

          {/* 관심 섹터 */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-gray-500">
              관심 섹터
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_OPTIONS.map((sector) => {
                const selected = sectors.includes(sector);
                return (
                  <button
                    key={sector}
                    onClick={() => toggleSector(sector)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {sector}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "저장 중..." : saved ? "저장 완료!" : "저장하기"}
          </button>
        </section>

        {/* Settings Section */}
        <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-900">설정</h2>

          {/* 알림 설정 */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">알림 설정</span>
            </div>
            <button
              onClick={() => setNotificationOn(!notificationOn)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notificationOn ? "bg-gray-900" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notificationOn ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 멤버십 등급 */}
          <div className="flex items-center justify-between border-t border-gray-100 py-3 mt-2">
            <div className="flex items-center gap-3">
              <Crown className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">멤버십 등급</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                일반 회원
              </span>
              <p className="text-[10px] text-gray-400">프리미엄 준비 중</p>
            </div>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    </div>
  );
}
