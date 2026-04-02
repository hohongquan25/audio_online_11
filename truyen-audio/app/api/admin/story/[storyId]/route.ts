import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params;
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) return NextResponse.json({}, { status: 404 });
  return NextResponse.json(story);
}
