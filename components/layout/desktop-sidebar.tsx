"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { RiDashboard3Line, RiBuilding2Line, RiUserLine, RiLogoutBoxLine } from "@remixicon/react"
import { useAppDispatch } from "@/lib/store/hooks"
import { logout } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"

import { useAppSelector } from "@/lib/store/hooks"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}
export function DesktopSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
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

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" })
    } catch (error) {
      console.warn('Logout failed', error)
    }
    dispatch(logout())
    router.push("/login")
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-2rem)] sticky top-4 left-4 z-40 bg-white border border-zinc-100 rounded-3xl shadow-sm p-4 mr-4">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-sm">S</div>
          <p className="text-lg font-black tracking-tight text-zinc-900">SikshaTantar</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/20" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "scale-110 transition-transform")} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-border/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-destructive hover:bg-destructive/10 transition-all duration-300 font-medium"
        >
          <RiLogoutBoxLine className="w-5 h-5" />
          <span className="text-sm tracking-tight">Disconnect</span>
        </button>
      </div>
    </aside>
  )
}
