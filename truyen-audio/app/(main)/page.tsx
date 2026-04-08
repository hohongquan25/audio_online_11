import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoryCard from "@/components/stories/StoryCard";

export default async function HomePage() {
  const session = await auth();
  const isVip = session?.user?.role === "VIP" || session?.user?.role === "ADMIN";

  let siteSettings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!siteSettings) siteSettings = await prisma.siteSettings.create({ data: { id: "default" } });

  const [trendingStories, latestStories, categories] = await Promise.all([
    prisma.story.findMany({
      where: { isActive: true },
      orderBy: [{ avgRating: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: { slug: true, title: true, description: true, coverImage: true, isVip: true, avgRating: true, ratingCount: true, viewCount: true, status: true, _count: { select: { episodes: true } } },
    }),
    prisma.story.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { slug: true, title: true, description: true, coverImage: true, isVip: true, avgRating: true, ratingCount: true, viewCount: true, status: true, _count: { select: { episodes: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      {/* Hero — seamless gradient fade */}
      <section className="relative overflow-hidden">
        {siteSettings.heroBackground ? (
          <>
            <img src={siteSettings.heroBackground} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0f0f23]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#16213e] to-[#0f0f23]" />
        )}
        <div className="relative px-4 pb-24 pt-16 sm:pb-32 sm:pt-24">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col items-start">
              <span className="mb-4 inline-block rounded-full bg-purple-600/20 px-4 py-1.5 text-sm font-medium text-purple-300">
                ✨ Nội dung mới mỗi tuần
              </span>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {siteSettings.heroTitle || "Nghe truyện độc quyền mọi lúc, mọi nơi"}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-gray-300/80">
                {siteSettings.heroSubtitle || "Khám phá hàng ngàn tập truyện audio hấp dẫn từ các thể loại tiên hiệp, kiếm hiệp, ngôn tình đến trinh thám, kinh dị."}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/stories" className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-700">
                  ▶ Khám phá ngay
                </Link>
                {!isVip && (
                  <Link href="/vip" className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 px-6 py-3 text-sm font-semibold text-purple-300 hover:bg-purple-600/20">
                    👑 Đăng ký VIP
                  </Link>
                )}
              </div>
              <div className="mt-12 flex gap-8 sm:gap-16">
                <div><div className="text-2xl font-bold text-white sm:text-3xl">1000+</div><div className="text-sm text-gray-500">Tập truyện</div></div>
                <div><div className="text-2xl font-bold text-white sm:text-3xl">50+</div><div className="text-sm text-gray-500">Bộ truyện</div></div>
                <div><div className="text-2xl font-bold text-white sm:text-3xl">10K+</div><div className="text-sm text-gray-500">Người nghe</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="mb-8 flex justify-center">
          <form action="/stories" method="GET" className="relative w-full max-w-xl">
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input name="search" placeholder="Tìm kiếm truyện, tác giả, MC..." className="w-full rounded-full border border-[#2a2a4a] bg-[#1a1a2e] py-3 pl-12 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:border-purple-500 focus:outline-none" />
          </form>
        </div>

        {/* Categories from DB */}
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/stories?category=${cat.slug}`}
                className="flex items-center gap-1.5 rounded-full border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-2 text-sm text-gray-300 transition hover:border-purple-500/50 hover:bg-purple-600/10 hover:text-white"
              >
                <span>{cat.emoji}</span><span>{cat.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Trending */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">🔥 Xu hướng</h2>
            <Link href="/stories?sort=popular" className="text-sm font-medium text-purple-400 hover:text-purple-300">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingStories.map((s) => <StoryCard key={s.slug} story={s} />)}
          </div>
        </section>

        {/* Latest */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">🆕 Tập mới cập nhật</h2>
            <Link href="/stories" className="text-sm font-medium text-purple-400 hover:text-purple-300">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {latestStories.map((s) => <StoryCard key={s.slug} story={s} />)}
          </div>
        </section>

        {/* VIP CTA */}
        {!isVip && (
          <section className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/50 to-pink-900/30 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Nâng cấp VIP để mở khóa toàn bộ nội dung</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">Truy cập không giới hạn, không quảng cáo, và nhiều đặc quyền hấp dẫn.</p>
            <Link href="/vip" className="mt-6 inline-block rounded-xl bg-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-700">Xem các gói VIP</Link>
          </section>
        )}
      </div>
    </div>
  );
}
