"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setAnalytics, setLoading, setError } from "@/lib/store/slices/nexusSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiLineChartLine,
  RiBarChartGroupedLine,
  RiPieChartLine,
  RiUserStarLine,
  RiBuilding2Line,
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiLoader4Line,
  RiPulseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiMapPinLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnalyticsData {
  totalSchools: number
  totalUsers: number
  totalRevenue: number
  activeSubscriptions: number
  growthStats: {
    schools: number
    users: number
    revenue: number
  }
  recentPerformance: {
    label: string
    value: number
  }[]
}

export default function GlobalAnalyticsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { analytics: data, isLoading, error } = useAppSelector(state => state.nexus)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    dispatch(setLoading(true))
    try {
      const result = await apiFetch("/analytics/global-dashboard")
      dispatch(setAnalytics(result))
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to fetch analytics"))
    }
  }

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RiPulseLine className="w-10 h-10 animate-pulse text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synthesizing Global Data...</p>
        </div>
      </div>
    )
  }

  const primaryStats = [
    { label: "Active Nodes", value: data?.totalSchools || 0, growth: data?.growthStats?.schools || 0, icon: RiBuilding2Line, color: "text-blue-500 bg-blue-500/10" },
    { label: "Total Users", value: data?.totalUsers?.toLocaleString() || '0', growth: data?.growthStats?.users || 0, icon: RiGroupLine, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Net Revenue", value: `₹${((data?.totalRevenue || 0) / 1000000).toFixed(1)}M`, growth: data?.growthStats?.revenue || 0, icon: RiMoneyDollarCircleLine, color: "text-emerald-500 bg-emerald-500/10" },
  ]

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-indigo-600/20 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Global Analytics</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-indigo-600">Infrastructure Insights</p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest animate-in shake-1">
            {typeof error === 'string' ? error : 'Analytics Engine Fault'}
          </div>
        )}
        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {primaryStats.map((stat, idx) => (
            <Card key={stat.label} className="p-6 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 animate-in slide-in-from-right-8 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-black">{stat.value}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                    <RiArrowUpLine className="w-3.5 h-3.5" />
                    {stat.growth}%
                  </div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Vs Last Month</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Performance Visualization Placeholder (Mock Chart) */}
        <Card className="p-6 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-sm font-black tracking-tight">Growth Velocity</h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Year-to-date performance</p>
            </div>
            <RiPulseLine className="w-5 h-5 text-indigo-500 animate-pulse" />
          </div>
          
          <div className="h-48 flex items-end justify-between px-2 gap-2 pt-4">
            {(data?.trends || Array(12).fill({ value: 30, month: '...' })).map((item: any, idx: number) => {
              const height = item.revenue ? (item.revenue / (Math.max(...data?.trends?.map((t: any) => t.revenue) || [100])) * 100) : 30;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    <div 
                      className="w-full bg-indigo-500/20 rounded-t-lg border-t border-indigo-500/30 transition-all duration-700 group-hover:bg-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-500/20"
                      style={{ height: `${height}%`, animationDelay: `${idx * 50}ms` }}
                    />
                  </div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase">{item.month?.slice(0, 3)}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Geographic Distribution */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Geographic Distribution</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data?.nodesByRegion || { "Global": 100 }).map(([region, count], idx) => (
              <Card key={region} className="p-5 rounded-[2rem] bg-background/60 backdrop-blur-xl border-border/40 flex flex-col items-center text-center space-y-2 animate-in zoom-in-95" style={{ animationDelay: `${idx * 100}ms` }}>
                <RiMapPinLine className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground truncate w-full">{region}</p>
                  <p className="text-lg font-black">{count as number} Nodes</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
