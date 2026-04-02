import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;

    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            isVip: true,
            coverImage: true,
          },
        },
      },
    });

    if (!episode) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Không tìm thấy tập này" },
        { status: 404 }
      );
    }

    // Access control logic
    const isFreeAccess = episode.isFreePreview || !episode.story.isVip;

    if (!isFreeAccess) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: "FORBIDDEN", message: "Bạn cần đăng nhập để nghe tập này" },
          { status: 403 }
        );
      }

      const { role } = session.user;
      if (role !== "VIP" && role !== "ADMIN") {
        return NextResponse.json(
          { error: "FORBIDDEN", message: "Bạn cần nâng cấp VIP để nghe tập này" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      id: episode.id,
      title: episode.title,
      audioUrl: episode.audioUrl,
      order: episode.order,
      duration: episode.duration,
      isFreePreview: episode.isFreePreview,
      storyId: episode.storyId,
      createdAt: episode.createdAt,
      story: episode.story,
    });
  } catch (error) {
    console.error("Error fetching episode:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
