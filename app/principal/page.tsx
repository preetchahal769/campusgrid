"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"
import {
  RiGraduationCapLine,
  RiLayoutGridLine,
  RiBookOpenLine,
  RiUserAddLine,
  RiTeamLine,
  RiShieldUserLine,
  RiCalendarCheckLine,
  RiTimeLine,
  RiLogoutBoxLine,
  RiDashboard3Line,
  RiMegaphoneLine,
  RiUserLine,
  RiBuildingLine,
  RiUserSharedLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

const ACTIONS = [
  {
    group: "🏗️ School Structure",
    items: [
      { label: "Create Grade",   icon: RiGraduationCapLine, route: "/principal/create-grade",   color: "bg-violet-500/10 text-violet-600",  border: "hover:border-violet-500/40" },
      { label: "Create Section", icon: RiLayoutGridLine,    route: "/principal/create-section", color: "bg-indigo-500/10 text-indigo-600",  border: "hover:border-indigo-500/40" },
      { label: "Create Subject", icon: RiBookOpenLine,      route: "/principal/create-subject", color: "bg-blue-500/10 text-blue-600",      border: "hover:border-blue-500/40" },
    ],
  },
  {
    group: "👨‍💼 Personnel",
    items: [
      { label: "Register User",     icon: RiUserAddLine,    route: "/principal/register-user",    color: "bg-emerald-500/10 text-emerald-600", border: "hover:border-emerald-500/40" },
      { label: "Assign Teacher",    icon: RiTeamLine,       route: "/principal/assign-teacher",   color: "bg-amber-500/10 text-amber-600",    border: "hover:border-amber-500/40" },
      { label: "Set Class In-Charge", icon: RiShieldUserLine, route: "/principal/set-incharge", color: "bg-rose-500/10 text-rose-600",      border: "hover:border-rose-500/40" },
    ],
  },
  {
    group: "⚖️ Oversight",
    items: [
      { label: "Leave Appeals",     icon: RiCalendarCheckLine, route: "/principal/leaves",          color: "bg-orange-500/10 text-orange-600", border: "hover:border-orange-500/40" },
      { label: "Staff Substitutions", icon: RiUserSharedLine, route: "/principal/substitutions", color: "bg-fuchsia-500/10 text-fuchsia-600", border: "hover:border-fuchsia-500/40" },
      { label: "Staff Availability", icon: RiTimeLine,         route: "/principal/staff-attendance", color: "bg-cyan-500/10 text-cyan-600",    border: "hover:border-cyan-500/40" },
    ],
  },
]

export default function PrincipalDashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState("Good Day")

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening")
    
    // Role-based protection
    if (user && user.role !== 'PRINCIPAL') {
      router.replace(`/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  const firstName = user?.name?.split(" ")[0] || "Principal"

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to terminate session on backend during logout:', error)
      }
    }
    dispatch(logout())
    window.location.href = "/login"
  }

  if (!mounted) return null
  if (user && user.role !== 'PRINCIPAL') return null

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed top-0 left-0 w-full h-72 bg-gradient-to-br from-violet-500/15 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <header className="px-6 pt-12 pb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-500 animate-in fade-in slide-in-from-left-4 duration-500">
              {greeting}
            </p>
            <h1 className="text-3xl font-black tracking-tight animate-in fade-in slide-in-from-left-6 duration-700">
              {firstName} <span className="text-muted-foreground/30">.</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Principal Portal</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            {mounted && user?.School_id && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <RiBuildingLine className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-[10px] font-black text-violet-600 uppercase tracking-wider">School Linked</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <RiLogoutBoxLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Action Groups */}
      <main className="px-6 space-y-8">
        {ACTIONS.map(({ group, items }) => (
          <section key={group} className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">{group}</h2>
            <div className="grid grid-cols-2 gap-4">
              {items.map(({ label, icon: Icon, route, color, border }) => (
                <button
                  key={label}
                  onClick={() => router.push(route)}
                  className={cn(
                    "rounded-3xl border border-border/50 bg-background/60 backdrop-blur-md p-5 text-left transition-all duration-200 active:scale-[0.97]",
                    border
                  )}
                >
                  <div className="space-y-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-black text-sm leading-tight">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-background/80 backdrop-blur-xl border-t border-border/40 px-8 flex items-center justify-between z-50">
        <button onClick={() => router.push("/principal")} className="flex flex-col items-center gap-1 text-primary">
          <RiDashboard3Line className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        <button onClick={() => router.push("/principal/leaves")} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiCalendarCheckLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Leaves</span>
        </button>
        <button onClick={() => router.push("/principal/staff-attendance")} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiTeamLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Staff</span>
        </button>
        <button onClick={() => router.push("/principal/profile")} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiUserLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  )
}
