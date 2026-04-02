"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    await requestPasswordReset({ email });
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-green-900/20 border border-green-500/30 p-4 text-sm text-green-300">
          <p className="font-medium">Đã gửi yêu cầu!</p>
          <p className="mt-1 text-green-400/80">Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư!</p>
         
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input id="email" name="email" type="email" required
          className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          placeholder="you@example.com" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
        {loading ? "Đang xử lý..." : "Gửi link đặt lại mật khẩu"}
      </button>
    </form>
  );
}
