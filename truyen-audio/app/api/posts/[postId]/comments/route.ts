import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
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

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        postId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
