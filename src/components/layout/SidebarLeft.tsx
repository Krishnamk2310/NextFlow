import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Video, Sparkles, Crop, Scissors, Zap, Pencil, Compass, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SignOutButton, useUser } from '@clerk/nextjs'

const NODES = [
  { id: 'text', icon: FileText, label: 'Text Node', bgColor: 'bg-zinc-100', iconColor: 'text-zinc-900' },
  { id: 'upload-image', icon: ImageIcon, label: 'Upload Image', bgColor: 'bg-white', iconColor: 'text-blue-500' },
  { id: 'upload-video', icon: Video, label: 'Upload Video', bgColor: 'bg-yellow-500', iconColor: 'text-white' },
  { id: 'llm', icon: Sparkles, label: 'Run Any LLM', bgColor: 'bg-zinc-900', iconColor: 'text-zinc-100 border border-zinc-700' },
  { id: 'crop-image', icon: Crop, label: 'Crop Image', bgColor: 'bg-blue-600', iconColor: 'text-white' },
  { id: 'extract-frame', icon: Scissors, label: 'Extract Frame', bgColor: 'bg-purple-600', iconColor: 'text-white' },
]

export function SidebarLeft() {
  const { user } = useUser()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = NODES.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className={`relative flex h-full flex-col border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 z-20 ${collapsed ? 'w-20' : 'w-64'}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-4 z-10 h-8 w-8 rounded-full border border-white/10 bg-zinc-900 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-zinc-800 transition-all text-zinc-400"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {!collapsed && (
        <div className="p-4 border-b border-white/5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
            {mounted ? (
              <Input 
                placeholder="Search components..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full bg-white/[0.03] pl-9 text-[13px] text-zinc-100 placeholder:text-zinc-600 border-white/5 focus-visible:ring-purple-500/50 rounded-xl backdrop-blur-md transition-all"
                suppressHydrationWarning
              />
            ) : (
              <div className="h-10 w-full bg-white/[0.03] border border-white/5 rounded-xl animate-pulse" />
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {!collapsed && (
          <div className="px-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Components</span>
          </div>
        )}
        
        {filtered.map((node) => (
          <Button 
            key={node.id}
            variant="ghost" 
            draggable
            onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, node.id)}
            className={`
              w-full justify-start ${collapsed ? 'px-0 justify-center' : 'px-3'} py-8
              hover:bg-white/[0.05] group relative border border-transparent 
              hover:border-white/5 rounded-2xl transition-all duration-300
            `}
          >
            <div className={`
              flex items-center justify-center h-10 w-10 shrink-0 rounded-xl 
              ${node.bgColor} transition-transform group-hover:scale-110 shadow-lg shadow-black/20
              ${collapsed ? '' : 'mr-4'}
            `}>
              <node.icon className={`h-5 w-5 ${node.iconColor}`} />
            </div>
            {!collapsed && (
              <div className="flex flex-col items-start translate-y-[1px]">
                <span className="font-bold text-[14px] text-zinc-200 group-hover:text-white transition-colors">{node.label}</span>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">Core Node</span>
              </div>
            )}
            
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent pointer-events-none transition-all" />
          </Button>
        ))}
      </div>

      <div className="p-3 border-t border-white/5 shrink-0 space-y-3 bg-black/20 backdrop-blur-md">
        {user && (
          <div className={`
            group flex items-center ${collapsed ? 'justify-center p-1' : 'px-3 py-3'} 
            gap-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] 
            hover:border-white/10 transition-all duration-500 cursor-default
          `}>
            <div className="relative shrink-0">
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-500 shadow-2xl" 
                  alt="Profile" 
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-sm font-black text-purple-400 border border-purple-500/20">
                  {user.firstName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-lg" />
            </div>
            
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-zinc-200 truncate tracking-tight mb-0.5 group-hover:text-white transition-colors">
                  {user.fullName || user.firstName || 'Anonymous'}
                </span>
                <span className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                  Active Pro
                </span>
              </div>
            )}
          </div>
        )}

        <SignOutButton redirectUrl="/">
          <Button 
            variant="ghost" 
            className={`
              w-full justify-start ${collapsed ? 'px-0 justify-center' : 'px-3'} py-7 
              hover:bg-red-500/10 group relative border border-transparent 
              hover:border-red-500/10 rounded-2xl transition-all duration-500 text-red-400/70 hover:text-red-400
            `}
          >
            <div className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-red-500/10 ${collapsed ? 'mx-auto' : 'mr-4'} transition-all group-hover:scale-110 shadow-lg shadow-red-500/10`}>
              <LogOut className="h-5 w-5" />
            </div>
            {!collapsed && <span className="font-bold text-[14px] tracking-tight">Sign Out</span>}
          </Button>
        </SignOutButton>
      </div>
    </aside>

  )
}
