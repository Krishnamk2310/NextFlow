import { ReactNode } from 'react'
import { Trash2, Loader2, CheckCircle2, XCircle, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/store/workflowStore'
import { toast } from 'sonner'

interface NodeCardProps {
  id: string
  title: string
  icon?: React.ReactNode
  children: ReactNode
  isRunning?: boolean
  status?: 'idle' | 'running' | 'success' | 'error'
}

export function NodeCard({ id, title, icon, children, isRunning, status = 'idle' }: NodeCardProps) {
  const effectiveStatus = isRunning ? 'running' : status
  const deleteNode = useWorkflowStore(s => s.deleteNode)

  const handleDelete = () => {
    deleteNode(id)
  }

  return (
    <div className={`
      relative flex flex-col w-80 rounded-2xl border transition-all duration-500 glass-card
      overflow-hidden
      ${effectiveStatus === 'running' ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.25)]' : ''}
      ${effectiveStatus === 'success' ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : ''}
      ${effectiveStatus === 'error' ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : ''}
      ${effectiveStatus === 'idle' ? 'hover:border-white/20 hover:shadow-2xl hover:shadow-black/60 group' : ''}
    `}>
      {/* Glow Effect for States */}
      {effectiveStatus !== 'idle' && (
        <div className={`
          absolute inset-0 pointer-events-none opacity-20 blur-2xl transition-opacity duration-500
          ${effectiveStatus === 'running' ? 'bg-purple-500' : ''}
          ${effectiveStatus === 'success' ? 'bg-emerald-500' : ''}
          ${effectiveStatus === 'error' ? 'bg-red-500' : ''}
        `} />
      )}

      {/* Header */}
      <div className={`
        flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3 relative z-10
        ${effectiveStatus === 'running' ? 'bg-purple-500/10' : ''}
        ${effectiveStatus === 'success' ? 'bg-emerald-500/10' : ''}
        ${effectiveStatus === 'error' ? 'bg-red-500/10' : ''}
      `}>
        {icon && <div className={`
          transition-colors duration-300
          ${effectiveStatus === 'running' ? 'text-purple-400' : ''}
          ${effectiveStatus === 'success' ? 'text-emerald-400' : ''}
          ${effectiveStatus === 'error' ? 'text-red-400' : ''}
          ${effectiveStatus === 'idle' ? 'text-zinc-400' : ''}
        `}>{icon}</div>}
        <h3 className="text-sm font-bold tracking-tight text-white/90">{title}</h3>
        
        <div className="ml-auto flex items-center gap-2">
          {effectiveStatus === 'idle' && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => useWorkflowStore.getState().runNode(id)}
                className="h-7 w-7 text-purple-400 hover:text-purple-100 hover:bg-purple-500/20 rounded-lg transition-all"
                title="Run this node"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
                className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {effectiveStatus === 'running' && (
            <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
          )}
          {effectiveStatus === 'success' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          )}
          {effectiveStatus === 'error' && (
            <XCircle className="h-4 w-4 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4 text-zinc-300 relative z-10 bg-black/10">
        {children}
      </div>
    </div>
  )
}
