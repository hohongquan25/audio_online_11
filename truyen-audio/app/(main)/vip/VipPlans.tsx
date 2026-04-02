"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPendingPayment } from "@/app/actions/payment";

interface Plan { id: string; name: string; days: number; price: number; description: string; }
interface QrInfo { bankName: string; accountNumber: string; accountName: string; qrImage: string; }

interface Props {
  user: { id: string; role: string; vipExpiredAt: string | null } | null;
  plans: Plan[];
  qrInfo: QrInfo;
}

const BENEFITS = ["Nghe không giới hạn tất cả truyện", "Không quảng cáo", "Lưu tiến trình nghe", "Hỗ trợ ưu tiên"];

export default function VipPlans({ user, plans, qrInfo }: Props) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<"select" | "qr" | "done">("select");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const isVip = user?.role === "VIP" && user.vipExpiredAt;

  function handleSelectPlan(plan: Plan) {
    if (!user) { router.push("/login?callbackUrl=/vip"); return; }
    setSelectedPlan(plan);
    setStep("qr");
  }

  async function handleConfirm() {
    if (!selectedPlan) return;
    setLoading(true);
    const result = await createPendingPayment(selectedPlan.id);
    setLoading(false);
    setMsg(result.message);
    if (result.success) setStep("done");
  }

  if (isVip) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-green-500/30 bg-green-900/10 p-8 text-center">
        <div className="mb-3 text-4xl">👑</div>
        <h2 className="text-xl font-bold text-green-300">Bạn đang là thành viên VIP</h2>
        <p className="mt-2 text-gray-400">Hết hạn: {new Date(user.vipExpiredAt!).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}</p>
        <ul className="mt-4 space-y-1 text-left text-sm text-gray-400">
          {BENEFITS.map(b => <li key={b} className="flex items-center gap-2"><span className="text-green-400">✓</span>{b}</li>)}
        </ul>
      </div>
    );
  }

  if (step === "qr" && selectedPlan) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-[#2a2a4a] bg-[#1a1a2e] p-6">
          <h2 className="mb-1 text-center text-lg font-bold text-white">Thanh toán gói {selectedPlan.name}</h2>
          <p className="mb-4 text-center text-2xl font-bold text-purple-400">{selectedPlan.price.toLocaleString("vi-VN")}đ</p>

          <div className="mb-4 flex flex-col items-center">
            <div className="rounded-xl bg-white p-3 shadow-lg">
              <img src={qrInfo.qrImage} alt="QR Code" className="h-48 w-48" />
            </div>
            <p className="mt-3 text-sm text-gray-400">Quét mã QR để chuyển khoản</p>
          </div>

          <div className="mb-4 rounded-lg bg-[#0f0f23] p-3 text-sm">
            <div className="flex justify-between py-1"><span className="text-gray-500">Ngân hàng</span><span className="font-medium text-gray-200">{qrInfo.bankName}</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-500">Số tài khoản</span><span className="font-medium text-gray-200">{qrInfo.accountNumber}</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-500">Chủ tài khoản</span><span className="font-medium text-gray-200">{qrInfo.accountName}</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-500">Số tiền</span><span className="font-bold text-purple-400">{selectedPlan.price.toLocaleString("vi-VN")}đ</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-500">Nội dung CK</span><span className="font-medium text-gray-200">VIP {selectedPlan.name}</span></div>
          </div>

          <p className="mb-4 text-center text-xs text-gray-500">Sau khi chuyển khoản, nhấn nút bên dưới. Admin sẽ xác nhận và cấp VIP trong vòng 24h.</p>

          {msg && <p className="mb-3 rounded-lg bg-green-900/20 p-2 text-center text-sm text-green-300">{msg}</p>}

          <button onClick={handleConfirm} disabled={loading}
            className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
            {loading ? "Đang xử lý..." : "✓ Tôi đã chuyển khoản"}
          </button>
          <button onClick={() => setStep("select")} className="mt-2 w-full rounded-xl border border-[#2a2a4a] py-2 text-sm text-gray-400 hover:text-white">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-purple-500/30 bg-purple-900/10 p-8 text-center">
        <div className="mb-3 text-4xl">⏳</div>
        <h2 className="text-xl font-bold text-purple-300">Đang chờ xác nhận</h2>
        <p className="mt-2 text-gray-400">{msg || "Admin sẽ xác nhận và cấp VIP cho bạn trong vòng 24h."}</p>
        <button onClick={() => setStep("select")} className="mt-4 rounded-xl border border-[#2a2a4a] px-6 py-2 text-sm text-gray-400 hover:text-white">
          Xem các gói khác
        </button>
      </div>
    );
  }

  return (
    <>
      {msg && <p className="mb-4 text-center text-sm text-red-400">{msg}</p>}
      {plans.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có gói VIP nào. Vui lòng quay lại sau.</p>
      ) : (
        <div className={`grid gap-6 ${plans.length === 1 ? "max-w-sm mx-auto" : plans.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {plans.map((plan, i) => {
            const isPopular = plans.length >= 3 && i === 1;
            return (
              <div key={plan.id} className={`relative flex flex-col rounded-2xl border p-6 transition hover:shadow-lg ${isPopular ? "border-purple-600 ring-2 ring-purple-600/30" : "border-[#2a2a4a] hover:border-purple-600/50"}`}>
                {isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-semibold text-white">Phổ biến</span>}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.days} ngày</p>
                <div className="my-4">
                  <span className="text-3xl font-bold text-purple-400">{plan.price.toLocaleString("vi-VN")}đ</span>
                </div>
                {plan.description && <p className="mb-4 text-sm text-gray-400">{plan.description}</p>}
                <ul className="mb-6 flex-1 space-y-2 text-sm text-gray-400">
                  {BENEFITS.map(b => <li key={b} className="flex items-center gap-2"><span className="text-green-400">✓</span>{b}</li>)}
                </ul>
                <button onClick={() => handleSelectPlan(plan)}
                  className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition ${isPopular ? "bg-purple-600 hover:bg-purple-700" : "bg-[#2a2a4a] hover:bg-purple-600"}`}>
                  Đăng ký ngay
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
