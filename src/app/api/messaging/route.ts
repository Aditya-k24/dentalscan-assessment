import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMessageSchema, getMessagesSchema } from "@/lib/validations/messaging";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("scanId") ?? undefined;
  const threadId = searchParams.get("threadId") ?? undefined;

  const parsed = getMessagesSchema.safeParse({ scanId, threadId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Either scanId or threadId is required" } },
      { status: 400 }
    );
  }

  if (scanId) {
    const thread = await prisma.thread.findUnique({
      where: { scanId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!thread) {
      return NextResponse.json({ threadId: null, scanId, messages: [] });
    }

    return NextResponse.json({ threadId: thread.id, scanId: thread.scanId, messages: thread.messages });
  }

  const thread = await prisma.thread.findUnique({
    where: { id: threadId! },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!thread) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Thread not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ threadId: thread.id, scanId: thread.scanId, messages: thread.messages });
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = createMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid request",
            issues: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { scanId, patientId, clinicId, sender, content } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const thread = await tx.thread.upsert({
        where: { scanId },
        create: { scanId, patientId, clinicId },
        update: {},
      });

      const message = await tx.message.create({
        data: { threadId: thread.id, content, sender },
      });

      return { thread, message };
    });

    return NextResponse.json(
      { ok: true, threadId: result.thread.id, message: result.message },
      { status: 201 }
    );
  } catch (err) {
    console.error("[messaging] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}
