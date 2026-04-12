import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VipPlans from "./VipPlans";

export default async function VipPage() {
  const session = await auth();

  const [plans, siteSettings] = await Promise.all([
    prisma.vipPlan.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ]);

  const user = session?.user ? {
    id: session.user.id,
    role: session.user.role,
    vipExpiredAt: session.user.vipExpiredAt ? new Date(session.user.vipExpiredAt).toISOString() : null,
    code: session.user.code || "",
  } : null;

  // QR code info from site settings
  const qrInfo = {
    bankName: "TP Bank",
    accountNumber: "93250111289",
    accountName: "HO HONG QUAN",
    qrImage: "https://img.vietqr.io/image/970423-93250111289-compact2.png",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">👑 Nâng cấp VIP</h1>
        <p className="mt-2 text-gray-400">Mở khóa toàn bộ nội dung truyện audio</p>
      </div>
      <VipPlans user={user} plans={plans.map(p => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }))} qrInfo={qrInfo} />
    </div>
  );
}
