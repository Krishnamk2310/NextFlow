import { ReactNode } from 'react'
import { Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/store/workflowStore'

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
      relative flex flex-col w-80 rounded-2xl border bg-zinc-900/95 shadow-2xl backdrop-blur-md
      overflow-hidden transition-all duration-300
      ${effectiveStatus === 'running' ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : ''}
      ${effectiveStatus === 'success' ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}
      ${effectiveStatus === 'error' ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
      ${effectiveStatus === 'idle' ? 'border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 group">
        {icon && <div className="text-zinc-400">{icon}</div>}
        <h3 className="text-sm font-semibold tracking-wide text-zinc-100">{title}</h3>
        
        <div className="ml-auto flex items-center gap-2">
          {effectiveStatus === 'idle' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDelete}
              className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {effectiveStatus === 'running' && (
            <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
          )}
          {effectiveStatus === 'success' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          {effectiveStatus === 'error' && (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4 flex flex-col gap-4 text-zinc-300">
        {children}
      </div>
    </div>
  )
}
