import Link from "next/link";
import StoryCard from "./StoryCard";

interface Story {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  isVip: boolean;
  avgRating: number;
  ratingCount: number;
}

interface StoryGridProps {
  title: string;
  stories: Story[];
  viewAllHref?: string;
}

export default function StoryGrid({ title, stories, viewAllHref }: StoryGridProps) {
  if (stories.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Xem tất cả &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {stories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </div>
    </section>
  );
}
