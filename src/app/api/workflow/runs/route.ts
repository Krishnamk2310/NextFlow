import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ runs: [] });
    }

    const runs = await prisma.workflowRun.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: {
        nodeRuns: {
          orderBy: { startedAt: 'asc' },
        },
        workflow: {
          select: { name: true, nodes: true, edges: true }
        }
      }
    });

    return NextResponse.json({ runs });
  } catch (error: any) {
    console.error("[workflow/runs] Error:", error.message);
    return NextResponse.json({ runs: [], error: error.message });
  }
}
