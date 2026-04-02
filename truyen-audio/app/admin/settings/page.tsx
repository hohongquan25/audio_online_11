"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "@/app/actions/settings";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    heroBackground: "",
    heroTitle: "",
    heroSubtitle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          heroBackground: data.heroBackground || "",
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await updateSiteSettings(form);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    setSaving(false);
  }

  if (loading) {
    return <div className="text-gray-400">Đang tải...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Cài đặt trang chủ</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Background */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Ảnh nền Hero (URL)
          </label>
          <input
            type="url"
            value={form.heroBackground}
            onChange={(e) => setForm((f) => ({ ...f, heroBackground: e.target.value }))}
            placeholder="https://example.com/hero-bg.jpg"
            className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">Để trống nếu muốn dùng gradient mặc định</p>

          {/* Preview */}
          {form.heroBackground && (
            <div className="mt-3 overflow-hidden rounded-lg border border-[#2a2a4a]">
              <div className="relative h-40 w-full">
                <img
                  src={form.heroBackground}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-white/80">Preview ảnh nền</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Tiêu đề Hero
          </label>
          <input
            type="text"
            value={form.heroTitle}
            onChange={(e) => setForm((f) => ({ ...f, heroTitle: e.target.value }))}
            placeholder="Nghe truyện độc quyền mọi lúc, mọi nơi"
            className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Hero Subtitle */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Mô tả Hero
          </label>
          <textarea
            value={form.heroSubtitle}
            onChange={(e) => setForm((f) => ({ ...f, heroSubtitle: e.target.value }))}
            rows={3}
            placeholder="Khám phá hàng ngàn tập truyện audio..."
            className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {message && (
          <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </button>
      </form>
    </div>
  );
}
