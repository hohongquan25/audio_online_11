import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: "Quên mật khẩu - TruyệnAudio" };

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-[#2a2a4a] bg-[#0f0f23]/90 p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
        <p className="mt-1 text-sm text-gray-400">Nhập email để nhận link đặt lại mật khẩu</p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Nhớ mật khẩu rồi?{" "}
        <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">Đăng nhập</Link>
      </p>
    </div>
  );
}
