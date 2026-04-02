import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const episodeId = request.nextUrl.searchParams.get("episodeId");
    if (!episodeId) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "episodeId là bắt buộc" },
        { status: 400 }
      );
    }

    const history = await prisma.listeningHistory.findUnique({
      where: {
        userId_episodeId: {
          userId: session.user.id,
          episodeId,
        },
      },
    });

    return NextResponse.json({
      progressSeconds: history?.progressSeconds ?? 0,
    });
  } catch (error) {
    console.error("Error fetching listening history:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { episodeId, progressSeconds } = body;

    if (!episodeId || typeof progressSeconds !== "number" || progressSeconds < 0) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "episodeId và progressSeconds hợp lệ là bắt buộc" },
        { status: 400 }
      );
    }

    const history = await prisma.listeningHistory.upsert({
      where: {
        userId_episodeId: {
          userId: session.user.id,
          episodeId,
        },
      },
      update: { progressSeconds },
      create: {
        userId: session.user.id,
        episodeId,
        progressSeconds,
      },
    });

    return NextResponse.json({
      success: true,
      progressSeconds: history.progressSeconds,
    });
  } catch (error) {
    console.error("Error saving listening history:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
