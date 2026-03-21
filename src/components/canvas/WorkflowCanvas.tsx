"use client"

import { useCallback, useRef } from 'react'
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useWorkflowStore } from '@/store/workflowStore'
import { useMemo } from 'react'
import { TextNode } from '@/components/nodes/TextNode'
import { UploadImageNode } from '@/components/nodes/UploadImageNode'
import { UploadVideoNode } from '@/components/nodes/UploadVideoNode'
import { LLMNode } from '@/components/nodes/LLMNode'
import { CropImageNode } from '@/components/nodes/CropImageNode'
import { ExtractFrameNode } from '@/components/nodes/ExtractFrameNode'

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore()
  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { text: '', status: 'idle' }
      }

      useWorkflowStore.getState().addNode(newNode)
    },
    [screenToFlowPosition]
  )

  const nodeTypes = useMemo(() => ({
    text: TextNode,
    'upload-image': UploadImageNode,
    'upload-video': UploadVideoNode,
    llm: LLMNode,
    'crop-image': CropImageNode,
    'extract-frame': ExtractFrameNode,
  }), [])

  return (
    <div className="h-full w-full relative bg-zinc-950" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop as any}
        onDragOver={onDragOver as any}
        fitView
        className="dark"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#3f3f46" />
        <Controls className="fill-zinc-400 text-zinc-400" />
        <MiniMap 
          nodeColor="#a855f7" 
          maskColor="rgba(0, 0, 0, 0.4)" 
          className="!bg-zinc-900 !border-zinc-800"
        />
      </ReactFlow>
    </div>
  )
}
