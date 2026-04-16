"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/firestore";
import {
  LayoutDashboard,
  BarChart3,
  Newspaper,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Database,
  Users,
  Zap,
  ShieldAlert,
} from "lucide-react";

const navItems = [
  { href: "/admin/quick", label: "빠른 발행", icon: Zap },
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/signals", label: "시그널 관리", icon: BarChart3 },
  { href: "/admin/daily", label: "데일리 매크로", icon: Newspaper },
  { href: "/admin/articles", label: "웹진 아티클", icon: BookOpen },
  { href: "/admin/community", label: "커뮤니티 관리", icon: MessageSquare },
  { href: "/admin/users", label: "회원 관리", icon: Users },
  { href: "/admin/seed", label: "샘플 데이터 시딩", icon: Database },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) return;
      if (!user) {
        setAuthorized(false);
        setChecking(false);
        return;
      }
      try {
        const admin = await isAdmin(user.uid);
        setAuthorized(admin);
      } catch {
        setAuthorized(false);
      }
      setChecking(false);
    }
    checkAdmin();
  }, [user, authLoading]);

  // 로딩 중
  if (authLoading || checking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-gray-500">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 또는 관리자 아님
  if (!user || !authorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">접근 권한 없음</h2>
          <p className="mt-2 text-sm text-gray-500">
            관리자만 접근할 수 있습니다.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
            <LayoutDashboard className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">사다리 Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary-50 font-semibold text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
