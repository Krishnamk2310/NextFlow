import { useState } from 'react'
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

  const filtered = NODES.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className={`relative flex h-full flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-4 z-10 h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900 shadow-md hover:bg-zinc-800"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {!collapsed && (
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search nodes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full bg-zinc-900 pl-9 text-sm text-zinc-100 placeholder:text-zinc-500 border-zinc-800 focus-visible:ring-purple-500"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.map((node) => (
          <Button 
            key={node.id}
            variant="ghost" 
            draggable
            onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, node.id)}
            className={`w-full justify-start ${collapsed ? 'px-1' : 'px-2'} py-7 hover:bg-zinc-900 group relative border border-transparent rounded-xl transition-all`}
          >
            <div className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-xl ${node.bgColor} ${collapsed ? 'mx-auto' : 'mr-3'} transition-transform group-hover:scale-105 shadow-sm`}>
              <node.icon className={`h-5 w-5 ${node.iconColor}`} />
            </div>
            {!collapsed && <span className="font-semibold text-[15px] text-zinc-200">{node.label}</span>}
          </Button>
        ))}
      </div>

      <div className="p-3 border-t border-zinc-800 shrink-0 space-y-3 bg-zinc-950/50 backdrop-blur-sm">
        {user && (
          <div className={`
            group flex items-center ${collapsed ? 'justify-center p-1' : 'px-3 py-3'} 
            gap-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] 
            hover:border-white/10 transition-all duration-300 cursor-default
          `}>
            <div className="relative shrink-0">
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-500 shadow-xl" 
                  alt="Profile" 
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary border border-primary/20">
                  {user.firstName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-lg" />
            </div>
            
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-zinc-100 truncate tracking-tight leading-none mb-1">
                  {user.fullName || user.firstName || 'Anonymous'}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 truncate uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                  {user.primaryEmailAddress?.emailAddress}
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
              hover:bg-red-500/5 group relative border border-transparent 
              hover:border-red-500/10 rounded-2xl transition-all duration-300 text-red-400
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
