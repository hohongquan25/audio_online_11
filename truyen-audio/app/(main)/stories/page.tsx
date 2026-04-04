import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { storyFilterSchema } from "@/lib/validations";
import StoryCard from "@/components/stories/StoryCard";
import StoryFilter from "@/components/stories/StoryFilter";
import Link from "next/link";

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StoriesPage({ searchParams }: Props) {
  const params = await searchParams;

  const parsed = storyFilterSchema.safeParse({
    status: params.status ?? undefined,
    search: params.search ?? undefined,
    page: params.page ?? undefined,
  });

  const { status, search, page } = parsed.success ? parsed.data : { status: "all" as const, search: undefined, page: 1 };
  const sort = (params.sort as string) || "newest";
  const categorySlug = (params.category as string) || "";

  // Resolve category ID from slug
  let categoryId: string | undefined;
  if (categorySlug && categorySlug !== "all") {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (cat) categoryId = cat.id;
  }

  const where = {
    isActive: true,
    ...(status === "free" ? { isVip: false } : {}),
    ...(status === "vip" ? { isVip: true } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const orderBy = sort === "popular"
    ? [{ avgRating: "desc" as const }, { createdAt: "desc" as const }]
    : [{ createdAt: "desc" as const }];

  const skip = (page - 1) * PAGE_SIZE;

  const [stories, total, categories] = await Promise.all([
    prisma.story.findMany({
      where, skip, take: PAGE_SIZE, orderBy,
      select: { slug: true, title: true, description: true, coverImage: true, isVip: true, avgRating: true, ratingCount: true, viewCount: true, status: true, _count: { select: { episodes: true } } },
    }),
    prisma.story.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Danh sách truyện</h1>
        <p className="mt-2 text-gray-500">Khám phá hàng trăm bộ truyện audio hấp dẫn</p>
      </div>

      <Suspense fallback={null}>
        <StoryFilter total={total} categories={categories} />
      </Suspense>

      {stories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {stories.map((s) => <StoryCard key={s.slug} story={s} />)}
        </div>
      ) : (
        <div className="py-20 text-center"><div className="mb-4 text-5xl">📚</div><p className="text-gray-500">Không tìm thấy truyện nào.</p></div>
      )}

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} params={params} />}
    </div>
  );
}

function Pagination({ currentPage, totalPages, params }: { currentPage: number; totalPages: number; params: Record<string, string | string[] | undefined> }) {
  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "all") sp.set("status", params.status as string);
    if (params.search) sp.set("search", params.search as string);
    if (params.sort && params.sort !== "newest") sp.set("sort", params.sort as string);
    if (params.category && params.category !== "all") sp.set("category", params.category as string);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/stories?${qs}` : "/stories";
  }

  const maxV = 5;
  let s = Math.max(1, currentPage - Math.floor(maxV / 2));
  const e = Math.min(totalPages, s + maxV - 1);
  if (e - s + 1 < maxV) s = Math.max(1, e - maxV + 1);
  const pages: number[] = [];
  for (let i = s; i <= e; i++) pages.push(i);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1">
      {currentPage > 1 ? <Link href={buildHref(currentPage - 1)} className="rounded-lg border border-[#2a2a4a] px-3 py-2 text-sm text-gray-400 hover:text-white">«</Link> : <span className="rounded-lg px-3 py-2 text-sm text-gray-700">«</span>}
      {pages.map((p) => <Link key={p} href={buildHref(p)} className={`rounded-lg px-3 py-2 text-sm font-medium ${p === currentPage ? "bg-purple-600 text-white" : "border border-[#2a2a4a] text-gray-400 hover:text-white"}`}>{p}</Link>)}
      {currentPage < totalPages ? <Link href={buildHref(currentPage + 1)} className="rounded-lg border border-[#2a2a4a] px-3 py-2 text-sm text-gray-400 hover:text-white">»</Link> : <span className="rounded-lg px-3 py-2 text-sm text-gray-700">»</span>}
    </nav>
  );
}
