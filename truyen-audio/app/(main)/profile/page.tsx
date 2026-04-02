import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDuration, VIP_PLANS } from "@/lib/utils";
import type { PlanType } from "@/lib/utils";
import SignOutButton from "@/components/profile/SignOutButton";

const ic = "rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-5";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const tab = params.tab || "history";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      listeningHistory: {
        include: { episode: { include: { story: true } } },
        orderBy: { updatedAt: "desc" },
      },
      payments: { orderBy: { createdAt: "desc" } },
      favorites: {
        include: { story: { select: { id: true, title: true, slug: true, coverImage: true, isVip: true, avgRating: true, _count: { select: { episodes: true } } } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const isVip = user.role === "VIP" && user.vipExpiredAt && user.vipExpiredAt > new Date();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* User info card */}
      <div className={`${ic} mb-6 flex items-center gap-4`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white">
          {(user.name?.[0] ?? user.email[0]).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{user.name ?? user.email}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <RoleBadge role={user.role} />
            <span className="text-xs text-gray-600">Tham gia {formatDate(user.createdAt)}</span>
          </div>
        </div>
        {isVip && user.vipExpiredAt && (
          <div className="text-right">
            <p className="text-xs text-gray-500">VIP hết hạn</p>
            <p className="text-sm font-medium text-purple-400">{formatDate(user.vipExpiredAt)}</p>
          </div>
        )}
        {!isVip && (
          <Link href="/vip" className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
            Nâng cấp VIP
          </Link>
        )}
        <SignOutButton />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-[#2a2a4a] pb-0">
        {[
          { key: "history", label: "🎧 Lịch sử nghe" },
          { key: "favorites", label: "❤️ Theo dõi" },
          { key: "payments", label: "💳 Thanh toán" },
        ].map(t => (
          <Link key={t.key} href={`/profile?tab=${t.key}`}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${tab === t.key ? "border-b-2 border-purple-600 text-purple-400" : "text-gray-500 hover:text-gray-300"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab: Listening history */}
      {tab === "history" && (
        <div>
          {user.listeningHistory.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Bạn chưa nghe truyện nào.</p>
          ) : (
            <div className="space-y-3">
              {user.listeningHistory.map((h: any) => {
                const pct = h.episode.duration > 0 ? Math.min((h.progressSeconds / h.episode.duration) * 100, 100) : 0;
                return (
                  <Link key={h.id} href={`/stories/${h.episode.story.slug}`} className={`${ic} flex items-center gap-4 hover:border-purple-600/50 transition`}>
                    <img src={h.episode.story.coverImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-200">{h.episode.story.title}</p>
                      <p className="truncate text-xs text-gray-500">{h.episode.title}</p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-[#2a2a4a]">
                        <div className="h-full rounded-full bg-purple-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{formatDuration(h.progressSeconds)}</p>
                      <p className="text-xs text-gray-600">{Math.round(pct)}%</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Favorites */}
      {tab === "favorites" && (
        <div>
          {user.favorites.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">Bạn chưa theo dõi truyện nào.</p>
              <Link href="/stories" className="mt-3 inline-block text-sm text-purple-400 hover:text-purple-300">Khám phá truyện →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {user.favorites.map((fav: any) => (
                <Link key={fav.id} href={`/stories/${fav.story.slug}`}
                  className="group overflow-hidden rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] transition hover:border-purple-600/50">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#2a2a4a]">
                    <img src={fav.story.coverImage} alt={fav.story.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    {fav.story.isVip && (
                      <span className="absolute top-2 left-2 rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">VIP</span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-gray-200 group-hover:text-purple-300">{fav.story.title}</p>
                    <p className="text-[10px] text-gray-500">{fav.story._count.episodes} tập</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Payments */}
      {tab === "payments" && (
        <div>
          {user.payments.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Chưa có lịch sử thanh toán.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#2a2a4a]">
              <table className="min-w-full divide-y divide-[#2a2a4a]">
                <thead className="bg-[#1a1a2e]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Gói</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Số tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a4a] bg-[#0f0f23]">
                  {user.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-sm text-gray-300">{p.planName || VIP_PLANS[p.plan as PlanType]?.label || p.plan}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{p.amount.toLocaleString("vi-VN")}đ</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "SUCCESS" ? "bg-green-900/30 text-green-400" : p.status === "PENDING" ? "bg-yellow-900/30 text-yellow-400" : "bg-red-900/30 text-red-400"}`}>
                          {p.status === "SUCCESS" ? "Thành công" : p.status === "PENDING" ? "Chờ duyệt" : "Thất bại"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "VIP") return <span className="rounded-full bg-purple-900/30 px-2 py-0.5 text-xs text-purple-400">⭐ VIP</span>;
  if (role === "ADMIN") return <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-xs text-red-400">Admin</span>;
  return <span className="rounded-full bg-[#2a2a4a] px-2 py-0.5 text-xs text-gray-400">Thành viên</span>;
}
