"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approvePayment } from "@/app/actions/payment";

interface Payment { id: string; planName: string; amount: number; status: string; days: number; note: string; createdAt: string; }

export default function UserPaymentHistory({ userId }: { userId: string }) {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    if (payments) { setOpen(!open); return; }
    setLoading(true);
    const r = await fetch(`/api/admin/user/${userId}/payments`);
    const d = await r.json();
    setPayments(d);
    setOpen(true);
    setLoading(false);
  }

  async function handleApprove(paymentId: string) {
    if (!confirm("Duyệt và cấp VIP cho user này?")) return;
    const result = await approvePayment(paymentId);
    if (result.success) {
      const r = await fetch(`/api/admin/user/${userId}/payments`);
      setPayments(await r.json());
      router.refresh();
    }
  }

  const statusColor = (s: string) => s === "SUCCESS" ? "text-green-400" : s === "PENDING" ? "text-yellow-400" : "text-red-400";
  const statusLabel = (s: string) => s === "SUCCESS" ? "Thành công" : s === "PENDING" ? "Chờ duyệt" : "Thất bại";

  return (
    <div>
      <button onClick={load} className="text-xs text-blue-400 hover:text-blue-300">
        {loading ? "..." : open ? "Ẩn lịch sử" : "Lịch sử nạp"}
      </button>
      {open && payments && (
        <div className="mt-2 rounded-lg border border-[#2a2a4a] bg-[#0f0f23] p-2">
          {payments.length === 0 ? (
            <p className="text-xs text-gray-500 p-2">Chưa có giao dịch</p>
          ) : (
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500"><th className="px-2 py-1 text-left">Gói</th><th className="px-2 py-1 text-left">Số tiền</th><th className="px-2 py-1 text-left">Trạng thái</th><th className="px-2 py-1 text-left">Ngày</th><th className="px-2 py-1"></th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-t border-[#2a2a4a]">
                    <td className="px-2 py-1 text-gray-300">{p.planName || p.days + " ngày"}</td>
                    <td className="px-2 py-1 text-gray-300">{p.amount.toLocaleString("vi-VN")}đ</td>
                    <td className={`px-2 py-1 ${statusColor(p.status)}`}>{statusLabel(p.status)}</td>
                    <td className="px-2 py-1 text-gray-500">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="px-2 py-1">
                      {p.status === "PENDING" && (
                        <button onClick={() => handleApprove(p.id)} className="rounded bg-green-600 px-2 py-0.5 text-[10px] text-white hover:bg-green-700">Duyệt</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
