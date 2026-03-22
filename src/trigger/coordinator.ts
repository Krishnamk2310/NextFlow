import { task, tasks } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

export const workflowCoordinator = task({
  id: "workflow-coordinator",
  maxDuration: 600,
  run: async (payload: { workflowRunId: string, nodes: any[], edges: any[] }) => {
    const { workflowRunId, nodes, edges } = payload;
    
    // Build dependency map
    const incomingEdges = new Map<string, typeof edges>();
    const nodeById = new Map<string, any>();
    
    for (const node of nodes) {
      incomingEdges.set(node.id, []);
      nodeById.set(node.id, node);
    }
    
    for (const edge of edges) {
      if (incomingEdges.has(edge.target)) {
        incomingEdges.get(edge.target)!.push(edge);
      }
    }

    const nodeOutputs = new Map<string, any>();
    
    // Execution helper function
    const executeNode = async (nodeId: string): Promise<any> => {
      if (nodeOutputs.has(nodeId)) {
        return nodeOutputs.get(nodeId);
      }

      let resolveOutput: (v: any) => void;
      let rejectOutput: (e: any) => void;
      const executionPromise = new Promise((res, rej) => {
        resolveOutput = res;
        rejectOutput = rej;
      });
      nodeOutputs.set(nodeId, executionPromise);

      try {
        const node = nodeById.get(nodeId);
        const deps = incomingEdges.get(nodeId) || [];
        
        await Promise.all(deps.map(e => executeNode(e.source)));

        const inputs: Record<string, any> = {};
        for (const edge of deps) {
           const output = await nodeOutputs.get(edge.source);
           if (!inputs[edge.targetHandle!]) {
             inputs[edge.targetHandle!] = [];
           }
           inputs[edge.targetHandle!].push(output);
        }

        for (const key in inputs) {
          if (inputs[key].length === 1 && key !== 'images') {
             inputs[key] = inputs[key][0];
          }
        }

        await prisma.nodeRun.updateMany({
           where: { workflowRunId, nodeId },
           data: { status: "RUNNING" }
        });

        let finalOutput: any = null;

        if (node.type === 'text') {
           finalOutput = node.data.text;
        } else if (node.type === 'upload-image') {
           finalOutput = node.data.imageUrl;
        } else if (node.type === 'upload-video') {
           finalOutput = node.data.videoUrl;
        } else if (node.type === 'llm') {
           const result = await tasks.triggerAndWait("llm-task", {
             nodeRunId: `${workflowRunId}-${nodeId}`,
             model: node.data.model || "gemini-1.5-flash",
             systemPrompt: inputs.system_prompt,
             userMessage: inputs.user_message || "Summarize the images.",
             images: inputs.images || []
           });
           finalOutput = (result as any).output?.result || (result as any).payload?.result;
        } else if (node.type === 'crop-image') {
           const result = await tasks.triggerAndWait("crop-image-task", {
             nodeRunId: `${workflowRunId}-${nodeId}`,
             imageUrl: inputs.image_url,
             x: inputs.x_percent || node.data.x_percent || 0,
             y: inputs.y_percent || node.data.y_percent || 0,
             w: inputs.width_percent || node.data.width_percent || 100,
             h: inputs.height_percent || node.data.height_percent || 100
           });
           finalOutput = (result as any).output?.outputUrl || (result as any).payload?.outputUrl;
        } else if (node.type === 'extract-frame') {
           const result = await tasks.triggerAndWait("extract-frame-task", {
             nodeRunId: `${workflowRunId}-${nodeId}`,
             videoUrl: inputs.video_url,
             timestamp: inputs.timestamp || node.data.timestamp || 0
           });
           finalOutput = (result as any).output?.outputUrl || (result as any).payload?.outputUrl;
        }

        await prisma.nodeRun.updateMany({
           where: { workflowRunId, nodeId },
           data: { status: "SUCCESS", outputs: { result: finalOutput } as any, completedAt: new Date() }
        });

        resolveOutput!(finalOutput);
        return finalOutput;
      } catch (err: any) {
        await prisma.nodeRun.updateMany({
           where: { workflowRunId, nodeId },
           data: { status: "FAILED", error: err.message, completedAt: new Date() }
        });
        rejectOutput!(err);
        throw err;
      }
    };

    const outgoingCount = new Map<string, number>();
    for (const node of nodes) outgoingCount.set(node.id, 0);
    for (const edge of edges) outgoingCount.set(edge.source, (outgoingCount.get(edge.source) || 0) + 1);

    const sinkNodes = nodes.filter(n => outgoingCount.get(n.id) === 0);
    
    try {
      await Promise.all(sinkNodes.map(n => executeNode(n.id)));
      await prisma.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "SUCCESS", completedAt: new Date() }
      });
    } catch (err) {
      await prisma.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "FAILED", completedAt: new Date() }
      });
      throw err;
    }
  }
});
