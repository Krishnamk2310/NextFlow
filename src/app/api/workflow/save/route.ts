import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nodes, edges, name } = await req.json();

    let workflow = await prisma.workflow.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (workflow) {
      workflow = await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          nodes: nodes || [],
          edges: edges || [],
          name: name || workflow.name,
        }
      });
    } else {
      workflow = await prisma.workflow.create({
        data: {
          userId,
          name: name || 'Untitled Workflow',
          nodes: nodes || [],
          edges: edges || [],
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      workflowId: workflow.id,
      message: 'Workflow saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving workflow:', error);
    return NextResponse.json({ error: error.message || 'Failed to save workflow' }, { status: 500 });
  }
}
