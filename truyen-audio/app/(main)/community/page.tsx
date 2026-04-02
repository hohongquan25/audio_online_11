import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PostCard from "@/components/community/PostCard";
import PostForm from "@/components/community/PostForm";
import CommunityFilter from "@/components/community/CommunityFilter";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CommunityPage({ searchParams }: Props) {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;
  const params = await searchParams;
  const typeFilter = (params.type as string) || "all";

  const where = {};  // Fetch all, filter in app

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { comments: true } },
    },
  });

  // Filter by type in application layer (Prisma client may not have type field yet)
  const filteredPosts = typeFilter !== "all"
    ? posts.filter((p: any) => (p.type ?? "general") === typeFilter)
    : posts;

  let likedPostIds = new Set<string>();
  if (currentUserId) {
    const likes = await prisma.like.findMany({ where: { userId: currentUserId }, select: { postId: true } });
    likedPostIds = new Set(likes.map((l: { postId: string }) => l.postId));
  }

  const serializedPosts = filteredPosts.map((post: any) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map((c: typeof post.comments[number]) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Cộng đồng</h1>
        {currentUserId && (
          <Link href="/community/create" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
            Tạo bài viết
          </Link>
        )}
      </div>

      {currentUserId && <PostForm />}

      {!currentUserId && (
        <div className="mb-6 rounded-xl border border-purple-600/20 bg-purple-900/10 p-4 text-center text-sm text-gray-400">
          <Link href="/login" className="font-medium text-purple-400 underline hover:text-purple-300">Đăng nhập</Link> để viết bài, bình luận và thích bài viết.
        </div>
      )}

      {/* Filter tabs */}
      <CommunityFilter currentType={typeFilter} total={filteredPosts.length} />

      <div className="mt-4 space-y-4">
        {serializedPosts.length === 0 ? (
          <p className="py-12 text-center text-gray-500">Chưa có bài viết nào.</p>
        ) : (
          serializedPosts.map((post: any) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} isLiked={likedPostIds.has(post.id)} />
          ))
        )}
      </div>
    </div>
  );
}
