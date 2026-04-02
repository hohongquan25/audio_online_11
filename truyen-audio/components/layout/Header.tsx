"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { href: "/", label: "Trang chủ", icon: "🏠" },
  { href: "/stories", label: "Danh sách truyện", icon: "📚" },
  { href: "/community", label: "Cộng đồng", icon: "👥" },
  { href: "/vip", label: "VIP", icon: "👑" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--bg-card-border)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold text-white">TruyệnAudio</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(link.href)
                  ? "bg-purple-600/20 text-purple-300"
                  : "text-gray-400 hover:bg-[#1a1a2e] hover:text-white"
              )}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
              pathname.startsWith("/admin") ? "bg-red-600/20 text-red-300" : "text-red-400 hover:bg-[#1a1a2e] hover:text-red-300"
            )}>
              <span className="text-base">⚙️</span>
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 md:flex">
          <NotificationBell />
          {status === "loading" ? (
            <span className="h-8 w-20 animate-pulse rounded bg-[#2a2a4a]" />
          ) : user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white">Đăng nhập</Link>
              <Link href="/register" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">Đăng ký</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          <button type="button" onClick={() => setMobileOpen((v) => !v)} className="rounded-md p-2 text-gray-400 hover:bg-[#2a2a4a]" aria-label="Menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("border-t border-[#2a2a4a] md:hidden", mobileOpen ? "block" : "hidden")}>
        <nav className="space-y-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium", isActive(link.href) ? "bg-purple-600/20 text-purple-300" : "text-gray-400 hover:bg-[#1a1a2e] hover:text-white")}>
              <span>{link.icon}</span><span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-[#2a2a4a] px-4 py-3">
          {user ? (
            <div className="space-y-2">
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white">{(user.email?.[0] ?? "U").toUpperCase()}</span>
                <span className="truncate">{user.email}</span>
              </Link>
              <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full rounded-lg bg-[#2a2a4a] px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#3a3a5a]">Đăng xuất</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-center text-sm text-gray-300 hover:bg-[#1a1a2e]">Đăng nhập</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-purple-700">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
