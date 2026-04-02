import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "default" } });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ heroBackground: "", heroTitle: "", heroSubtitle: "" });
  }
}
