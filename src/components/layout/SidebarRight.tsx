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
  if (status === 'SUCCESS') return 'border-emerald-500/30 bg-emerald-500/5'
  if (status === 'FAILED') return 'border-red-500/30 bg-red-500/5'
  if (status === 'RUNNING') return 'border-purple-500/30 bg-purple-500/5'
  return 'border-zinc-700 bg-zinc-900/50'
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
      const data = await res.json()
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
    <aside className={`relative flex h-full flex-col border-l border-zinc-800 bg-zinc-950/80 transition-all duration-300 ${collapsed ? 'w-16' : 'w-80'}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-4 top-4 z-10 h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900 shadow-md hover:bg-zinc-800"
      >
        {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className="border-b border-zinc-800 p-4 shrink-0 flex items-center justify-between">
        {!collapsed && (
          <>
            <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
              <History className="h-4 w-4 text-purple-400"/>
              Run History
            </h2>
            <Button variant="ghost" size="icon" onClick={fetchRuns} className="h-7 w-7 text-zinc-500 hover:text-zinc-300">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </>
        )}
        {collapsed && <History className="h-5 w-5 mx-auto text-zinc-400" />}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!collapsed && runs.length === 0 && (
          <div className="p-4 flex flex-col items-center justify-center h-full text-zinc-500">
            <p className="text-sm text-center">No workflow runs yet.<br/>Execute a node to see history.</p>
          </div>
        )}

        {!collapsed && runs.map((run) => (
          <div key={run.id} className="border-b border-zinc-800/50">
            <div
              onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
              className={`w-full text-left p-3 hover:bg-zinc-900/50 transition-colors group cursor-pointer ${expandedRun === run.id ? 'bg-zinc-900/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {statusIcon(run.status)}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200 truncate max-w-[120px]">
                      {run.workflow?.name || 'Workflow'}
                    </span>
                    <span className="text-[10px] text-zinc-600">{timeAgo(run.startedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleRestore(run, e)}
                    className="h-6 px-2 text-[10px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Restore
                  </Button>
                  <div
                    onClick={(e) => handleDelete(run.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColor(run.status)}`}>
                  {run.status}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {run.nodeRuns.length} nodes • {run.scope}
                  {run.duration ? ` • ${(run.duration / 1000).toFixed(1)}s` : ''}
                </span>
              </div>
            </div>

            {expandedRun === run.id && (
              <div className="px-3 pb-3 space-y-1">
                {run.nodeRuns.map((nr) => {
                  const outputText = nr.outputs?.result 
                    ? (typeof nr.outputs.result === 'string' ? nr.outputs.result : JSON.stringify(nr.outputs.result))
                    : null
                  
                  const copyToClipboard = (text: string, e: React.MouseEvent) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(text);
                    toast.success("Result copied to clipboard");
                  };

                  return (
                    <div key={nr.id} className={`rounded-xl border ${statusColor(nr.status)} overflow-hidden bg-zinc-900/20`}>
                      <div className="flex items-center gap-2 px-2.5 py-2">
                        {statusIcon(nr.status)}
                        <span className="text-[11px] font-semibold text-zinc-300 flex-1 truncate">{nr.nodeId}</span>
                        <span className="text-[10px] text-zinc-500 font-medium px-1.5 py-0.5 bg-zinc-800 rounded">{nr.nodeType}</span>
                      </div>
                      {outputText && (
                        <div className="px-2.5 pb-2.5 space-y-2">
                          <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                            {outputText}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => copyToClipboard(outputText, e)}
                            className="h-6 w-full text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                          >
                            Copy Result
                          </Button>
                        </div>
                      )}
                      {nr.error && (
                        <div className="px-2.5 pb-2.5">
                          <p className="text-[10px] text-red-400 font-medium bg-red-500/5 p-2 rounded border border-red-500/10">{nr.error}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
                {run.nodeRuns.length === 0 && (
                  <p className="text-[10px] text-zinc-600 text-center py-2">No node data</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
