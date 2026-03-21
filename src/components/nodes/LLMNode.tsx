import { Handle, Position } from '@xyflow/react'
import { NodeCard } from './NodeCard'
import { Cpu, Sparkles } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useWorkflowStore } from '@/store/workflowStore'

export function LLMNode({ id, data }: { id: string, data: any }) {
  const status = useWorkflowStore(s => s.nodeStatuses[id] || 'idle')
  const updateNodeData = useWorkflowStore(s => s.updateNodeData)
  const currentModel = data.model || 'gemini-2.0-flash'

  return (
    <NodeCard id={id} title="Run Any LLM" icon={<Cpu className="h-4 w-4" />} status={status}>
      {/* Inputs Handles */}
      <Handle type="target" position={Position.Left} id="system_prompt" className="!h-3 !w-3 !bg-zinc-500 !border-2 !border-zinc-900" style={{ top: '25%' }} />
      <span className="absolute left-[-80px] top-[21%] text-xs text-zinc-500">System Prompt</span>
      
      <Handle type="target" position={Position.Left} id="user_message" className="!h-3 !w-3 !bg-purple-500 !border-2 !border-zinc-900" style={{ top: '50%' }} />
      <span className="absolute left-[-75px] top-[46%] text-xs text-zinc-500">User Message</span>
      
      <Handle type="target" position={Position.Left} id="images" className="!h-3 !w-3 !bg-blue-500 !border-2 !border-zinc-900" style={{ top: '75%' }} />
      <span className="absolute left-[-45px] top-[71%] text-xs text-zinc-500">Images</span>
      
      {/* Content */}
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">Model</Label>
          <Select 
            value={currentModel} 
            onValueChange={(val) => updateNodeData(id, { model: val })}
          >
            <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-sm h-8">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
              <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Output Inline Display */}
        <div className="mt-2 flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-inner min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Output Result</Label>
            {data.result && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Generated
              </span>
            )}
          </div>
          {data.result ? (
            <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed selection:bg-purple-500/30 font-medium">{data.result}</div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-2 py-4">
              <Sparkles className="h-5 w-5 opacity-20" />
              <p className="text-[11px] italic">No output yet. Connect inputs and run.</p>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="output"
        className="!h-3 !w-3 !bg-purple-500 !border-2 !border-zinc-900"
      />
    </NodeCard>
  )
}
