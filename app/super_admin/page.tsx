"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout } from "@/lib/store/slices/authSlice"
import { setLoading, setSchools, setFinance, setError } from "@/lib/store/slices/nexusSlice"
import { apiFetch } from "@/lib/api"
import {
  RiBuilding2Line,
  RiShieldStarLine,
  RiLogoutBoxLine,
  RiDashboard3Line,
  RiUserLine,
  RiListSettingsLine,
  RiAddLine,
  RiLineChartLine,
  RiFileList3Line,
  RiShieldUserLine,
  RiHistoryLine,
  RiMoneyDollarCircleLine
} from "@remixicon/react"
import { cn } from "@/lib/utils"

const NEXUS_ACTIONS = [
  {
    group: "🌐 School Orchestration",
    items: [
      { label: "Create School",   icon: RiAddLine, route: "/super_admin/create-school",   color: "bg-blue-500/10 text-blue-600",  border: "hover:border-blue-500/40" },
      { label: "School Status",   icon: RiListSettingsLine, route: "/super_admin/schools", color: "bg-indigo-500/10 text-indigo-600", border: "hover:border-indigo-500/40" },
    ],
  },
  {
    group: "💳 Infrastructure Billing",
    items: [
      { label: "Sub Overview",    icon: RiLineChartLine, route: "/super_admin/finance/subscriptions", color: "bg-emerald-500/10 text-emerald-600", border: "hover:border-emerald-500/40" },
      { label: "Generate Bills",  icon: RiFileList3Line, route: "/super_admin/finance/process-monthly", color: "bg-amber-500/10 text-amber-600", border: "hover:border-amber-500/40" },
      { label: "Record Payment",  icon: RiMoneyDollarCircleLine, route: "/super_admin/finance/payments", color: "bg-blue-500/10 text-blue-600", border: "hover:border-blue-500/40" },

    ],
  },
  {
    group: "🛡️ Governance",
    items: [
      { label: "Global Users",    icon: RiShieldUserLine, route: "/super_admin/users", color: "bg-rose-500/10 text-rose-600", border: "hover:border-rose-500/40" },
      { label: "Audit Logs",      icon: RiHistoryLine, route: "/super_admin/audit-logs", color: "bg-cyan-500/10 text-cyan-600", border: "hover:border-cyan-500/40" },
    ],
  },
]

export default function SuperAdminDashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { schools, finance, isLoading } = useAppSelector((state) => state.nexus)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
    
    // Role-based protection
    if (user && user.role !== 'SUPER_ADMIN') {
      router.replace(`/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  const loadDashboardData = async () => {
    dispatch(setLoading(true))
    try {
      const [schoolsData, financeData] = await Promise.all([
        apiFetch("/schools"),
        apiFetch("/finance/subscriptions/overview").catch(() => apiFetch("/subscriptions/overview"))
      ])
      dispatch(setSchools(schoolsData))
      dispatch(setFinance(financeData))
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to load dashboard data"))
    }
  }

  const handleLogout = async () => {
    try { await apiFetch("/auth/logout", { method: "POST" }) } catch {}
    dispatch(logout())
    router.push("/login")
  }

  if (!mounted) return null
  if (user && user.role !== 'SUPER_ADMIN') return null

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-blue-600/20 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <header className="px-6 pt-12 pb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 animate-in fade-in slide-in-from-left-4 duration-500">
              Nexus Console
            </p>
            <h1 className="text-3xl font-black tracking-tight animate-in fade-in slide-in-from-left-6 duration-700">
              Dashboard <span className="text-blue-500">.</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Global Infrastructure Control</p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-sm shadow-blue-500/5">
              <RiShieldStarLine className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Super Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all active:scale-90"
            >
              <RiLogoutBoxLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Summary - Mini Cards */}
      <div className="px-6 mb-8 grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-700 delay-100">
        <div className="p-4 rounded-3xl bg-background/40 border border-border/40 backdrop-blur-md relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Active Nodes</p>
          <p className="text-xl font-black mt-1">
            {isLoading ? "..." : schools.filter(s => (typeof s.status === 'string' ? s.status : s.status?.status) === 'ACTIVE').length}
          </p>
          {isLoading && <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 animate-progress w-full" />}
        </div>
        <div className="p-4 rounded-3xl bg-background/40 border border-border/40 backdrop-blur-md relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">MTR Growth</p>
          <p className="text-xl font-black mt-1 text-emerald-500">
            {isLoading ? "..." : `+${finance?.growthRate || 0}%`}
          </p>
          {isLoading && <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 animate-progress w-full" />}
        </div>
      </div>

      {/* Action Groups */}
      <main className="px-6 space-y-8 pb-10">
        {NEXUS_ACTIONS.map(({ group, items }, idx) => (
          <section key={group} className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-3" style={{ animationDelay: `${idx * 100}ms` }}>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{group}</h2>
            <div className="grid grid-cols-2 gap-4">
              {items.map(({ label, icon: Icon, route, color, border }) => (
                <button
                  key={label}
                  onClick={() => router.push(route)}
                  className={cn(
                    "rounded-[2rem] border border-border/40 bg-background/60 backdrop-blur-xl p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.96]",
                    border
                  )}
                >
                  <div className="space-y-4">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner", color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-black text-sm leading-tight tracking-tight">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-background/80 backdrop-blur-2xl border-t border-border/40 px-10 flex items-center justify-between z-50">
        <button onClick={() => router.push("/super_admin")} className="flex flex-col items-center gap-1.5 text-blue-600 transition-all scale-110">
          <RiDashboard3Line className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Nexus</span>
        </button>
        <button onClick={() => router.push("/super_admin/schools")} className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-all">
          <RiBuilding2Line className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Nodes</span>
        </button>
        <button onClick={() => router.push("/super_admin/profile")} className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-all">
          <RiUserLine className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
        </button>
      </nav>
    </div>
  )
}
