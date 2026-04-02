"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleBanUser, cancelUserVip, grantUserVip } from "@/app/actions/users";

interface VipPlan { id: string; name: string; days: number; }

export default function AdminUserActions({ userId, role, isBanned }: { userId: string; role: string; isBanned: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showVipMenu, setShowVipMenu] = useState(false);
  const [plans, setPlans] = useState<VipPlan[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load plans when menu opens
  useEffect(() => {
    if (!showVipMenu || plans.length > 0) return;
    fetch("/api/admin/vip-plans")
      .then(r => r.json())
      .then(setPlans)
      .catch(() => {});
  }, [showVipMenu, plans.length]);

  // Close on outside click
  useEffect(() => {
    if (!showVipMenu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowVipMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showVipMenu]);

  async function handleToggleBan() {
    if (!confirm(`Bạn có chắc muốn ${isBanned ? "bỏ chặn" : "chặn"} user này?`)) return;
    setLoading(true);
    await toggleBanUser(userId);
    router.refresh();
    setLoading(false);
  }

  async function handleCancelVip() {
    if (!confirm("Hủy VIP của user này?")) return;
    setLoading(true);
    await cancelUserVip(userId);
    router.refresh();
    setLoading(false);
  }

  async function handleGrantVip(planId: string) {
    setShowVipMenu(false);
    setLoading(true);
    await grantUserVip(userId, planId);
    router.refresh();
    setLoading(false);
  }

  if (role === "ADMIN") return <span className="text-xs text-gray-600">—</span>;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Grant VIP */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setShowVipMenu(!showVipMenu)}
          disabled={loading}
          className="text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
        >
          Cấp VIP ▾
        </button>
        {showVipMenu && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] py-1 shadow-xl">
            {plans.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-500">Đang tải...</p>
            ) : (
              plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => handleGrantVip(plan.id)}
                  className="block w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-[#2a2a4a] hover:text-white"
                >
                  {plan.name} ({plan.days} ngày)
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {role === "VIP" && (
        <button onClick={handleCancelVip} disabled={loading} className="text-xs text-orange-400 hover:text-orange-300 disabled:opacity-50">
          Hủy VIP
        </button>
      )}

      <button
        onClick={handleToggleBan}
        disabled={loading}
        className={`text-xs disabled:opacity-50 ${isBanned ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}`}
      >
        {isBanned ? "Bỏ chặn" : "Chặn"}
      </button>
    </div>
  );
}
