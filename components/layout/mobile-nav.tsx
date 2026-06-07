"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { RiDashboard3Line, RiBuilding2Line, RiUserLine } from "@remixicon/react"

import { useAppSelector } from "@/lib/store/hooks"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const isStudent = user?.role === 'STUDENT'
  const rolePath = user?.role === 'SUPER_ADMIN' ? 'super_admin' : user?.role?.toLowerCase() || 'student'
  
  let secondTabHref = `/${rolePath}/schedule`
  if (isStudent) secondTabHref = "/timetable"
  if (user?.role === 'PRINCIPAL') secondTabHref = "/principal/staff-attendance"
  if (user?.role === 'SUPER_ADMIN') secondTabHref = "/super_admin/schools"
  
  const navItems: NavItem[] = [
    { label: "Dashboard", icon: RiDashboard3Line, href: `/${rolePath}` },
    { label: "Operations", icon: RiBuilding2Line, href: secondTabHref },
    { label: "Profile", icon: RiUserLine, href: isStudent ? "/profile" : `/${rolePath}/profile` },
  ]

  return (
    <div className="fixed md:hidden bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[100]">
      <nav className="flex items-center justify-around bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800 p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] h-[70px]">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "relative flex items-center justify-center rounded-[1.5rem] transition-all duration-300",
                isActive 
                  ? "bg-[#0A4EA6] text-white shadow-md scale-105 w-[54px] h-[54px]" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 w-[54px] h-[54px]"
              )}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
