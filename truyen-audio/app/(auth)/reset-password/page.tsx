import Link from "next/link";
import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Đặt lại mật khẩu - TruyệnAudio" };

export default function ResetPasswordPage() {
  return (
    <div className="rounded-2xl border border-[#2a2a4a] bg-[#0f0f23]/90 p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Đặt lại mật khẩu</h1>
        <p className="mt-1 text-sm text-gray-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">Quay lại đăng nhập</Link>
      </p>
    </div>
  );
}
