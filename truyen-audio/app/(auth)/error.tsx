"use client";

import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">⚠️</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Lỗi xác thực
      </h1>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
