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
  } : null;

  // QR code info from site settings (we'll use a placeholder)
  const qrInfo = {
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "NGUYEN VAN A",
    qrImage: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETCOMBANK-1234567890-NGUYEN-VAN-A",
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
