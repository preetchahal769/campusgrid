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
  
  const navItems: NavItem[] = [
    { label: "Dashboard", icon: RiDashboard3Line, href: `/${rolePath}` },
    { label: "Academics", icon: RiBuilding2Line, href: isStudent ? "/timetable" : `/${rolePath}/schedule` },
    { label: "Profile", icon: RiUserLine, href: isStudent ? "/profile" : `/${rolePath}/profile` },
  ]

  return (
    <div className="fixed md:hidden bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[100]">
      <nav className="flex items-center justify-around bg-[#1A1A1A] p-2 rounded-full shadow-2xl h-[70px]">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-300",
                isActive 
                  ? "text-white" 
                  : "text-zinc-500 hover:text-zinc-300",
                // First item gets the special circle look from the mockup
                idx === 0 && isActive ? "bg-black border border-white/10 w-[54px] h-[54px]" : "w-[54px] h-[54px]"
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
