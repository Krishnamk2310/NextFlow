import { NextResponse } from 'next/server';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

function getDb() {
  const url = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter } as any);
}

export async function DELETE(req: Request) {
  try {
    const { runId } = await req.json();
    if (!runId) {
      return NextResponse.json({ success: false, error: "runId required" }, { status: 400 });
    }

    const prisma = getDb();

    await prisma.nodeRun.deleteMany({ where: { workflowRunId: runId } });
    await prisma.workflowRun.delete({ where: { id: runId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[workflow/runs] Delete error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
