"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout } from "@/lib/store/slices/authSlice"
import { setLoading, setSchools, setFinance, setError, setTelemetry } from "@/lib/store/slices/nexusSlice"
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
  RiMoneyDollarCircleLine,
  RiPulseLine,
  RiDatabase2Line,
  RiFlashlightLine,
  RiAlertFill,
  RiCloseLine,
  RiBugLine
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
    ],
  },
  {
    group: "🛡️ Governance",
    items: [
      { label: "Global Users",    icon: RiShieldUserLine, route: "/super_admin/users", color: "bg-rose-500/10 text-rose-600", border: "hover:border-rose-500/40" },
      { label: "Audit Logs",      icon: RiHistoryLine, route: "/super_admin/audit-logs", color: "bg-cyan-500/10 text-cyan-600", border: "hover:border-cyan-500/40" },
      { label: "Bug Reports",     icon: RiBugLine, route: "/super_admin/bug-reports", color: "bg-orange-500/10 text-orange-600", border: "hover:border-orange-500/40" },
    ],
  },
  {
    group: "📊 Telemetry & Insights",
    items: [
      { label: "Global Analytics", icon: RiLineChartLine, route: "/super_admin/analytics", color: "bg-purple-500/10 text-purple-600", border: "hover:border-purple-500/40" },
    ],
  },
]

export default function SuperAdminDashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { schools, finance, health, storage, traffic, escalations, projections, isLoading } = useAppSelector((state) => state.nexus)


  const [mounted, setMounted] = useState(false)
  const [hideBanner, setHideBanner] = useState(false)


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
      const [schoolsData, financeData, healthData, storageData, trafficData, escalationsData, projectionsData] = await Promise.all([
        apiFetch("/schools"),
        apiFetch("/finance/subscriptions/overview").catch(() => apiFetch("/finance/subscriptions/overview")),
        apiFetch("/system/health").catch(() => null),
        apiFetch("/infrastructure/storage").catch(() => null),
        apiFetch("/analytics/live-sessions").catch(() => null),
        apiFetch("/support/escalations/urgent").catch(() => []),
        apiFetch("/finance/current-mrr").catch(() => null)
      ])
      dispatch(setSchools(schoolsData))
      dispatch(setFinance(financeData))
      dispatch(setTelemetry({
        health: healthData,
        storage: storageData,
        traffic: trafficData,
        escalations: escalationsData || [],
        projections: projectionsData
      }))
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to load dashboard data"))
    }
  }

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
  if (user && user.role !== 'SUPER_ADMIN') return null

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-blue-600/20 via-primary/5 to-transparent -z-10" />

      {/* Urgent Alerts Banner */}
      {!hideBanner && escalations && escalations.length > 0 && (
        <div className="bg-destructive text-destructive-foreground px-6 py-3 flex items-start justify-between animate-in slide-in-from-top-full duration-500 shadow-md">
          <div className="flex gap-3">
            <RiAlertFill className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Critical System Alert</p>
              <p className="text-xs opacity-90">{escalations.length} unresolved high-severity ticket(s) require immediate attention.</p>
            </div>
          </div>
          <button onClick={() => setHideBanner(true)} className="p-1 hover:bg-black/20 rounded-lg transition-colors">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="px-6 md:px-12 lg:px-24 xl:px-40 pt-12 pb-8 max-w-[1600px] mx-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-blue-600 animate-in fade-in slide-in-from-left-4 duration-500">
              Nexus Console
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight animate-in fade-in slide-in-from-left-6 duration-700">
              Dashboard <span className="text-blue-500">.</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Global Infrastructure Control</p>
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
      <div className="px-6 md:px-12 lg:px-24 xl:px-40 mb-8 max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-in fade-in zoom-in-95 duration-700 delay-100">
        <div className="p-4 md:p-6 rounded-3xl bg-background/40 border border-border/40 backdrop-blur-md relative overflow-hidden group hover:bg-background/60 transition-colors">
          <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground">Nodes</p>
          <p className="text-xl font-black mt-1">
            {isLoading ? "..." : schools.filter(s => (typeof s.status === 'string' ? s.status : s.status?.status) === 'ACTIVE').length}
          </p>
        </div>
        <div className="p-4 rounded-3xl bg-background/40 border border-border/40 backdrop-blur-md relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Collected</p>
          <p className="text-xl font-black mt-1 text-indigo-600">
            {isLoading ? "..." : `₹${(finance?.collectedRevenue || 0).toLocaleString()}`}
          </p>
        </div>
        <div className="p-4 rounded-3xl bg-background/40 border border-border/40 backdrop-blur-md relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Growth</p>
          <p className="text-xl font-black mt-1 text-emerald-500">
            {isLoading ? "..." : `+${finance?.growthRate || 0}%`}
          </p>
        </div>
        <div className="p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Current MRR</p>
          <p className="text-xl font-black mt-1 text-blue-700">
            {isLoading ? "..." : `₹${(projections?.currentMRR || 0).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* System Health & Telemetry */}
      <section className="px-6 md:px-12 lg:px-24 xl:px-40 mb-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 mb-3">Live Telemetry</h2>
        <div className="bg-background/60 backdrop-blur-xl border border-border/40 rounded-[2.5rem] p-5 md:p-8 space-y-6 md:space-y-8">
          {/* Health & Storage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner", 
                health?.status === 'healthy' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              )}>
                <RiPulseLine className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Engine Status</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", health?.status === 'healthy' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500")} />
                  <p className="text-sm font-bold">{health?.status === 'healthy' ? "Operational" : "Degraded"}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Storage Used</p>
                <p className="text-sm font-bold">{storage?.usagePercent || 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-inner">
                <RiDatabase2Line className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", (storage?.usagePercent || 0) > 80 ? "bg-destructive" : "bg-indigo-500")}
              style={{ width: `${storage?.usagePercent || 0}%` }}
            />
          </div>

          {/* Live Traffic */}
          <div className="pt-4 border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiFlashlightLine className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-muted-foreground">Active Sessions</p>
            </div>
            <p className="text-lg font-black">{traffic?.totalActiveUsers || 0}</p>
          </div>
        </div>
      </section>

      {/* Action Groups */}
      <main className="px-6 md:px-12 lg:px-24 xl:px-40 space-y-10 md:space-y-12 pb-10 max-w-[1600px] mx-auto">
        {NEXUS_ACTIONS.map(({ group, items }, idx) => (
          <section key={group} className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-4" style={{ animationDelay: `${idx * 100}ms` }}>
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{group}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map(({ label, icon: Icon, route, color, border }) => (
                <button
                  key={label}
                  onClick={() => router.push(route)}
                  className={cn(
                    "rounded-[2rem] border border-border/40 bg-background/60 backdrop-blur-xl p-5 md:p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.96]",
                    border
                  )}
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-inner", color)}>
                      <Icon className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <p className="font-black text-sm md:text-base leading-tight tracking-tight">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Bottom Navigation - Hidden on md and up, using side nav or just header in real app, but for now we keep it visible on small screens */}
      <nav className="fixed md:hidden bottom-0 left-0 w-full h-20 bg-background/80 backdrop-blur-2xl border-t border-border/40 px-10 flex items-center justify-between z-50">
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
