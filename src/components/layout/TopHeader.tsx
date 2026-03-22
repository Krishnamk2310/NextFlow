"use client"

import { Button } from '@/components/ui/button'
import { Download, Upload, Play, Save, Box, Loader2, Zap, Undo2, Redo2 } from 'lucide-react'
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

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse response as JSON. Raw response:", text.slice(0, 200));
        throw new Error(`Invalid response format (not JSON). ${text.slice(0, 50)}...`);
      }

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
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-black/40 px-6 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
            {/* Subtle inner glow for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
            <Zap className="h-5 w-5 fill-white text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tighter text-white leading-none">NEXTFLOW</h1>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mt-1 group-hover:text-purple-400 transition-colors">Core Engine</span>
          </div>
        </div>
        
        <div className="h-6 w-px bg-white/5 mx-2 hidden md:block" />
        
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Operational</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 mr-4">
          <Button variant="ghost" size="sm" onClick={handleLoadSample} className="h-10 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 gap-2 px-4 rounded-xl transition-all">
            <Box className="h-3.5 w-3.5" /> Samples
          </Button>

          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-10 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 gap-2 px-4 rounded-xl transition-all">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          
          <Button variant="ghost" size="sm" onClick={handleExport} className="h-10 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 gap-2 px-4 rounded-xl transition-all">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>

        <div className="h-8 w-px bg-white/5 mx-2 hidden md:block" />

        <div className="flex items-center gap-1 mr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => useWorkflowStore.getState().undo()}
            disabled={!useWorkflowStore(s => s.canUndo)}
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all rounded-lg"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => useWorkflowStore.getState().redo()}
            disabled={!useWorkflowStore(s => s.canRedo)}
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all rounded-lg"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSaveWorkflow}
            disabled={isRunning}
            className="h-11 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-[11px] font-bold uppercase tracking-widest text-zinc-200 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save
          </Button>

          <Button 
            size="sm" 
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-[11px] font-black uppercase tracking-widest px-8 rounded-xl transition-all shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 min-w-[170px]"
          >
            {isRunning ? (
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <Play className="h-4 w-4 fill-current" />
                <span>Execute Flow</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
