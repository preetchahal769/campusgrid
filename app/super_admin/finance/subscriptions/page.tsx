"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setFinance, setLoading, setError, setSchools } from "@/lib/store/slices/nexusSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiMoneyDollarCircleLine,
  RiLineChartLine,
  RiBankCardLine,
  RiPieChartLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiFileList3Line,
  RiCalendarEventLine,
  RiShieldCheckLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SubscriptionStats {
  totalRevenue: number
  activeSubscriptions: number
  pendingInvoices: number
  growthRate: number
  monthlyComparison: {
    month: string
    amount: number
  }[]
  recentInvoices: {
    id: string
    schoolName: string
    amount: number
    status: "PAID" | "PENDING" | "OVERDUE"
    dueDate: string
  }[]
}

export default function SubscriptionOverviewPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { finance: data, isLoading, error, schools } = useAppSelector(state => state.nexus)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadFinance()
    loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      const data = await apiFetch("/schools")
      dispatch(setSchools(data))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to fetch school list on finance subscriptions page:', error)
      }
    }
  }

  const loadFinance = async () => {
    dispatch(setLoading(true))
    try {
      let result
      try {
        result = await apiFetch("/finance/subscriptions/overview")
      } catch {
        result = await apiFetch("/finance/subscriptions/overview")
      }
      dispatch(setFinance(result))
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to fetch finance overview"))
    }
  }

  // Fallback for active nodes if finance API returns 0 or undefined
  const activeNodesCount = (mounted && (data?.activeSubscriptions || schools.filter(s => (typeof s.status === 'string' ? s.status : s.status?.status) === 'ACTIVE').length)) || 0

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RiLoader4Line className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analyzing Grid Finance...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Total Billed", value: `₹${(data?.totalRevenue || data?.revenue || data?.totalAmount || 0).toLocaleString()}`, icon: RiMoneyDollarCircleLine, color: "text-indigo-500 bg-indigo-500/10", trend: "Gross" },
    { label: "Actually Collected", value: `₹${(data?.collectedRevenue || 0).toLocaleString()}`, icon: RiShieldCheckLine, color: "text-emerald-500 bg-emerald-500/10", trend: "Net" },
    { label: "Active Nodes", value: activeNodesCount.toString(), icon: RiPieChartLine, color: "text-blue-500 bg-blue-500/10", trend: `+${activeNodesCount}` },
    { label: "Pending Bills", value: data?.pendingInvoices?.toString() || '0', icon: RiFileList3Line, color: "text-amber-500 bg-amber-500/10", trend: "Critical" },
  ]

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-emerald-600/20 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.push('/super_admin')}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Finance Overview</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Global Subscription Stats</p>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest animate-in shake-1">
            {typeof error === 'string' ? error : 'Infrastructure Error'}
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={stat.label} className="p-5 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 animate-in slide-in-from-right-8 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-black">{stat.value}</p>
                  </div>
                </div>
                <div className={cn("px-3 py-1.5 rounded-full text-[10px] font-black", stat.color)}>
                  {stat.trend}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Invoices Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Invoices</h2>
            <button 
              onClick={() => router.push('/super_admin/finance/ledger')}
              className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:opacity-70 transition-opacity active:scale-95"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {data?.recentInvoices?.map((inv, idx) => (
              <div 
                key={inv.id} 
                onClick={() => router.push(`/super_admin/finance/payments?id=${inv.id}&school=${inv.schoolName}&amount=${inv.amountDue || inv.amount}`)}
                className="p-5 rounded-3xl bg-muted/20 border border-border/30 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 hover:bg-muted/40 transition-colors cursor-pointer group"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-xs font-black shadow-sm border border-border/40">
                    {inv.id.split('-')[1]}
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight">{typeof inv.schoolName === 'string' ? inv.schoolName : 'Grid Node'}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <RiCalendarEventLine className="w-3 h-3" /> Due {inv.dueDate}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">₹{inv.amountDue || inv.amount || 0}</p>
                  <div className={cn(
                    "text-[8px] font-black uppercase tracking-widest mt-1",
                    (typeof inv.status === 'string' ? inv.status : inv.status?.status) === "PAID" ? "text-emerald-500" : (typeof inv.status === 'string' ? inv.status : inv.status?.status) === "OVERDUE" ? "text-rose-500" : "text-amber-500"
                  )}>
                    {typeof inv.status === 'string' ? inv.status : inv.status?.status || 'PENDING'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Growth Banner */}
        <div className="p-6 rounded-[2.5rem] bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 text-emerald-100">Revenue Growth</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black">+{data?.growthRate}%</h3>
              <RiArrowUpLine className="w-6 h-6 mb-1 text-emerald-200" />
            </div>
            <p className="text-xs font-medium text-emerald-100">Compared to previous quarter</p>
          </div>
          <RiLineChartLine className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white" />
        </div>
      </div>
    </div>
  )
}
