import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Đăng ký - TruyệnAudio" };

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-[#2a2a4a] bg-[#0f0f23]/90 p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-gray-400">Tạo tài khoản để trải nghiệm TruyệnAudio</p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">Đăng nhập</Link>
      </p>
    </div>
  );
}
