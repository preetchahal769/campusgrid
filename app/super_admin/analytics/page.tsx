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

  const [useDemoMode, setUseDemoMode] = useState(true)
  const [chartMetric, setChartMetric] = useState<"revenue" | "nodeCount" | "userCount">("revenue")
  const [chartType, setChartType] = useState<"bar" | "line">("line")

  const MOCK_TRENDS = [
    { month: "2025-06", revenue: 15000, nodeCount: 2, userCount: 450 },
    { month: "2025-07", revenue: 18000, nodeCount: 3, userCount: 600 },
    { month: "2025-08", revenue: 22000, nodeCount: 5, userCount: 1100 },
    { month: "2025-09", revenue: 35000, nodeCount: 8, userCount: 1800 },
    { month: "2025-10", revenue: 42000, nodeCount: 10, userCount: 2500 },
    { month: "2025-11", revenue: 48000, nodeCount: 12, userCount: 3100 },
    { month: "2025-12", revenue: 55000, nodeCount: 15, userCount: 4200 },
    { month: "2026-01", revenue: 70000, nodeCount: 22, userCount: 6500 },
    { month: "2026-02", revenue: 85000, nodeCount: 28, userCount: 8200 },
    { month: "2026-03", revenue: 105000, nodeCount: 35, userCount: 11000 },
    { month: "2026-04", revenue: 125000, nodeCount: 42, userCount: 14500 },
    { month: "2026-05", revenue: 150000, nodeCount: 50, userCount: 18000 },
  ]

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

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
    return `₹${val.toLocaleString()}`
  }

  const activeTrends = useDemoMode ? MOCK_TRENDS : (data?.trends || []);
  const currentMonthTrend = activeTrends[(activeTrends.length || 1) - 1] || {};
  const lastMonthTrend = activeTrends[(activeTrends.length || 2) - 2] || {};
  
  const calculateGrowth = (current: number, previous: number) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  const growth = {
    schools: calculateGrowth(currentMonthTrend.nodeCount, lastMonthTrend.nodeCount),
    users: calculateGrowth(currentMonthTrend.userCount, lastMonthTrend.userCount),
    revenue: calculateGrowth(currentMonthTrend.revenue, lastMonthTrend.revenue),
  }

  const totalUsers = useDemoMode ? 18000 : (data?.stats?.totalStudents || 0) + (data?.stats?.totalTeachers || 0);
  const totalRevenue = activeTrends.reduce((sum: number, t: any) => sum + (t.revenue || 0), 0) || 0;
  const activeSchools = useDemoMode ? 50 : (data?.stats?.activeSchools || 0);

  const primaryStats = [
    { label: "Active Nodes", value: activeSchools, growth: growth.schools, icon: RiBuilding2Line, color: "text-blue-500 bg-blue-500/10" },
    { label: "Total Users", value: totalUsers.toLocaleString(), growth: growth.users, icon: RiGroupLine, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Net Revenue", value: formatCurrency(totalRevenue), growth: growth.revenue, icon: RiMoneyDollarCircleLine, color: "text-emerald-500 bg-emerald-500/10" },
  ]

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-indigo-600/20 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 xl:px-40 pt-12 pb-8 flex items-center gap-4 max-w-[1600px] mx-auto">
        <button
          onClick={() => router.push('/super_admin')}
          className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
        >
          <RiArrowLeftLine className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">Global Analytics</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest text-indigo-600">Infrastructure Insights</p>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-24 xl:px-40 space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest animate-in shake-1">
            {typeof error === 'string' ? error : 'Analytics Engine Fault'}
          </div>
        )}
        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-black tracking-tight">Growth Velocity</h2>
                <button 
                  onClick={() => setUseDemoMode(!useDemoMode)}
                  className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", 
                    useDemoMode ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {useDemoMode ? "Demo Mode ON" : "Live Data"}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Year-to-date performance</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/40">
                {[
                  { id: "revenue", label: "Revenue", icon: RiMoneyDollarCircleLine },
                  { id: "userCount", label: "Users", icon: RiGroupLine },
                  { id: "nodeCount", label: "Nodes", icon: RiBuilding2Line }
                ].map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => setChartMetric(metric.id as any)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      chartMetric === metric.id ? "bg-background shadow-sm text-indigo-600" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <metric.icon className="w-3.5 h-3.5" />
                    {metric.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/40">
                <button
                  onClick={() => setChartType("bar")}
                  className={cn("p-1.5 rounded-xl transition-all", chartType === "bar" ? "bg-background shadow-sm text-indigo-600" : "text-muted-foreground hover:bg-background/50")}
                >
                  <RiBarChartGroupedLine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={cn("p-1.5 rounded-xl transition-all", chartType === "line" ? "bg-background shadow-sm text-indigo-600" : "text-muted-foreground hover:bg-background/50")}
                >
                  <RiLineChartLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 px-2 pt-4 h-48 md:h-64 lg:h-80">
            {/* Y-Axis Scale */}
            <div className="flex flex-col justify-between h-[calc(100%-1.5rem)] text-[9px] font-bold text-foreground/70 pb-2 w-10 text-right">
              {(() => {
                const maxVal = activeTrends.length > 0 ? Math.max(...activeTrends.map((t: any) => t[chartMetric] || 0)) || 1 : 100;
                const formatLabel = (val: number) => {
                  if (val === 0) return '0';
                  if (chartMetric === "revenue") {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                    return val.toString();
                  } else {
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
                    return Math.floor(val).toString();
                  }
                };
                return [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0].map((v, i) => (
                  <span key={i} className="relative top-1.5">{formatLabel(v)}</span>
                ));
              })()}
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative flex items-end justify-between gap-2">
              {chartType === "line" && activeTrends.length > 0 && (
              <svg className="absolute inset-0 w-full h-[calc(100%-2rem)] overflow-visible pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99 102 241 / 0.3)" />
                    <stop offset="100%" stopColor="rgb(99 102 241 / 0)" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M ${activeTrends.map((item: any, i: number) => {
                    const maxVal = Math.max(...activeTrends.map((t: any) => t[chartMetric] || 0)) || 1;
                    const val = typeof item[chartMetric] === 'number' ? item[chartMetric] : 0;
                    const height = (val / maxVal) * 100;
                    const x = (i / (activeTrends.length - 1)) * 100;
                    const y = 100 - height;
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-indigo-500"
                  vectorEffect="non-scaling-stroke"
                />
                <path 
                  d={`M 0 100 L ${activeTrends.map((item: any, i: number) => {
                    const maxVal = Math.max(...activeTrends.map((t: any) => t[chartMetric] || 0)) || 1;
                    const val = typeof item[chartMetric] === 'number' ? item[chartMetric] : 0;
                    const height = (val / maxVal) * 100;
                    const x = (i / (activeTrends.length - 1)) * 100;
                    const y = 100 - height;
                    return `${x} ${y}`;
                  }).join(' L ')} L 100 100 Z`}
                  fill="url(#line-gradient)"
                />
              </svg>
            )}

            {(activeTrends.length > 0 ? activeTrends : Array(12).fill({ [chartMetric]: undefined, month: '...' })).map((item: any, idx: number) => {
              const maxVal = activeTrends.length > 0 ? Math.max(...activeTrends.map((t: any) => t[chartMetric] || 0)) : 100;
              const val = item[chartMetric];
              const height = typeof val === 'number' ? (val / (maxVal || 1)) * 100 : 0;
              const dateObj = new Date(`${item.month}-01`);
              const monthLabel = isNaN(dateObj.getTime()) ? '...' : dateObj.toLocaleString('default', { month: 'short' });
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative z-10 h-full justify-end">
                  {chartType === "bar" ? (
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div 
                        className={cn("w-full rounded-t-lg transition-all duration-700", 
                          height > 0 ? "bg-indigo-500/20 border-t border-indigo-500/30 group-hover:bg-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-500/20" : "bg-transparent"
                        )}
                        style={{ height: `${Math.max(height, 1)}%`, animationDelay: `${idx * 50}ms` }}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex items-end justify-center h-full relative">
                      <div className="w-3 h-3 rounded-full bg-background border-2 border-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity absolute shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                           style={{ bottom: `calc(${height}% - 6px)` }} />
                    </div>
                  )}
                  <p className="text-[9px] font-black text-foreground/70 uppercase">{monthLabel}</p>
                </div>
              )
            })}
            </div>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <section className="space-y-4">
          <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground px-2">Geographic Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {(Array.isArray(data?.nodesByRegion) 
              ? data.nodesByRegion 
              : Object.entries(data?.nodesByRegion || { "Global": 100 }).map(([region, count]) => ({ region, count: count as number }))
            ).map((item: any, idx: number) => (
              <Card key={item.region || idx} className="p-5 rounded-[2rem] bg-background/60 backdrop-blur-xl border-border/40 flex flex-col items-center text-center space-y-2 animate-in zoom-in-95" style={{ animationDelay: `${idx * 100}ms` }}>
                <RiMapPinLine className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground truncate w-full">{item.region || 'Unknown'}</p>
                  <p className="text-lg font-black">{item.count} Nodes</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
