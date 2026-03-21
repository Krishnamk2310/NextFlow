import { Handle, Position } from '@xyflow/react'
import { NodeCard } from './NodeCard'
import { FileText } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'

export function TextNode({ id, data }: { id: string, data: any }) {
  const [text, setText] = useState(data.text || '')
  const status = useWorkflowStore(s => s.nodeStatuses[id] || 'idle')

  return (
    <NodeCard id={id} title="Text" icon={<FileText className="h-4 w-4" />} status={status}>
      <div className="relative">
        <Textarea 
          placeholder="Enter prompt or content here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px] resize-y bg-zinc-950 border-zinc-800 text-sm focus-visible:ring-purple-500 placeholder:text-zinc-600"
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          id="output"
          className="!h-3 !w-3 !bg-purple-500 !border-2 !border-zinc-900"
        />
      </div>
    </NodeCard>
  )
}
