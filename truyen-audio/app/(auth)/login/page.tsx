import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Đăng nhập - TruyệnAudio" };

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-[#2a2a4a] bg-[#0f0f23]/90 p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Đăng nhập</h1>
        <p className="mt-1 text-sm text-gray-400">Đăng nhập để tiếp tục nghe truyện</p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 space-y-2 text-center">
        <p className="text-sm text-gray-500">
          <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">Quên mật khẩu?</Link>
        </p>
        <p className="text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-purple-400 hover:text-purple-300">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
