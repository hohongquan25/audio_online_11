"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { registerSchema } from "@/lib/validations";

export default function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: (formData.get("name") as string) || undefined,
    };

    // Client-side validation
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of parsed.error.issues) {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const result = await registerUser(data);

    if (!result.success) {
      setGeneralError(result.message);
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Tên hiển thị
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          placeholder="Nhập tên của bạn (tùy chọn)"
        />
      </div>

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
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
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
          placeholder="Tối thiểu 6 ký tự"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {generalError && (
        <p className="text-sm text-red-600">{generalError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Đang xử lý..." : "Đăng ký"}
      </button>
    </form>
  );
}
