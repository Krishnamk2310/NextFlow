"use client"

import { SidebarLeft } from '@/components/layout/SidebarLeft'
import { SidebarRight } from '@/components/layout/SidebarRight'
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas'
import { ReactFlowProvider } from '@xyflow/react'
import { useEffect } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { toast } from 'sonner'

export default function DashboardPage() {
  const setWorkflow = useWorkflowStore(s => s.setWorkflow)

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const res = await fetch('/api/workflow/latest')
        const data = await res.json()
        if (data.workflow) {
          // Sanitize any broken remote video URLs persisted in the database
          // raw.githubusercontent.com serves video files as text/plain which causes browser decode failures
          const sanitizedNodes = data.workflow.nodes.map((node: any) => {
            if (node.type === 'upload-video' && typeof node.data?.videoUrl === 'string') {
              const url = node.data.videoUrl
              if (url.startsWith('http') && (url.includes('raw.githubusercontent.com') || url.includes('blob:'))) {
                return { ...node, data: { ...node.data, videoUrl: null } }
              }
            }
            return node
          })
          setWorkflow(sanitizedNodes, data.workflow.edges)
          toast.success(`Restored workflow: ${data.workflow.name}`, { duration: 2000 })
        }
      } catch (err) {
        console.error("Failed to auto-load workflow", err)
      }
    }
    loadLatest()
  }, [setWorkflow])

  return (
    <div className="flex h-full w-full overflow-hidden">
      <SidebarLeft />
      
      <div className="flex-1 relative h-full">
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      </div>

      <SidebarRight />
    </div>
  )
}
