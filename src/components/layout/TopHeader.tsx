"use client"

import { Button } from '@/components/ui/button'
import { Download, Upload, Play, Save, Box, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { WorkflowJSONSchema } from '@/lib/execution/schemas'
import { SAMPLE_WORKFLOW } from '@/lib/execution/sampleWorkflow'
import { toast } from 'sonner'
import { useRef, useState } from 'react'

export function TopHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleExport = () => {
    const { nodes, edges } = useWorkflowStore.getState()
    const payload = { nodes, edges }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("Workflow exported successfully")
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        const parsed = WorkflowJSONSchema.parse(json)
        useWorkflowStore.setState({ nodes: parsed.nodes as any, edges: parsed.edges as any })
        toast.success("Workflow imported successfully")
      } catch (err) {
        toast.error("Failed to import workflow: Invalid format")
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const handleLoadSample = () => {
    useWorkflowStore.setState({ nodes: SAMPLE_WORKFLOW.nodes as any, edges: SAMPLE_WORKFLOW.edges as any })
    toast.success("Loaded Sample: Product Marketing Kit")
  }

  const handleSaveWorkflow = async () => {
    setIsRunning(true)
    toast.loading("Saving workflow...", { id: 'save' })
    try {
      const { nodes, edges } = useWorkflowStore.getState()
      const response = await fetch('/api/workflow/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Workflow saved to database", { id: 'save' })
      } else {
        toast.error(`Save failed: ${data.error}`, { id: 'save' })
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: 'save' })
    } finally {
      setIsRunning(false)
    }
  }

  const handleRunWorkflow = async () => {
    setIsRunning(true)
    const store = useWorkflowStore.getState()
    store.nodes.forEach(node => {
      if (node.data?.result) {
        store.updateNodeData(node.id, { result: null })
      }
    })
    store.setAllNodeStatuses('running')
    toast.loading("Executing workflow...", { id: 'run' })

    try {
      const { nodes, edges } = store
      
      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, scope: 'FULL' }),
      })

      const data = await response.json()

      if (data.success) {
        const dur = data.duration ? `${(data.duration / 1000).toFixed(1)}s` : ''
        
        // Update per-node statuses and write results into canvas nodes
        if (data.nodeResults) {
          for (const [nodeId, result] of Object.entries(data.nodeResults as Record<string, any>)) {
            useWorkflowStore.getState().setNodeStatus(nodeId, result.status === 'SUCCESS' ? 'success' : 'error')
            if (result.output) {
              useWorkflowStore.getState().updateNodeData(nodeId, { result: result.output })
            }
          }
        } else {
          // Fallback: mark all based on overall status
          store.setAllNodeStatuses(data.status === 'SUCCESS' ? 'success' : 'error')
        }

        if (data.status === 'SUCCESS') {
          toast.success(`Workflow completed in ${dur}`, { id: 'run' })
        } else {
          toast.error(`Workflow finished with errors (${dur})`, { id: 'run' })
        }
      } else {
        store.setAllNodeStatuses('error')
        toast.error(`Execution failed: ${data.error || 'Server error'}`, { id: 'run' })
      }
    } catch (err: any) {
      useWorkflowStore.getState().setAllNodeStatuses('error')
      toast.error(`Execution failed: ${err.message}`, { id: 'run' })
    } finally {
      setIsRunning(false)
      // Clear statuses after 5 seconds
      setTimeout(() => useWorkflowStore.getState().clearStatuses(), 5000)
    }
  }

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-sm font-bold shadow-lg shadow-purple-500/20">
          NF
        </div>
        <h1 className="text-sm font-medium tracking-wide">NextFlow</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleLoadSample} className="text-zinc-400 hover:text-zinc-100 hidden sm:flex">
          <Box className="h-4 w-4 mr-2" /> Load Sample
        </Button>

        <div className="w-px h-4 bg-zinc-800 mx-1 hidden sm:block" />

        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-zinc-400 hover:text-zinc-100 hidden sm:flex">
          <Upload className="h-4 w-4 mr-2" /> Import
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
        
        <Button variant="ghost" size="sm" onClick={handleExport} className="text-zinc-400 hover:text-zinc-100 hidden sm:flex">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>

        <div className="w-px h-4 bg-zinc-800 mx-1" />

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSaveWorkflow}
          disabled={isRunning}
          className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
        >
          {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save
        </Button>
        <Button 
          size="sm" 
          onClick={handleRunWorkflow}
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md shadow-purple-500/20 w-[140px]"
        >
          {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />} 
          {isRunning ? "Running..." : "Run Workflow"}
        </Button>
      </div>
    </header>
  )
}
