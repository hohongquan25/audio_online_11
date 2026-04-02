import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminStoryActions from "./AdminStoryActions";

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminStoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt((params.page as string) || "1", 10));
  const search = (params.search as string) || "";

  const where = search ? { title: { contains: search, mode: "insensitive" as const } } : {};
  const skip = (page - 1) * PAGE_SIZE;

  const [stories, total, categories] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true, emoji: true } },
        _count: { select: { episodes: true } },
      },
    }),
    prisma.story.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý truyện</h1>
          <p className="text-sm text-gray-500">{total} truyện</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/categories" className="rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm text-gray-300 hover:border-purple-500/50">
            Danh mục
          </Link>
          <Link href="/admin/stories/create" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
            + Tạo truyện
          </Link>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        <input
          name="search"
          defaultValue={search}
          placeholder="Tìm kiếm truyện..."
          className="w-full rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:border-purple-500 focus:outline-none sm:max-w-xs"
        />
      </form>

      {stories.length === 0 ? (
        <p className="py-12 text-center text-gray-500">Không có truyện nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#2a2a4a]">
          <table className="min-w-full divide-y divide-[#2a2a4a]">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Truyện</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Danh mục</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">VIP</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Tập</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a4a] bg-[#0f0f23]">
              {stories.map((story) => (
                <tr key={story.id}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-200">{story.title}</div>
                    <div className="text-xs text-gray-500">{story.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {story.category ? `${story.category.emoji} ${story.category.name}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {story.isVip ? (
                      <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-400">VIP</span>
                    ) : (
                      <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {story.isActive ? (
                      <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">Bật</span>
                    ) : (
                      <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-xs text-red-400">Tắt</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-400">{story._count.episodes}</td>
                  <td className="px-4 py-3 text-center">
                    <AdminStoryActions storyId={story.id} isActive={story.isActive} slug={story.slug} />
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
              href={`/admin/stories?page=${p}${search ? `&search=${search}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-purple-600 text-white" : "border border-[#2a2a4a] text-gray-400 hover:text-white"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
