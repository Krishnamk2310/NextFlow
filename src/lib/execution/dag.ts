import { Node, Edge } from '@xyflow/react'

export function isAcyclic(nodes: Node[], edges: Edge[], newEdge?: Edge): boolean {
  // Build adjacency list
  const adj = new Map<string, string[]>()
  nodes.forEach(n => adj.set(n.id, []))
  
  const allEdges = newEdge ? [...edges, newEdge] : edges
  allEdges.forEach(e => {
    if (adj.has(e.source)) {
      adj.get(e.source)!.push(e.target)
    }
  })

  const visited = new Set<string>()
  const recStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    if (recStack.has(nodeId)) return false // cycle detected
    if (visited.has(nodeId)) return true // already processed successfully

    visited.add(nodeId)
    recStack.add(nodeId)

    const neighbors = adj.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!dfs(neighbor)) return false
    }

    recStack.delete(nodeId)
    return true
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (!dfs(node.id)) return false
    }
  }

  return true
}

export function isValidConnectionRule(sourceType: string, targetHandle: string | null): boolean {
  // Map source node type to output generic type
  let outputType = 'unknown'
  if (sourceType === 'text' || sourceType === 'llm') outputType = 'text'
  else if (sourceType === 'upload-image' || sourceType === 'crop-image' || sourceType === 'extract-frame') outputType = 'image'
  else if (sourceType === 'upload-video') outputType = 'video'

  // Map target handle to required input generic type
  let requiredType = 'unknown'
  if (['system_prompt', 'user_message'].includes(targetHandle || '')) requiredType = 'text'
  else if (['image_url', 'images'].includes(targetHandle || '')) requiredType = 'image'
  else if (['video_url'].includes(targetHandle || '')) requiredType = 'video'
  else if (['x_percent', 'y_percent', 'width_percent', 'height_percent', 'timestamp'].includes(targetHandle || '')) {
    // Numbers can be provided by text nodes representing expressions or parsed numbers
    if (outputType === 'text') return true 
    requiredType = 'number'
  }

  return outputType === requiredType
}
