import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VIP_PLANS } from "@/lib/utils";
import type { PlanType } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
      { status: 401 }
    );
  }

  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const plan = body.plan as PlanType;
  const planInfo = VIP_PLANS[plan];
  if (!planInfo) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Gói VIP không hợp lệ" },
      { status: 400 }
    );
  }

  // Mock payment: 90% success rate
  const paymentSuccess = Math.random() > 0.1;

  if (!paymentSuccess) {
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        plan,
        amount: planInfo.price,
        status: "FAILED",
      },
    });

    return NextResponse.json(
      { error: "PAYMENT_FAILED", message: "Thanh toán thất bại, vui lòng thử lại" },
      { status: 400 }
    );
  }

  const vipExpiredAt = new Date();
  vipExpiredAt.setDate(vipExpiredAt.getDate() + planInfo.days);

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId: session.user.id,
        plan,
        amount: planInfo.price,
        status: "SUCCESS",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "VIP",
        vipExpiredAt,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Thanh toán thành công! Bạn đã là thành viên VIP.",
    data: { vipExpiredAt: vipExpiredAt.toISOString() },
  });
}
