"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, BookOpen, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/feed", label: "피드", icon: Newspaper },
  { href: "/webzine", label: "웹진", icon: BookOpen },
  { href: "/signals", label: "시그널", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "text-primary-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
