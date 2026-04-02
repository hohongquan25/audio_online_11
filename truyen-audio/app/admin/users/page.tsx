import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminUserActions from "./AdminUserActions";
import UserPaymentHistory from "./UserPaymentHistory";

const PAGE_SIZE = 15;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt((params.page as string) || "1", 10));
  const search = (params.search as string) || "";
  const roleFilter = (params.role as string) || "";

  const where = {
    ...(search ? { email: { contains: search, mode: "insensitive" as const } } : {}),
    ...(roleFilter ? { role: roleFilter as "USER" | "VIP" | "ADMIN" } : {}),
  };

  const skip = (page - 1) * PAGE_SIZE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBanned: true,
        vipExpiredAt: true,
        createdAt: true,
        _count: { select: { payments: true, listeningHistory: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500">{total} người dùng</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <form method="GET" className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="Tìm theo email..."
            className="rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:border-purple-500 focus:outline-none sm:w-64"
          />
          {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
          <button type="submit" className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">Tìm</button>
        </form>
        <div className="flex gap-2">
          {["", "USER", "VIP", "ADMIN"].map((r) => (
            <Link
              key={r}
              href={`/admin/users?role=${r}${search ? `&search=${search}` : ""}`}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                roleFilter === r
                  ? "bg-purple-600 text-white"
                  : "border border-[#2a2a4a] text-gray-400 hover:text-white"
              }`}
            >
              {r || "Tất cả"}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <p className="py-12 text-center text-gray-500">Không tìm thấy người dùng nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#2a2a4a]">
          <table className="min-w-full divide-y divide-[#2a2a4a]">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tên</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Role</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">VIP hết hạn</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Thanh toán</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Ngày tạo</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a4a] bg-[#0f0f23]">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-sm text-gray-200">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{user.name || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">
                    {user.vipExpiredAt
                      ? new Date(user.vipExpiredAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.isBanned ? (
                      <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-xs text-red-400">Bị chặn</span>
                    ) : (
                      <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">Hoạt động</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">{user._count.payments}</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AdminUserActions userId={user.id} role={user.role} isBanned={user.isBanned} />
                    <UserPaymentHistory userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/users?page=${p}${search ? `&search=${search}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                p === page ? "bg-purple-600 text-white" : "border border-[#2a2a4a] text-gray-400 hover:text-white"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-xs text-red-400">Admin</span>;
  if (role === "VIP") return <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-400">VIP</span>;
  return <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">User</span>;
}
