import { useEffect, useState, useRef } from 'react'
import { Handle, Position, useEdges, useNodes } from '@xyflow/react'
import { NodeCard } from './NodeCard'
import { Scissors, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/store/workflowStore'

export function ExtractFrameNode({ id, data }: { id: string, data: any }) {
  const status = useWorkflowStore(s => s.nodeStatuses[id] || 'idle')
  const updateNodeData = useWorkflowStore(s => s.updateNodeData)
  const edges = useEdges()
  const nodes = useNodes()
  const [timestamp, setTimestamp] = useState(data.timestamp || '0')
  
  // Find the video source
  const incomingEdge = edges.find(e => e.target === id && e.targetHandle === 'video_url')
  const sourceNode = nodes.find(n => n.id === incomingEdge?.source)
  const videoUrl = sourceNode?.data?.videoUrl as string

  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!videoUrl) return

    let objectUrlToRevoke: string | null = null
    let fallbackAttempted = false

    const video = document.createElement('video')
    videoRef.current = video
    video.muted = true
    video.playsInline = true
    
    // Only set crossOrigin for remote URLs to avoid blob/data-url errors
    if (videoUrl.startsWith('http')) {
      video.crossOrigin = 'anonymous'
    }

    const handleCapture = () => {
      // Small delay to ensure the frame is actually rendered after seek
      setTimeout(() => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx && video.videoWidth > 0) {
          ctx.drawImage(video, 0, 0)
          try {
            const frame = canvas.toDataURL('image/jpeg', 0.8)
            updateNodeData(id, { frame, error: undefined })
          } catch (err) {
            console.error("Canvas taint error during frame extraction:", err)
            updateNodeData(id, { error: "Failed to extract frame. Cross-origin constraint or tainted canvas." })
          }
        }
      }, 200)
    }

    video.onerror = (e) => {
      // If native load failed due to being an unsupported source (Code 4 - like github raw text/plain)
      // we can attempt to fetch it directly as a Blob to circumvent MIME type security headers
      if (!fallbackAttempted && videoUrl.startsWith('http') && video.error?.code === 4) {
        fallbackAttempted = true
        console.log("Native load failed (Code 4), attempting Blob fetch fallback for URL:", videoUrl)
        
        fetch(videoUrl)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for URL: ${videoUrl}`)
            return res.blob()
          })
          .then(blob => {
            // Forcefully cast the blob strictly to a video type to satisfy the browser decoder
            const rawBlob = new Blob([blob], { type: 'video/mp4' }) 
            objectUrlToRevoke = URL.createObjectURL(rawBlob)
            video.removeAttribute('crossOrigin') // Blobs are same-origin, crossOrigin is unneeded
            video.src = objectUrlToRevoke
            video.load()
          })
          .catch(err => {
            console.error("Blob fallback fetch also failed:", err)
            const errorMsg = video.error ? video.error.message || `Code ${video.error.code}` : "Unknown error"
            updateNodeData(id, { error: `Failed to load video (${errorMsg}). Blob fallback failed.` })
          })
        return
      }

      const errorMsg = video.error ? video.error.message || `Code ${video.error.code}` : "Unknown error"
      console.error("Video load error in ExtractFrameNode:", e, video.error, "URL:", videoUrl)
      updateNodeData(id, { error: `Failed to load video (${errorMsg}). Check CORS or format.` })
    }

    video.onloadedmetadata = () => {
       let time = 0
       if (typeof timestamp === 'string' && timestamp.includes('%')) {
         const percent = (parseFloat(timestamp.replace('%', '')) || 0) / 100
         time = video.duration * percent
       } else {
         time = parseFloat(timestamp as string) || 0
       }
       time = Math.max(0, Math.min(time, video.duration))
       video.currentTime = time
    }

    video.onseeked = handleCapture

    video.src = videoUrl
    video.load()

    return () => {
      video.onseeked = null
      video.onloadedmetadata = null
      video.onerror = null
      video.removeAttribute('src') // Safest way to clear video source
      video.load()
      videoRef.current = null
      
      // Free up Blob memory when the component unmounts or videoUrl changes
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke)
      }
    }
  }, [videoUrl, id])

  // Separate effect to handle seeking when timestamp changes without recreating the video
  useEffect(() => {
    const video = videoRef.current
    if (!video || !video.duration) return
    
    let time = 0
    if (typeof timestamp === 'string' && timestamp.includes('%')) {
      const percent = (parseFloat(timestamp.replace('%', '')) || 0) / 100
      time = video.duration * percent
    } else {
      time = parseFloat(timestamp as string) || 0
    }
    time = Math.max(0, Math.min(time, video.duration))
    
    video.currentTime = time
  }, [timestamp])

  const manualCapture = () => {
    if (!videoUrl) return
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    if (videoUrl.startsWith('http')) {
      video.crossOrigin = 'anonymous'
    }

    video.onerror = (e) => {
      console.error("Manual capture video error:", e, video.error)
    }

    video.onloadedmetadata = () => {
      let time = 0
      if (typeof timestamp === 'string' && timestamp.includes('%')) {
        const percent = (parseFloat(timestamp.replace('%', '')) || 0) / 100
        time = video.duration * percent
      } else {
        time = parseFloat(timestamp as string) || 0
      }
      time = Math.max(0, Math.min(time, video.duration))
      video.currentTime = time
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        try {
          updateNodeData(id, { frame: canvas.toDataURL('image/jpeg', 0.8), error: undefined })
        } catch (err) {
          updateNodeData(id, { error: "Failed to extract frame (CORS taint)." })
        }
      }
    }

    video.src = videoUrl
    video.load()
  }

  return (
    <NodeCard id={id} title="Extract Frame" icon={<Scissors className="h-4 w-4" />} status={status}>
      <Handle type="target" position={Position.Left} id="video_url" className="!h-3 !w-3 !bg-orange-500 !border-2 !border-zinc-900" style={{ top: '30%' }} />
      <span className="absolute left-[-55px] top-[26%] text-xs text-zinc-500">Video</span>

      <Handle type="target" position={Position.Left} id="timestamp" className="!h-3 !w-3 !bg-zinc-500 !border-2 !border-zinc-900" style={{ top: '70%' }} />
      <span className="absolute left-[-75px] top-[66%] text-xs text-zinc-500">Timestamp</span>

      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">Timestamp (sec or %)</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. 5 or 50%" 
              value={timestamp} 
              onChange={(e) => {
                setTimestamp(e.target.value)
                updateNodeData(id, { timestamp: e.target.value })
              }}
              className="h-8 bg-zinc-950 border-zinc-800 flex-1" 
            />
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={manualCapture}
              className="h-8 px-2 bg-zinc-800 hover:bg-zinc-700 text-[10px]"
            >
              Capture
            </Button>
          </div>
          <p className="text-[10px] text-zinc-500 italic">Tip: Use 1s or 2s if 0s is black.</p>
        </div>

        {data.frame ? (
          <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video relative group">
            <img src={data.frame} alt="Extracted frame" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[10px] text-zinc-300 font-medium">Captured Frame</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-800 aspect-video flex flex-col items-center justify-center text-zinc-600 gap-2">
            <ImageIcon className="h-5 w-5 opacity-20" />
            <span className="text-[10px]">Waiting for video...</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="output" className="!h-3 !w-3 !bg-blue-500 !border-2 !border-zinc-900" />
    </NodeCard>
  )
}

