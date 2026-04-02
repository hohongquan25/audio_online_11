import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(payments.map(p => ({ ...p, createdAt: p.createdAt.toISOString() })));
}
