import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ratingSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storyId, score } = body;

    if (!storyId || typeof storyId !== "string") {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "storyId là bắt buộc" },
        { status: 400 }
      );
    }

    const parsed = ratingSchema.safeParse({ score });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Điểm đánh giá phải từ 1 đến 5",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Check story exists
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Không tìm thấy truyện" },
        { status: 404 }
      );
    }

    // Upsert rating (userId + storyId unique)
    await prisma.rating.upsert({
      where: {
        userId_storyId: {
          userId: session.user.id,
          storyId,
        },
      },
      update: { score: parsed.data.score },
      create: {
        userId: session.user.id,
        storyId,
        score: parsed.data.score,
      },
    });

    // Recalculate avgRating and ratingCount using aggregate
    const aggregate = await prisma.rating.aggregate({
      where: { storyId },
      _avg: { score: true },
      _count: { score: true },
    });

    const avgRating = aggregate._avg.score ?? 0;
    const ratingCount = aggregate._count.score;

    await prisma.story.update({
      where: { id: storyId },
      data: { avgRating, ratingCount },
    });

    return NextResponse.json({
      success: true,
      avgRating,
      ratingCount,
      userScore: parsed.data.score,
    });
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
