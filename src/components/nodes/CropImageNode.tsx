import { Handle, Position } from '@xyflow/react'
import { NodeCard } from './NodeCard'
import { Crop } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkflowStore } from '@/store/workflowStore'

export function CropImageNode({ id, data }: { id: string, data: any }) {
  const status = useWorkflowStore(s => s.nodeStatuses[id] || 'idle')

  return (
    <NodeCard id={id} title="Crop Image" icon={<Crop className="h-4 w-4" />} status={status}>
      <Handle type="target" position={Position.Left} id="image_url" className="!h-3 !w-3 !bg-blue-500 !border-2 !border-zinc-900" style={{ top: '20%' }} />
      <span className="absolute left-[-60px] top-[16%] text-xs text-zinc-500">Image</span>

      <Handle type="target" position={Position.Left} id="x_percent" className="!h-3 !w-3 !bg-zinc-500 !border-2 !border-zinc-900" style={{ top: '40%' }} />
      <Handle type="target" position={Position.Left} id="y_percent" className="!h-3 !w-3 !bg-zinc-500 !border-2 !border-zinc-900" style={{ top: '55%' }} />
      <Handle type="target" position={Position.Left} id="width_percent" className="!h-3 !w-3 !bg-zinc-500 !border-2 !border-zinc-900" style={{ top: '70%' }} />
      <Handle type="target" position={Position.Left} id="height_percent" className="!h-3 !w-3 !bg-zinc-500 !border-2 !border-zinc-900" style={{ top: '85%' }} />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">X (%)</Label>
          <Input type="number" defaultValue={0} disabled={data.hasXConnection} className="h-8 bg-zinc-950 border-zinc-800" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">Y (%)</Label>
          <Input type="number" defaultValue={0} disabled={data.hasYConnection} className="h-8 bg-zinc-950 border-zinc-800" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">Width (%)</Label>
          <Input type="number" defaultValue={100} disabled={data.hasWidthConnection} className="h-8 bg-zinc-950 border-zinc-800" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">Height (%)</Label>
          <Input type="number" defaultValue={100} disabled={data.hasHeightConnection} className="h-8 bg-zinc-950 border-zinc-800" />
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" className="!h-3 !w-3 !bg-blue-500 !border-2 !border-zinc-900" />
    </NodeCard>
  )
}
