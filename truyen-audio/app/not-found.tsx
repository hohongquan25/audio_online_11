import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-gray-300 dark:text-gray-700">
        404
      </div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Không tìm thấy trang
      </h1>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
