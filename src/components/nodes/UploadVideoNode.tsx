import { useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import { NodeCard } from './NodeCard'
import { Video, UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/store/workflowStore'

export function UploadVideoNode({ id, data }: { id: string, data: any }) {
  const status = useWorkflowStore(s => s.nodeStatuses[id] || 'idle')
  const updateNodeData = useWorkflowStore(s => s.updateNodeData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      updateNodeData(id, { videoUrl: url })
    }
  }

  const handleRemove = () => {
    updateNodeData(id, { videoUrl: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <NodeCard id={id} title="Upload Video" icon={<Video className="h-4 w-4" />} status={status}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="video/*" 
        onChange={handleFileChange}
      />

      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-950 hover:bg-zinc-900 transition-colors relative group">
        {data.videoUrl ? (
          <>
            <video src={data.videoUrl} controls className="max-h-[150px] rounded" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRemove}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-zinc-900/80 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-zinc-400" />
            </Button>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-zinc-500 mb-2" />
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
            >
              Select Video
            </Button>
            <p className="text-xs text-zinc-500 mt-2 text-center">Supports MP4, MOV, WEBM, M4V</p>
          </>
        )}
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="output"
        className="!h-3 !w-3 !bg-orange-500 !border-2 !border-zinc-900"
      />
    </NodeCard>
  )
}
