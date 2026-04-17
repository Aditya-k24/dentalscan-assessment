import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scanCompletedSchema } from "@/lib/validations/notify";

async function dispatchNotification(
  scanId: string,
  userId: string,
  title: string,
  message: string
) {
  try {
    await prisma.$transaction([
      prisma.notification.create({
        data: {
          scanId,
          userId,
          title,
          message,
          deliveryState: "pending",
          read: false,
        },
      }),
      prisma.scan.update({
        where: { id: scanId },
        data: { status: "completed" },
      }),
    ]);
  } catch (err) {
    console.error("[notify] background dispatch failed:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = scanCompletedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const { scanId, userId, title, message } = parsed.data;

    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Scan not found" } },
        { status: 404 }
      );
    }

    // Fire notification persistence without blocking the response
    void dispatchNotification(
      scanId,
      userId,
      title ?? "Scan Completed",
      message ?? "Your dental scan has been completed and is ready for review."
    );

    return NextResponse.json(
      { ok: true, deliveryState: "pending" },
      { status: 202 }
    );
  } catch (err) {
    console.error("[notify] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}
