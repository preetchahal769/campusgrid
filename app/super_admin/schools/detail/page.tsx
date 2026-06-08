"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  RiArrowLeftLine, 
  RiBuilding2Line, 
  RiUserStarLine, 
  RiGroupLine, 
  RiMoneyDollarCircleLine, 
  RiLineChartLine, 
  RiHistoryLine, 
  RiEarthLine,
  RiShieldUserLine,
  RiMapPinLine,
  RiMailLine,
  RiPhoneLine,
  RiLoader4Line,
  RiSettings4Line,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
  RiBarChartGroupedLine,
  RiPulseLine,
  RiSearchLine,
  RiFilter3Line
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"

interface SchoolDetail {
  id: string
  name: string
  city: string
  pincode: string
  education_board: string
  status: string
  subscriptionRate: number
  region: string
  principal?: {
    user: {
      id: string
      name: string
      email: string
      phoneNo: string
      photoUrl: string
    }
  }
  _count: {
    users: number
    grade: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  phoneNo: string
  photoUrl: string
  createdAt: string
}

interface SchoolFinance {
  currentMRR: number
}

interface StudentGrowthEntry {
  month: string
  count: number
}

interface SchoolAnalytics {
  studentGrowth?: StudentGrowthEntry[]
  criticalEscalations?: number
}

export default function SchoolDetailPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RiLoader4Line className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <SchoolDetailContent />
    </Suspense>
  )
}

function SchoolDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('id') as string

  const [school, setSchool] = useState<SchoolDetail | null>(null)
  const [finance, setFinance] = useState<SchoolFinance | null>(null)
  const [analytics, setAnalytics] = useState<SchoolAnalytics | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("ALL")
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    if (schoolId) {
      loadData()
    }
  }, [schoolId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [schoolData, financeData, analyticsData, usersData] = await Promise.all([
        apiFetch(`/schools/${schoolId}`),
        apiFetch(`/schools/${schoolId}/finance`),
        apiFetch(`/schools/${schoolId}/analytics`),
        apiFetch(`/schools/${schoolId}/users`)
      ])
      setSchool(schoolData)
      setFinance(financeData)
      setAnalytics(analyticsData)
      setUsers(usersData)
    } catch (err) {
      console.error("Failed to load school details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this Principal's password to 'Welcome@123'?")) return
    setResettingPassword(true)
    try {
      await apiFetch(`/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: 'Welcome@123' })
      })
      alert("Password has been successfully reset to: Welcome@123")
    } catch (err) {
      alert("Failed to reset password. Please ensure the endpoint is ready.")
    } finally {
      setResettingPassword(false)
    }
  }

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString()}`
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "ALL" || u.role === selectedRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RiLoader4Line className="w-12 h-12 animate-spin text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Command Center...</p>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-12 text-center space-y-6 max-w-md rounded-[3rem] border-dashed">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <RiBuilding2Line className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black">Node Not Found</h1>
            <p className="text-sm text-muted-foreground font-medium">The school node you are looking for does not exist or has been decommissioned.</p>
          </div>
          <Button onClick={() => router.push('/super_admin/schools')} className="rounded-2xl px-8 h-12 font-bold">
            Back to Registry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent -z-10" />

      {/* Header Section */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 xl:px-40 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/super_admin/schools')}
              className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors active:scale-90"
            >
              <RiArrowLeftLine className="w-6 h-6" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter">{school.name}</h1>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  school.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                )}>
                  {school.status}
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <RiEarthLine className="w-4 h-4 text-indigo-500" />
                {school.region} Region • {school.education_board} Board
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="rounded-2xl h-12 px-6 font-bold gap-2"
              onClick={() => alert("Node configuration panel coming soon!")}
            >
              <RiSettings4Line className="w-5 h-5" />
              Configure Node
            </Button>
            <Button className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 gap-2">
              <RiPulseLine className="w-5 h-5" />
              Live Monitor
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 xl:px-40 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Stats & Principal */}
        <div className="lg:col-span-1 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <RiGroupLine className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Users</p>
                <p className="text-xl font-black">{school._count.users}</p>
              </div>
            </Card>
            <Card className="p-5 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <RiMoneyDollarCircleLine className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Node MRR</p>
                <p className="text-xl font-black">{formatCurrency(finance?.currentMRR || 0)}</p>
              </div>
            </Card>
          </div>

          {/* Principal Profile Card */}
          <Card className="p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600">Principal Info</h3>
              <RiUserStarLine className="w-5 h-5 text-indigo-500/40" />
            </div>

            {school.principal ? (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-500/20 shadow-inner">
                    {school.principal.user.photoUrl ? (
                      <img src={school.principal.user.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-indigo-600">{school.principal.user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight leading-none">{school.principal.user.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Head Administrator</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <RiMailLine className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{school.principal.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <RiPhoneLine className="w-4 h-4 text-muted-foreground" />
                    <span>{school.principal.user.phoneNo || 'Not provided'}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  disabled={resettingPassword}
                  onClick={() => handleResetPassword(school.principal!.user.id)}
                  className="w-full rounded-2xl h-12 font-bold border-indigo-500/20 text-indigo-600 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                >
                  {resettingPassword ? <RiLoader4Line className="w-5 h-5 animate-spin mx-auto" /> : "Reset Password"}
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto border-2 border-dashed border-border/60">
                  <RiUserStarLine className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">No Principal Assigned</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Operational Critical</p>
                </div>
                <Button className="w-full rounded-2xl h-12 font-bold" onClick={() => router.push(`/super_admin/schools`)}>
                  Appoint Leader
                </Button>
              </div>
            )}
          </Card>

          {/* Node Details List */}
          <Card className="p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Node Logistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/40">
                <span className="text-xs font-bold text-muted-foreground">Address</span>
                <span className="text-xs font-black">{school.city}, {school.pincode}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/40">
                <span className="text-xs font-bold text-muted-foreground">Subs Rate</span>
                <span className="text-xs font-black">{formatCurrency(school.subscriptionRate)} / student</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-bold text-muted-foreground">Academics</span>
                <span className="text-xs font-black">{school._count.grade} Active Grades</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Analytics, Finance & Users */}
        <div className="lg:col-span-2 space-y-8">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Growth Chart */}
            <Card className="p-6 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <RiPulseLine className="w-4 h-4 text-indigo-500" />
                    Growth Velocity
                  </h3>
                  <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Historical Student Count</p>
                </div>
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
                  <button
                    onClick={() => setChartType("bar")}
                    className={cn("p-1 rounded-lg transition-all", chartType === "bar" ? "bg-background shadow-sm text-indigo-600" : "text-muted-foreground opacity-50")}
                  >
                    <RiBarChartGroupedLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setChartType("line")}
                    className={cn("p-1 rounded-lg transition-all", chartType === "line" ? "bg-background shadow-sm text-indigo-600" : "text-muted-foreground opacity-50")}
                  >
                    <RiLineChartLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 h-40 pt-4">
                {/* Y-Axis */}
                <div className="flex flex-col justify-between h-[calc(100%-1.2rem)] text-[8px] font-black text-foreground/70 w-6 text-right pb-1">
                  {(() => {
                    const max = Math.max(...(analytics?.studentGrowth || []).map((g: StudentGrowthEntry) => g.count)) || 10
                    return [max, Math.floor(max * 0.5), 0].map(v => <span key={v}>{v}</span>)
                  })()}
                </div>

                <div className="flex-1 flex items-end justify-between relative gap-1">
                  {chartType === "line" && (analytics?.studentGrowth || []).length > 0 && (
                    <svg className="absolute inset-0 w-full h-[calc(100%-1.2rem)] overflow-visible pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d={`M ${analytics!.studentGrowth!.map((item: StudentGrowthEntry, i: number) => {
                          const max = Math.max(...analytics!.studentGrowth!.map((g: StudentGrowthEntry) => g.count)) || 1;
                          const height = (item.count / max) * 100;
                          const x = (i / (analytics!.studentGrowth!.length - 1)) * 100;
                          const y = 100 - height;
                          return `${x} ${y}`;
                        }).join(' L ')}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-indigo-500"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}

                  {(analytics?.studentGrowth || []).map((item: StudentGrowthEntry, i: number) => {
                    const max = Math.max(...analytics!.studentGrowth!.map((g: StudentGrowthEntry) => g.count)) || 1
                    const height = (item.count / max) * 100
                    const dateObj = new Date(`${item.month}-01`)
                    const monthLabel = isNaN(dateObj.getTime()) ? '...' : dateObj.toLocaleString('default', { month: 'short' })
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10 h-full justify-end">
                        {chartType === "bar" ? (
                          <div className="w-full bg-indigo-500/10 rounded-t-lg group-hover:bg-indigo-500 transition-all relative" style={{ height: `${Math.max(height, 2)}%` }}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg">
                              {item.count}
                            </div>
                          </div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-background border-2 border-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity absolute" 
                               style={{ bottom: `calc(${height}% + 10px)` }} />
                        )}
                        <span className="text-[8px] font-black text-foreground/70 uppercase">{monthLabel}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* Support/Escalation Card */}
            <Card className="p-6 rounded-[2.5rem] bg-indigo-600 text-white space-y-6 shadow-xl shadow-indigo-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black tracking-tight">Active Escalations</h3>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <RiLineChartLine className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-4xl font-black">{analytics?.criticalEscalations || 0}</div>
                <p className="text-xs font-bold text-white/70">Unresolved critical issues requiring super admin oversight.</p>
                <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-2xl h-10 font-bold border-none">
                  View Support Desk
                </Button>
              </div>
            </Card>
          </div>

          {/* User Directory Table */}
          <Card className="rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 overflow-hidden">
            <div className="p-8 border-b border-border/40 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-black tracking-tight">User Directory</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-muted/50 border-none rounded-xl pl-9 pr-4 h-10 text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                    />
                  </div>
                  <div className="flex bg-muted/50 p-1 rounded-xl">
                    {['ALL', 'TEACHER', 'STUDENT'].map(role => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          selectedRole === role ? "bg-background shadow-sm text-indigo-600" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border/40">
                  <tr>
                    <th className="text-left px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">User</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Role</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Joined</th>
                    <th className="text-right px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-indigo-600 overflow-hidden">
                            {u.photoUrl ? <img src={u.photoUrl} alt="" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black tracking-tight">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                          u.role === 'TEACHER' ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button 
                          onClick={() => router.push(`/super_admin/users/detail?id=${u.id}`)}
                          className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 hover:bg-indigo-500 hover:text-white transition-all active:scale-90 flex items-center justify-center shadow-sm ml-auto"
                          title="View Unified Profile"
                        >
                          <RiEyeLine className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center space-y-3">
                        <RiShieldUserLine className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                        <p className="text-sm font-bold text-muted-foreground">No users found in this node.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
