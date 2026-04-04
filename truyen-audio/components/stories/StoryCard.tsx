import Link from "next/link";

interface StoryCardProps {
  story: {
    slug: string;
    title: string;
    description: string;
    coverImage: string;
    isVip: boolean;
    avgRating: number;
    ratingCount: number;
    viewCount: number;
    status: string;
    _count?: { episodes: number };
  };
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group block overflow-hidden rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] transition hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-600/10"
    >
      {/* Cover image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#2a2a4a]">
        <img
          src={story.coverImage}
          alt={story.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        {story.isVip && (
          <span className="absolute top-2 right-2 rounded-md bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow">
            VIP
          </span>
        )}
        {story._count && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-gray-200 backdrop-blur-sm">
            {story._count.episodes} tập
          </span>
        )}
        {story.status === "completed" ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-blue-600/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            Hoàn thành
          </span>
        ) : (
          <span className="absolute bottom-2 right-2 rounded-md bg-purple-600/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            Đang cập nhật
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-gray-200 group-hover:text-purple-300">
          {story.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {story.description}
        </p>
        <div className="mt-2 flex items-center gap-3">
          {story.ratingCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37-2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
              </svg>
              <span>{story.avgRating.toFixed(1)}</span>
              <span className="text-gray-600">({story.ratingCount})</span>
            </div>
          )}
          {story.viewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{story.viewCount.toLocaleString('vi-VN')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
