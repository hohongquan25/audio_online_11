import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import ListenClient from "./ListenClient";

interface ListenPageProps {
  params: Promise<{ episodeId: string }>;
}

export default async function ListenPage({ params }: ListenPageProps) {
  const { episodeId } = await params;
  const session = await auth();

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      story: { select: { id: true, title: true, slug: true, isVip: true } },
    },
  });

  if (!episode) notFound();

  const isLoggedIn = !!session?.user;
  const isVip = session?.user?.role === "VIP" || session?.user?.role === "ADMIN";
  const isFreeAccess = episode.isFreePreview || !episode.story.isVip;

  if (!isFreeAccess && !isVip) redirect(`/stories/${episode.story.slug}`);

  const isPreviewOnly = !isLoggedIn && episode.isFreePreview;

  let initialProgress = 0;
  if (isLoggedIn) {
    const history = await prisma.listeningHistory.findUnique({
      where: { userId_episodeId: { userId: session.user.id, episodeId } },
    });
    initialProgress = history?.progressSeconds ?? 0;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--text-muted)]">
        <Link href={`/stories/${episode.story.slug}`} className="hover:text-purple-400 hover:underline">
          ← {episode.story.title}
        </Link>
      </nav>

      <div className="rounded-xl border border-[var(--bg-card-border)] bg-[var(--bg-card)] p-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{episode.title}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{episode.story.title}</p>
      </div>

      {/* Client component triggers global player */}
      <ListenClient
        episode={{
          id: episode.id,
          title: episode.title,
          audioUrl: episode.audioUrl,
          duration: episode.duration,
          story: { title: episode.story.title, slug: episode.story.slug },
        }}
        initialProgress={initialProgress}
        isPreviewOnly={isPreviewOnly}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
