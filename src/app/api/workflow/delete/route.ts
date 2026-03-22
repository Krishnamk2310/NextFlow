import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
    const { runId } = await req.json();
    if (!runId) {
      return NextResponse.json({ success: false, error: "runId required" }, { status: 400 });
    }

    await prisma.nodeRun.deleteMany({ where: { workflowRunId: runId } });
    await prisma.workflowRun.delete({ where: { id: runId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[workflow/runs] Delete error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
