import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const scan = await prisma.scan.create({ data: { status: "pending" } });
    return NextResponse.json({ scanId: scan.id }, { status: 201 });
  } catch (err) {
    console.error("[scan] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create scan" } },
      { status: 500 }
    );
  }
}
