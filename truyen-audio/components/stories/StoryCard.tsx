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
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-gray-200 group-hover:text-purple-300">
          {story.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {story.description}
        </p>
        {story.ratingCount > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
            <span>{story.avgRating.toFixed(1)}</span>
            <span className="text-gray-600">({story.ratingCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
