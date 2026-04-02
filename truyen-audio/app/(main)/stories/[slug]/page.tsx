import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import EpisodeList from "@/components/stories/EpisodeList";
import StarRating from "@/components/stories/StarRating";
import StoryComments from "@/components/stories/StoryComments";
import FavoriteButton from "@/components/stories/FavoriteButton";
import StoryViewTracker from "@/components/stories/StoryViewTracker";
import PlayFirstEpisodeButton from "@/components/stories/PlayFirstEpisodeButton";

interface Props { params: Promise<{ slug: string }>; }

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const story = await prisma.story.findUnique({
    where: { slug },
    include: {
      episodes: { orderBy: { order: "asc" } },
      category: { select: { name: true, emoji: true } },
      storyComments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { favorites: true } },
    },
  });

  if (!story) notFound();

  const userId = session?.user?.id ?? null;
  const userRole = session?.user?.role ?? null;

  let userRating: number | null = null;
  let isFavorite = false;

  if (userId) {
    const [ratingData, favData] = await Promise.all([
      prisma.rating.findUnique({ where: { userId_storyId: { userId, storyId: story.id } } }),
      prisma.favorite.findUnique({ where: { userId_storyId: { userId, storyId: story.id } } }),
    ]);
    userRating = ratingData?.score ?? null;
    isFavorite = !!favData;
  }

  const serializedComments = story.storyComments.map((c) => ({
    ...c, createdAt: c.createdAt.toISOString(),
  }));

  const statusLabel = story.status === "completed" ? "Hoàn thành" : "Đang cập nhật";
  const statusColor = story.status === "completed" ? "bg-green-600" : "bg-purple-600";

  const firstEpisode = story.episodes[0];

  return (
    <div>
      {/* Hero background blur */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={story.coverImage} alt="" className="h-full w-full object-cover blur-2xl scale-110 opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f23]/60 via-[#0f0f23]/80 to-[#0f0f23]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Cover — auto fit, portrait or landscape */}
            <div className="mx-auto shrink-0 sm:mx-0" style={{ width: "160px" }}>
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img src={story.coverImage} alt={story.title} className="w-full h-auto object-cover" style={{ maxHeight: "220px" }} />
                {story.isVip && (
                  <span className="absolute top-2 left-2 rounded-md bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">VIP</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {/* Breadcrumb */}
              <p className="mb-2 text-xs text-gray-500">
                <a href="/stories" className="hover:text-gray-300">Danh sách truyện</a>
                <span className="mx-1">›</span>
                <span className="text-gray-400">{story.title}</span>
              </p>

              {/* Status badge */}
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${statusColor} mb-3`}>
                {statusLabel}
              </span>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">{story.title}</h1>

              {story.category && (
                <p className="mt-1 text-sm text-gray-400">{story.category.emoji} {story.category.name}</p>
              )}

              {/* Stats */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{story.viewCount.toLocaleString("vi-VN")} lượt nghe</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span>{story.episodes.length} tập</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <svg className="h-4 w-4 fill-current text-yellow-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                  <span>{story.avgRating > 0 ? story.avgRating.toFixed(1) : "Chưa có"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{story._count.favorites.toLocaleString("vi-VN")} theo dõi</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                {firstEpisode && (
                  <PlayFirstEpisodeButton
                    firstEpisode={{ id: firstEpisode.id, title: firstEpisode.title, audioUrl: firstEpisode.audioUrl, duration: firstEpisode.duration, isFreePreview: firstEpisode.isFreePreview }}
                    storyTitle={story.title}
                    storySlug={story.slug}
                    storyIsVip={story.isVip}
                    userRole={userRole}
                  />
                )}
                <FavoriteButton storyId={story.id} initialFavorite={isFavorite} isLoggedIn={!!userId} />
              </div>

              {/* Description */}
              {story.description && (
                <p className="mt-4 text-sm leading-relaxed text-gray-400">{story.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Track view */}
      <StoryViewTracker storyId={story.id} />

      {/* Content tabs */}
      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Rating */}
        <div className="mb-6">
          <StarRating storyId={story.id} currentRating={userRating} avgRating={story.avgRating} ratingCount={story.ratingCount} isLoggedIn={!!userId} />
        </div>

        {/* Episode list */}
        <div className="mb-8">
          <h2 className="mb-4 text-base font-semibold text-white">🎧 Danh sách tập ({story.episodes.length})</h2>
          <EpisodeList
            episodes={story.episodes.map((ep) => ({ id: ep.id, title: ep.title, order: ep.order, duration: ep.duration, isFreePreview: ep.isFreePreview, audioUrl: ep.audioUrl }))}
            userRole={userRole}
            storyIsVip={story.isVip}
            storyTitle={story.title}
            storySlug={story.slug}
            coverImage={story.coverImage}
          />
        </div>

        {/* Comments */}
        <StoryComments storyId={story.id} comments={serializedComments} currentUserId={userId} />
      </div>
    </div>
  );
}
