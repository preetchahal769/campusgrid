"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout } from "@/lib/store/slices/authSlice"
import { setLoading, setSchools, setFinance, setError, setTelemetry } from "@/lib/store/slices/nexusSlice"
import { apiFetch } from "@/lib/api"
import {
  RiListSettingsLine,
  RiAddLine,
  RiLineChartLine,
  RiFileList3Line,
  RiShieldUserLine,
  RiHistoryLine,
  RiPulseLine,
  RiDatabase2Line,
  RiFlashlightLine,
  RiAlertFill,
  RiCloseLine,
  RiBugLine
} from "@remixicon/react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { WelcomeBoard } from "@/components/ui/welcome-board"

const NEXUS_ACTIONS = [
  { label: "Create School",   icon: RiAddLine, route: "/super_admin/create-school",   color: "text-[#45A3F5]",  bg: "bg-[#45A3F5]/10" },
  { label: "School Status",   icon: RiListSettingsLine, route: "/super_admin/schools", color: "text-[#825CD6]", bg: "bg-[#825CD6]/10" },
  { label: "Subscriptions",   icon: RiLineChartLine, route: "/super_admin/finance/subscriptions", color: "text-[#6FCA72]", bg: "bg-[#6FCA72]/10" },
  { label: "Generate Bills",  icon: RiFileList3Line, route: "/super_admin/finance/process-monthly", color: "text-[#FDB543]", bg: "bg-[#FDB543]/10" },
  { label: "Global Users",    icon: RiShieldUserLine, route: "/super_admin/users", color: "text-[#FA5D5D]", bg: "bg-[#FA5D5D]/10" },
  { label: "Audit Logs",      icon: RiHistoryLine, route: "/super_admin/audit-logs", color: "text-[#0A4EA6]", bg: "bg-[#0A4EA6]/10" },
  { label: "Bug Reports",     icon: RiBugLine, route: "/super_admin/bug-reports", color: "text-[#AB47BC]", bg: "bg-[#AB47BC]/10" },
  { label: "Analytics",       icon: RiLineChartLine, route: "/super_admin/analytics", color: "text-[#45A3F5]", bg: "bg-[#45A3F5]/10" },
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
    <div className="relative overflow-x-hidden min-h-full pb-10 z-0">
      {/* Blue Sweeping Header Background */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      <main className="px-5 md:px-8 pt-24 space-y-8">
        
        {/* Urgent Alerts Banner */}
        {!hideBanner && escalations && escalations.length > 0 && (
          <div className="bg-red-500 text-white rounded-3xl px-6 py-4 flex items-start justify-between shadow-lg">
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

        {/* Welcome Board */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <WelcomeBoard 
            title="Nexus Operations"
            subtitle="Global infrastructure control and analytics are fully operational."
            illustrationSrc="/principal-illustration.png"
          />
        </section>

        {/* Global Operations Grid (3 Column) */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mt-8">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 px-1">Global Operations</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {NEXUS_ACTIONS.map(({ label, icon: Icon, route, color, bg }) => (
              <Card
                key={label}
                className="cursor-pointer hover:shadow-md transition-all rounded-3xl border border-zinc-100 shadow-sm aspect-square flex flex-col items-center justify-center p-3 relative group bg-white"
                onClick={() => router.push(route)}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", bg, color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-[11px] md:text-sm text-center text-zinc-700 leading-tight">{label}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Summary - Clean White Cards */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
           <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 px-1">Overview</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-3xl border border-zinc-100 shadow-sm bg-white p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nodes</p>
              <p className="text-2xl font-black mt-1 text-zinc-900">
                {isLoading ? "..." : schools.filter(s => (typeof s.status === 'string' ? s.status : s.status?.status) === 'ACTIVE').length}
              </p>
            </Card>
            <Card className="rounded-3xl border border-zinc-100 shadow-sm bg-white p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Collected</p>
              <p className="text-2xl font-black mt-1 text-[#825CD6]">
                {isLoading ? "..." : `₹${(finance?.collectedRevenue || 0).toLocaleString()}`}
              </p>
            </Card>
            <Card className="rounded-3xl border border-zinc-100 shadow-sm bg-white p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Growth</p>
              <p className="text-2xl font-black mt-1 text-[#6FCA72]">
                {isLoading ? "..." : `+${finance?.growthRate || 0}%`}
              </p>
            </Card>
            <Card className="rounded-3xl border-none shadow-sm bg-blue-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Current MRR</p>
              <p className="text-2xl font-black mt-1 text-blue-700">
                {isLoading ? "..." : `₹${(projections?.currentMRR || 0).toLocaleString()}`}
              </p>
            </Card>
          </div>
        </section>

        {/* System Health & Telemetry - Clean White Card */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 px-1">Live Telemetry</h2>
          <Card className="bg-white border border-zinc-100 shadow-sm rounded-[2.5rem] p-6 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", 
                  health?.status === 'healthy' ? "bg-[#6FCA72]/10 text-[#6FCA72]" : "bg-[#FDB543]/10 text-[#FDB543]"
                )}>
                  <RiPulseLine className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Engine Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", health?.status === 'healthy' ? "bg-[#6FCA72] shadow-[0_0_8px_rgba(111,202,114,0.5)]" : "bg-[#FDB543]")} />
                    <p className="text-sm font-bold text-zinc-900">{health?.status === 'healthy' ? "Operational" : "Degraded"}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Storage</p>
                  <p className="text-sm font-bold text-zinc-900">{storage?.usagePercent || 0}%</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#825CD6]/10 text-[#825CD6] flex items-center justify-center">
                  <RiDatabase2Line className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", (storage?.usagePercent || 0) > 80 ? "bg-red-500" : "bg-[#825CD6]")}
                style={{ width: `${storage?.usagePercent || 0}%` }}
              />
            </div>

            <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiFlashlightLine className="w-5 h-5 text-[#FDB543]" />
                <p className="text-sm font-bold text-zinc-600">Active Sessions</p>
              </div>
              <p className="text-2xl font-black text-zinc-900">{traffic?.totalActiveUsers || 0}</p>
            </div>
          </Card>
        </section>

      </main>
    </div>
  )
}
