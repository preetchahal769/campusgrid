"use client"

import * as React from "react"
import { MobileNav } from "./mobile-nav"
import { DesktopSidebar } from "./desktop-sidebar"
import { TopHeader } from "./top-header"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-zinc-900 flex md:p-4">
      <DesktopSidebar />
      <main 
        className={cn(
          "flex-1 w-full relative min-h-screen md:min-h-[calc(100vh-2rem)]",
          "pb-28 md:pb-0 md:pl-4", // Mobile needs heavy bottom padding
        )}
        style={{
          paddingBottom: "max(7rem, env(safe-area-inset-bottom))"
        }}
      >
        <div className="w-full h-full bg-[#F8F9FA] md:border md:border-border/40 md:rounded-3xl md:shadow-sm overflow-hidden relative flex flex-col">
           <TopHeader />
           <div className="flex-1 overflow-y-auto">
             {children}
           </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
