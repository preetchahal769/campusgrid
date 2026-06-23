"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  RiDashboard3Line,
  RiBuilding2Line,
  RiUserLine,
  RiLogoutBoxLine,
  RiUserAddLine,
  RiMailSendLine,
  RiBookOpenLine,
  RiTimeLine,
  RiFileShieldLine,
  RiCoinsLine,
  RiMoneyDollarCircleLine,
  RiAddCircleLine,
  RiArrowLeftRightLine,
  RiSlideshowLine,
  RiUserSettingsLine,
  RiCalendarEventLine
} from "@remixicon/react"
import { useAppDispatch } from "@/lib/store/hooks"
import { logout } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"
import { useAppSelector } from "@/lib/store/hooks"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

export function getNavItems(role: string | undefined) {
  if (!role) return []

  const items = [
    { label: "Dashboard", icon: RiDashboard3Line, href: role === 'SUPER_ADMIN' ? '/super_admin' : `/${role.toLowerCase()}` }
  ]

  if (role === 'STUDENT') {
    items.push({ label: "Timetable", icon: RiTimeLine, href: "/timetable" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/profile" })
  } else if (role === 'PARENT') {
    items.push({ label: "Academics", icon: RiBookOpenLine, href: "/parent?tab=academics" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/parent/profile" })
  } else if (role === 'TEACHER') {
    items.push({ label: "Schedule", icon: RiTimeLine, href: "/teacher/schedule" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/teacher/profile" })
  } else if (role === 'PRINCIPAL') {
    items.push({ label: "Attendance", icon: RiBuilding2Line, href: "/principal/staff-attendance" })
    items.push({ label: "Approvals", icon: RiFileShieldLine, href: "/principal/approvals" })
    items.push({ label: "Register User", icon: RiUserAddLine, href: "/principal/register-user" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/principal/profile" })
  } else if (role === 'CLERK') {
    items.push({ label: "Profile", icon: RiUserLine, href: "/clerk/profile" })
  } else if (role === 'BURSAR') {
    items.push({ label: "Fees Ledger", icon: RiCoinsLine, href: "/bursar?tab=fees" })
    items.push({ label: "Payroll", icon: RiMoneyDollarCircleLine, href: "/bursar?tab=payroll" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/bursar/profile" })
  } else if (role === 'LIBRARIAN') {
    items.push({ label: "Book Catalog", icon: RiBookOpenLine, href: "/librarian?tab=catalog" })
    items.push({ label: "Register Book", icon: RiAddCircleLine, href: "/librarian?tab=add" })
    items.push({ label: "Active Loans", icon: RiArrowLeftRightLine, href: "/librarian?tab=loans" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/librarian/profile" })
  } else if (role === 'ACADEMIC_COORDINATOR') {
    items.push({ label: "Grades & Classes", icon: RiSlideshowLine, href: "/principal/create-grade" })
    items.push({ label: "Sections", icon: RiUserSettingsLine, href: "/principal/create-section" })
    items.push({ label: "Timetables", icon: RiTimeLine, href: "/principal/timetable" })
    items.push({ label: "Exams & Schedules", icon: RiCalendarEventLine, href: "/principal/exams" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/academic_coordinator/profile" })
  } else if (role === 'TRANSPORT_MANAGER') {
    items.push({ label: "Profile", icon: RiUserLine, href: "/transport_manager/profile" })
  } else if (role === 'SUPER_ADMIN') {
    items.push({ label: "Schools", icon: RiBuilding2Line, href: "/super_admin/schools" })
    items.push({ label: "Profile", icon: RiUserLine, href: "/super_admin/profile" })
  }

  return items
}

export function DesktopSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const navItems = getNavItems(user?.role)

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" })
    } catch (error) {
      console.warn('Logout failed', error)
    }
    dispatch(logout())
    router.push("/login")
  }

  const checkActive = (href: string) => {
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    if (!query) {
      if (searchParams.toString()) return false
      return true
    }
    const params = new URLSearchParams(query)
    for (const [key, val] of params.entries()) {
      if (searchParams.get(key) !== val) return false
    }
    return true
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-2rem)] sticky top-4 left-4 z-40 bg-white border border-zinc-100 rounded-3xl shadow-sm p-4 mr-4">
      <div className="px-2 py-4">
        <img 
          src="/logo.png" 
          alt="Sikshatantar Logo" 
          className="h-12 object-contain"
        />
      </div>

      <nav className="flex-1 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = checkActive(item.href)
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
