import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storyFilterSchema } from "@/lib/validations";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const parsed = storyFilterSchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? undefined,
    });

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

    const { status, search, page } = parsed.data;

    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    if (status === "free") {
      where.isVip = false;
    } else if (status === "vip") {
      where.isVip = true;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const skip = (page - 1) * PAGE_SIZE;

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          isVip: true,
          avgRating: true,
          ratingCount: true,
          createdAt: true,
        },
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
      }),
      prisma.story.count({ where }),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return NextResponse.json({
      stories,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Đã xảy ra lỗi, vui lòng thử lại",
      },
      { status: 500 }
    );
  }
}
