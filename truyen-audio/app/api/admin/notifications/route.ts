import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notifs = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(notifs.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
}
