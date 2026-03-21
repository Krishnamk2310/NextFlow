import { create } from 'zustand'
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import { isAcyclic, isValidConnectionRule } from '@/lib/execution/dag'
import { toast } from 'sonner'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export type AppState = {
  nodes: Node[]
  edges: Edge[]
  nodeStatuses: Record<string, NodeStatus>
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  addNode: (node: Node) => void
  setNodeStatus: (nodeId: string, status: NodeStatus) => void
  setAllNodeStatuses: (status: NodeStatus) => void
  clearStatuses: () => void
  updateNodeData: (nodeId: string, data: Record<string, any>) => void
  deleteNode: (nodeId: string) => void
  setWorkflow: (nodes: Node[], edges: Edge[]) => void
}

export const useWorkflowStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  nodeStatuses: {},
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  onConnect: (connection: Connection) => {
    const { nodes, edges } = get()
    
    const sourceNode = nodes.find(n => n.id === connection.source)
    if (sourceNode && !isValidConnectionRule(sourceNode.type!, connection.targetHandle)) {
      toast.error("Invalid Connection: Output type does not match input type constraints.")
      return
    }

    const newEdge = { id: `e${connection.source}-${connection.target}`, ...connection }
    if (!isAcyclic(nodes, edges, newEdge)) {
      toast.error("Invalid Connection: Cycles are not allowed in this DAG.")
      return
    }

    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, edges),
    })
  },
  addNode: (node: Node) => {
    set({
      nodes: [...get().nodes, node],
    })
  },
  setNodeStatus: (nodeId: string, status: NodeStatus) => {
    set({
      nodeStatuses: { ...get().nodeStatuses, [nodeId]: status },
    })
  },
  setAllNodeStatuses: (status: NodeStatus) => {
    const statuses: Record<string, NodeStatus> = {}
    for (const node of get().nodes) {
      statuses[node.id] = status
    }
    set({ nodeStatuses: statuses })
  },
  clearStatuses: () => {
    set({ nodeStatuses: {} })
  },
  updateNodeData: (nodeId: string, newData: Record<string, any>) => {
    set({
      nodes: get().nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      ),
    })
  },
  deleteNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    })
  },
  setWorkflow: (nodes: Node[], edges: Edge[]) => {
    set({ nodes, edges, nodeStatuses: {} })
  },
}))
