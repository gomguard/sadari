"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Newspaper,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/signals", label: "시그널 관리", icon: BarChart3 },
  { href: "/admin/daily", label: "데일리 매크로", icon: Newspaper },
  { href: "/admin/articles", label: "웹진 아티클", icon: BookOpen },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
