import { z } from 'zod';

export const NodeConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.any(),
});

export const EdgeConfigSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
});

export const WorkflowJSONSchema = z.object({
  nodes: z.array(NodeConfigSchema),
  edges: z.array(EdgeConfigSchema),
});

export type WorkflowExport = z.infer<typeof WorkflowJSONSchema>;
