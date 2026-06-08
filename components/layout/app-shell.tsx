"use client"

import * as React from "react"
import { MobileNav } from "./mobile-nav"
import { DesktopSidebar } from "./desktop-sidebar"
import { TopHeader } from "./top-header"
import { cn } from "@/lib/utils"

import { usePathname, useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  
  const isDashboardRoot = ["/student", "/teacher", "/principal", "/super_admin"].includes(pathname)

  React.useEffect(() => {
    // Force onboarding if user hasn't filled out their profile
    if (user && !user.phoneNo && user.role !== 'SUPER_ADMIN') {
      router.replace('/onboarding')
    }
  }, [user, router])

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
           {isDashboardRoot && <TopHeader />}
           <div className="flex-1 overflow-y-auto">
             {children}
           </div>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
