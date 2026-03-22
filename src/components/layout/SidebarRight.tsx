"use client"

import { useState, useEffect, useCallback } from 'react'
import { History, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2, Clock, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/store/workflowStore'

interface NodeRun {
  id: string
  nodeId: string
  nodeType: string
  status: string
  startedAt: string
  completedAt: string | null
  error: string | null
  outputs: any
}

interface WorkflowRun {
  id: string
  status: string
  scope: string
  startedAt: string
  completedAt: string | null
  duration: number | null
  nodeRuns: NodeRun[]
  workflow: { 
    name: string
    nodes: any[]
    edges: any[]
  }
}

function statusIcon(status: string) {
  if (status === 'SUCCESS') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
  if (status === 'FAILED') return <XCircle className="h-3.5 w-3.5 text-red-400" />
  if (status === 'RUNNING') return <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin" />
  return <Clock className="h-3.5 w-3.5 text-zinc-500" />
}

function statusColor(status: string) {
  if (status === 'SUCCESS') return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
  if (status === 'FAILED') return 'border-red-500/20 text-red-400 bg-red-500/5'
  if (status === 'RUNNING') return 'border-purple-500/20 text-purple-400 bg-purple-500/5'
  return 'border-zinc-700/50 text-zinc-500 bg-zinc-800/20'
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function SidebarRight() {
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)

  const setWorkflow = useWorkflowStore(s => s.setWorkflow)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchRuns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/workflow/runs')
      const text = await res.text()
      const data = JSON.parse(text)
      setRuns(data.runs || [])
    } catch (err) {
      console.error("Failed to fetch runs:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchRuns()
    const interval = setInterval(fetchRuns, 10000)
    return () => clearInterval(interval)
  }, [fetchRuns, mounted])

  if (!mounted) return null

  const handleRestore = (run: WorkflowRun, e: React.MouseEvent) => {
    e.stopPropagation()
    if (run.workflow?.nodes && run.workflow?.edges) {
      setWorkflow(run.workflow.nodes as any, run.workflow.edges as any)
      toast.success("Workflow restored from history")
    } else {
      toast.error("No workflow data found for this run")
    }
  }

  const handleDelete = async (runId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch('/api/workflow/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId })
      })
      const data = await res.json()
      if (data.success) {
        setRuns(prev => prev.filter(r => r.id !== runId))
        toast.success("Run deleted")
      } else {
        toast.error("Failed to delete run")
      }
    } catch {
      toast.error("Failed to delete run")
    }
  }

  return (
    <aside className={`relative flex h-full flex-col border-l border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 z-20 ${collapsed ? 'w-20' : 'w-80'}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-4 top-4 z-30 h-8 w-8 rounded-full border border-white/10 bg-zinc-900 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-zinc-800 transition-all text-zinc-400"
      >
        {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className="border-b border-white/5 p-4 shrink-0 flex items-center justify-between">
        {!collapsed && (
          <>
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-purple-400"/>
              Workflow History
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchRuns} 
              className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </>
        )}
        {collapsed && <History className="h-5 w-5 mx-auto text-zinc-500" />}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {!mounted ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-20">
            <Clock className="h-10 w-10 mb-4 stroke-[1.5]" />
            <div className="h-2 w-24 bg-zinc-800 rounded" />
          </div>
        ) : runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600 opacity-40">
            <Clock className="h-10 w-10 mb-4 stroke-[1.5]" />
            <p className="text-xs font-bold uppercase tracking-widest text-center">No Activity Yet</p>
          </div>
        ) : (
          runs.map((run) => (
            <div 
              key={run.id} 
              className={`
                group rounded-2xl border transition-all duration-300 overflow-hidden
                ${expandedRun === run.id ? 'bg-white/[0.08] border-white/10 shadow-xl' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}
              `}
            >
              <div
                onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${run.status === 'RUNNING' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''} ${run.status === 'SUCCESS' ? 'bg-emerald-500' : run.status === 'FAILED' ? 'bg-red-500' : 'bg-zinc-500'}`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-200 truncate max-w-[140px] group-hover:text-white transition-colors">
                        {run.workflow?.name || 'Untitled Flow'}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{timeAgo(run.startedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRestore(run, e)}
                      className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-100 hover:bg-purple-500/20 rounded-full transition-all"
                    >
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(run.id, e)}
                      className="h-7 w-7 rounded-full text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusColor(run.status)}`}>
                    {run.status}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight opacity-60">
                    {run.nodeRuns.length} Steps • {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : 'Active'}
                  </span>
                </div>
              </div>

              {expandedRun === run.id && (
                <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-3 bg-black/20">
                  {run.nodeRuns.map((nr) => {
                    const outputText = nr.outputs?.result 
                      ? (typeof nr.outputs.result === 'string' ? nr.outputs.result : JSON.stringify(nr.outputs.result, null, 2))
                      : null
                    
                    const copyToClipboard = (text: string, e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(text);
                      toast.success("Result copied");
                    };

                    return (
                      <div key={nr.id} className={`rounded-xl border ${statusColor(nr.status)} overflow-hidden bg-white/[0.02]`}>
                        <div className="flex items-center gap-2 p-3 pb-2">
                          {statusIcon(nr.status)}
                          <span className="text-[11px] font-bold text-zinc-300 flex-1 truncate">{nr.nodeId}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-1.5 py-0.5 bg-white/5 rounded-md">
                            {nr.nodeType}
                          </span>
                        </div>
                        {outputText && (
                          <div className="px-3 pb-3 space-y-2">
                            <p className="text-[10px] text-zinc-400 whitespace-pre-wrap leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5 max-h-[120px] overflow-y-auto custom-scrollbar font-medium">
                              {outputText}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => copyToClipboard(outputText, e)}
                              className="h-6 w-full text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md"
                            >
                              Copy Output
                            </Button>
                          </div>
                        )}
                        {nr.error && (
                          <div className="px-3 pb-3">
                            <p className="text-[10px] text-red-400 font-bold bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">{nr.error}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {run.nodeRuns.length === 0 && (
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center py-2 opacity-50">No activity data</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
