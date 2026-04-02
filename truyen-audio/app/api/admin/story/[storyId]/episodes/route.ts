import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params;
  const episodes = await prisma.episode.findMany({
    where: { storyId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(episodes);
}
