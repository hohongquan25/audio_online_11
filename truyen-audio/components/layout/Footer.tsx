import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#2a2a4a] bg-[#0a0a1a] mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-300">Trang chủ</Link>
            <Link href="/stories" className="hover:text-gray-300">Danh sách truyện</Link>
            <Link href="/community" className="hover:text-gray-300">Cộng đồng</Link>
            <Link href="/vip" className="hover:text-gray-300">VIP</Link>
          </nav>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} TruyệnAudio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
