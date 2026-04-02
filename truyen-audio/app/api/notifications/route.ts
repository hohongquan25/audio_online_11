import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  const notifications = await prisma.notification.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: userId ? {
      reads: { where: { userId }, select: { id: true } },
    } : undefined,
  });

  const result = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    isRead: userId ? (n as any).reads?.length > 0 : false,
  }));

  const unreadCount = userId ? result.filter((n) => !n.isRead).length : 0;

  return NextResponse.json({ notifications: result, unreadCount });
}
