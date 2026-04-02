import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
      { status: 401 }
    );
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Bài viết không tồn tại" },
        { status: 404 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "CONFLICT", message: "Bạn đã thích bài viết này rồi" },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Đã thích bài viết",
    });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
      { status: 401 }
    );
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Bạn chưa thích bài viết này" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.like.delete({
        where: { id: existingLike.id },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Đã bỏ thích bài viết",
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
