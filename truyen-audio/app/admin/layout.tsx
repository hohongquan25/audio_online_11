import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

const adminNavLinks = [
  { href: "/admin/stories", label: "Truyện" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/vip-plans", label: "Gói VIP" },
  { href: "/admin/notifications", label: "Thông báo" },
  { href: "/admin/settings", label: "Cài đặt" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f23]">
      {/* Admin header */}
      <header className="border-b border-[#2a2a4a] bg-[#0f0f23]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-red-600">
              Admin Panel
            </Link>
            <nav aria-label="Admin navigation" className="hidden items-center gap-4 md:flex">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Về trang chính
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
