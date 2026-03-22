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
  edgeStatuses: Record<string, NodeStatus>
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  addNode: (node: Node) => void
  setNodeStatus: (nodeId: string, status: NodeStatus) => void
  setEdgeStatus: (edgeId: string, status: NodeStatus) => void
  setAllNodeStatuses: (status: NodeStatus) => void
  setAllEdgeStatuses: (status: NodeStatus) => void
  clearStatuses: () => void
  updateNodeData: (nodeId: string, data: Record<string, any>) => void
  deleteNode: (nodeId: string) => void
  setWorkflow: (nodes: Node[], edges: Edge[]) => void
  runNode: (nodeId: string) => Promise<void>
  sidebarLeftCollapsed: boolean
  sidebarRightCollapsed: boolean
  setSidebarLeftCollapsed: (collapsed: boolean) => void
  setSidebarRightCollapsed: (collapsed: boolean) => void
  undo: () => void
  redo: () => void
  takeSnapshot: () => void
  canUndo: boolean
  canRedo: boolean
  past: { nodes: Node[], edges: Edge[] }[]
  future: { nodes: Node[], edges: Edge[] }[]
}

export const useWorkflowStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  nodeStatuses: {},
  edgeStatuses: {},
  sidebarLeftCollapsed: false,
  sidebarRightCollapsed: false,
  past: [] as { nodes: Node[], edges: Edge[] }[],
  future: [] as { nodes: Node[], edges: Edge[] }[],
  canUndo: false,
  canRedo: false,
  setSidebarLeftCollapsed: (collapsed: boolean) => set({ sidebarLeftCollapsed: collapsed }),
  setSidebarRightCollapsed: (collapsed: boolean) => set({ sidebarRightCollapsed: collapsed }),
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
  takeSnapshot: () => {
    const { nodes, edges, past } = get()
    const newPast = [...past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }].slice(-50)
    set({ 
      past: newPast, 
      future: [],
      canUndo: true,
      canRedo: false
    })
  },
  undo: () => {
    const { past, future, nodes, edges } = get()
    if (past.length === 0) return

    const newPast = [...past]
    const prevState = newPast.pop()!
    const newFuture = [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...future].slice(0, 50)

    set({
      nodes: prevState.nodes,
      edges: prevState.edges,
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true
    })
  },
  redo: () => {
    const { past, future, nodes, edges } = get()
    if (future.length === 0) return

    const newFuture = [...future]
    const nextState = newFuture.shift()!
    const newPast = [...past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }].slice(-50)

    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0
    })
  },
  onConnect: (connection: Connection) => {
    const { nodes, edges } = get()
    
    const sourceNode = nodes.find(n => n.id === connection.source)
    if (sourceNode && !isValidConnectionRule(sourceNode.type!, connection.targetHandle)) {
      toast.error("Invalid Connection: Output type does not match input type constraints.")
      return
    }

    const newEdge = { 
      id: `e${connection.source}-${connection.target}`, 
      type: 'gradient',
      animated: true,
      ...connection 
    }
    
    if (!isAcyclic(nodes, edges, newEdge as Edge)) {
      toast.error("Invalid Connection: Cycles are not allowed in this DAG.")
      return
    }

    get().takeSnapshot()
    set({
      edges: addEdge(newEdge as any, edges),
    })
  },
  addNode: (node: Node) => {
    get().takeSnapshot()
    set({
      nodes: [...get().nodes, node],
    })
  },
  setNodeStatus: (nodeId: string, status: NodeStatus) => {
    set({
      nodeStatuses: { ...get().nodeStatuses, [nodeId]: status },
    })
    // Also update edge data for visual feedback
    set({
      edges: get().edges.map(e => 
        e.source === nodeId ? { ...e, data: { ...e.data, status } } : e
      )
    })
  },
  setEdgeStatus: (edgeId: string, status: NodeStatus) => {
    set({
      edgeStatuses: { ...get().edgeStatuses, [edgeId]: status },
      edges: get().edges.map(e => 
        e.id === edgeId ? { ...e, data: { ...e.data, status } } : e
      )
    })
  },
  setAllNodeStatuses: (status: NodeStatus) => {
    const nStatuses: Record<string, NodeStatus> = {}
    for (const node of get().nodes) {
      nStatuses[node.id] = status
    }
    set({ 
      nodeStatuses: nStatuses,
      edges: get().edges.map(e => ({ ...e, data: { ...e.data, status } }))
    })
  },
  setAllEdgeStatuses: (status: NodeStatus) => {
    const eStatuses: Record<string, NodeStatus> = {}
    for (const edge of get().edges) {
      eStatuses[edge.id] = status
    }
    set({ 
      edgeStatuses: eStatuses,
      edges: get().edges.map(e => ({ ...e, data: { ...e.data, status } }))
    })
  },
  clearStatuses: () => {
    set({ 
      nodeStatuses: {}, 
      edgeStatuses: {},
      edges: get().edges.map(e => ({ ...e, data: { ...e.data, status: 'idle' } }))
    })
  },
  updateNodeData: (nodeId: string, newData: Record<string, any>) => {
    set({
      nodes: get().nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      ),
    })
  },
  deleteNode: (nodeId: string) => {
    get().takeSnapshot()
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    })
  },
  setWorkflow: (nodes: Node[], edges: Edge[]) => {
    set({ 
      nodes, 
      edges: edges.map(e => ({ ...e, type: 'gradient', animated: true })), 
      nodeStatuses: {},
      edgeStatuses: {},
      past: [],
      future: [],
      canUndo: false,
      canRedo: false
    })
  },
  runNode: async (nodeId: string) => {
    const { nodes, edges, setNodeStatus, updateNodeData, setAllNodeStatuses } = get()
    
    // Clear previous results for this node and its dependents
    setNodeStatus(nodeId, 'running')
    toast.loading(`Executing node ${nodeId}...`, { id: 'run-node' })

    try {
      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, targetNodeId: nodeId }),
      })

      const data = await response.json()
      if (data.success && data.nodeResults) {
        for (const [id, result] of Object.entries(data.nodeResults as Record<string, any>)) {
          setNodeStatus(id, result.status === 'SUCCESS' ? 'success' : 'error')
          if (result.output) {
            updateNodeData(id, { result: result.output })
          }
        }
        toast.success("Node execution completed", { id: 'run-node' })
      } else {
        setNodeStatus(nodeId, 'error')
        toast.error(`Execution failed: ${data.error || 'Server error'}`, { id: 'run-node' })
      }
    } catch (err: any) {
      setNodeStatus(nodeId, 'error')
      toast.error(`Execution failed: ${err.message}`, { id: 'run-node' })
    }
  },
}))
