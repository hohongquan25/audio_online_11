"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");
  const errorParam = searchParams.get("error");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorParam === "banned") {
      setError("Tài khoản của bạn đã bị chặn. Vui lòng liên hệ admin để biết thêm chi tiết.");
    }
  }, [errorParam]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    console.log('[LoginForm] Form submitted');
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log('[LoginForm] Attempting login for:', email);

    // Check if user is banned first
    try {
      const checkResponse = await fetch("/api/auth/check-banned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const { banned } = await checkResponse.json();
      
      if (banned) {
        setError("Tài khoản của bạn đã bị chặn. Vui lòng liên hệ admin để biết thêm chi tiết.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('[LoginForm] Error checking banned status:', err);
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.log('[LoginForm] Login error:', result.error);
      setError("Email hoặc mật khẩu không đúng");
      setLoading(false);
      return;
    }

    console.log('[LoginForm] Login successful, redirecting...');
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {registered && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          Đăng ký thành công! Vui lòng đăng nhập.
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          placeholder="Nhập mật khẩu"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-900/20 border border-red-500/30 p-3 text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:bg-purple-800"
        style={{ 
          minHeight: '48px',
          position: 'relative',
          zIndex: 10,
          touchAction: 'manipulation',
          pointerEvents: 'auto'
        }}
      >
        {loading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
    </form>
  );
}
