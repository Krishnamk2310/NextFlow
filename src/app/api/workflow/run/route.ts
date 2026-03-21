import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function runLLM(model: string, systemPrompt: string, userMessage: string, images: string[] = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "GEMINI_API_KEY not set";

  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model: model || "gemini-2.0-flash" });

  const prompt = systemPrompt
    ? `${systemPrompt}\n\n${userMessage}`
    : userMessage;

  const parts: any[] = [prompt];
  
  for (const imgData of images) {
    if (typeof imgData !== 'string') continue;

    if (imgData.startsWith('data:')) {
      const [header, base64] = imgData.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      parts.push({
        inlineData: {
          data: base64,
          mimeType
        }
      });
    } else if (imgData.startsWith('http')) {
      try {
        const resp = await fetch(imgData);
        const buffer = await resp.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = resp.headers.get('content-type') || 'image/jpeg';
        parts.push({
          inlineData: {
            data: base64,
            mimeType
          }
        });
      } catch (err) {
        console.error("Failed to fetch image URL for LLM:", imgData, err);
      }
    }
  }

  const result = await gemini.generateContent(parts);
  return result.response.text();
}

function buildDag(nodes: any[], edges: any[]) {
  const nodeMap = new Map<string, any>();
  const incoming = new Map<string, any[]>();

  for (const n of nodes) {
    nodeMap.set(n.id, n);
    incoming.set(n.id, []);
  }
  for (const e of edges) {
    incoming.get(e.target)?.push(e);
  }
  return { nodeMap, incoming };
}

async function executeInline(nodes: any[], edges: any[]) {
  const { nodeMap, incoming } = buildDag(nodes, edges);
  const outputs = new Map<string, any>();
  const nodeResults: Record<string, { status: string; output: any; error?: string }> = {};

  const execute = async (nodeId: string): Promise<any> => {
    if (outputs.has(nodeId)) return outputs.get(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) return null;

    const deps = incoming.get(nodeId) || [];
    await Promise.all(deps.map(e => execute(e.source)));

    const inputs: Record<string, any> = {};
    for (const edge of deps) {
      const val = outputs.get(edge.source);
      const handle = edge.targetHandle || 'input';
      if (!inputs[handle]) inputs[handle] = [];
      inputs[handle].push(val);
    }
    for (const key in inputs) {
      if (inputs[key].length === 1) inputs[key] = inputs[key][0];
    }

    let output: any = null;

    try {
      switch (node.type) {
        case 'text':
          output = node.data?.text || '';
          break;

        case 'upload-image':
          output = node.data?.imageUrl || '[no image uploaded]';
          break;

        case 'upload-video':
          output = node.data?.videoUrl || '[no video uploaded]';
          break;

        case 'llm':
          const sysPrompt = inputs.system_prompt || inputs.input || '';
          const userMsg = inputs.user_message || inputs.prompt || 
            (typeof inputs.input === 'string' ? inputs.input : 'Provide analysis.');
          const imgs = Array.isArray(inputs.images) 
            ? inputs.images 
            : (inputs.images ? [inputs.images] : []);

          output = await runLLM(
            node.data?.model || 'gemini-2.0-flash',
            typeof sysPrompt === 'string' ? sysPrompt : JSON.stringify(sysPrompt),
            typeof userMsg === 'string' ? userMsg : JSON.stringify(userMsg),
            imgs
          );
          break;

        case 'crop-image':
          output = inputs.image_url || inputs.input || '[crop: no input image]';
          break;

        case 'extract-frame':
          output = node.data?.frame || inputs.video_url || inputs.input || '[extract: no input video]';
          break;

        default:
          output = `[Unknown node type: ${node.type}]`;
      }

      nodeResults[nodeId] = { status: 'SUCCESS', output };
    } catch (err: any) {
      output = null;
      nodeResults[nodeId] = { status: 'FAILED', output: null, error: err.message };
    }

    outputs.set(nodeId, output);
    return output;
  };

  const sources = new Set(edges.map(e => e.source));
  const sinks = nodes.filter(n => !sources.has(n.id));
  
  if (sinks.length === 0 && nodes.length > 0) {
    await Promise.all(nodes.map(n => execute(n.id)));
  } else {
    await Promise.all(sinks.map(n => execute(n.id)));
  }

  return nodeResults;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { nodes, edges, scope = 'FULL' } = body;

    if (!nodes || !edges) {
      return NextResponse.json({ success: false, error: "nodes and edges are required" }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@clerk.dev` }
    });

    const workflow = await prisma.workflow.create({
      data: {
        name: `Run ${new Date().toLocaleTimeString()}`,
        userId,
        nodes: nodes as any,
        edges: edges as any,
      }
    });

    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        status: 'RUNNING',
        scope,
        nodeRuns: {
          create: nodes.map((n: any) => ({
            nodeId: n.id,
            nodeType: n.type,
            status: 'PENDING',
          }))
        }
      }
    });

    // Execute the DAG inline
    const startTime = Date.now();
    let overallStatus = 'SUCCESS';
    let results: Record<string, { status: string; output: any; error?: string }> = {};

    try {
      results = await executeInline(nodes, edges);

      // Update each node run
      for (const [nodeId, result] of Object.entries(results)) {
        await prisma.nodeRun.updateMany({
          where: { workflowRunId: workflowRun.id, nodeId },
          data: {
            status: result.status,
            outputs: result.output ? { result: result.output } : undefined,
            error: result.error || null,
            completedAt: new Date(),
            duration: Date.now() - startTime,
          }
        });
        if (result.status === 'FAILED') overallStatus = 'FAILED';
      }
    } catch (execErr: any) {
      overallStatus = 'FAILED';
      console.error("[workflow/run] Execution error:", execErr.message);
    }

    // Update the workflow run status
    await prisma.workflowRun.update({
      where: { id: workflowRun.id },
      data: {
        status: overallStatus,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      }
    });

    return NextResponse.json({ 
      success: true, 
      runId: workflowRun.id,
      status: overallStatus,
      duration: Date.now() - startTime,
      nodeResults: results,
    });
  } catch (error: any) {
    console.error("[workflow/run] Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
