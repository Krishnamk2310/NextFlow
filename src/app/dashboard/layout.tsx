import { ReactNode } from "react";
import { TopHeader } from "@/components/layout/TopHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30">
      <TopHeader />

      {/* Main Workspace Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar will be injected here by children or layout segments */}
        {children}
        {/* Right Sidebar will be injected here similarly */}
      </main>
    </div>
  );
}
