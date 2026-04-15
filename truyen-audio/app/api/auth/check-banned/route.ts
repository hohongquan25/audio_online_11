import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ banned: false });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { isBanned: true },
    });

    return NextResponse.json({ banned: user?.isBanned || false });
  } catch (error) {
    return NextResponse.json({ banned: false });
  }
}
