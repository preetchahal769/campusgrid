"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  RiArrowLeftLine, 
  RiShieldUserLine, 
  RiMailLine, 
  RiPhoneLine, 
  RiBuilding2Line, 
  RiHistoryLine, 
  RiLineChartLine,
  RiLoader4Line,
  RiLockLine,
  RiCheckboxCircleLine,
  RiUserStarLine,
  RiGroupLine,
  RiGraduationCapLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"

export default function UserProfilePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RiLoader4Line className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <UserProfileContent />
    </Suspense>
  )
}

function UserProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('id') as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (userId) {
      loadUser()
    }
  }, [userId])

  const loadUser = async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/users/${userId}`)
      setUser(data)
    } catch (err) {
      console.error("Failed to load user profile", err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!confirm("Reset password for this user to 'Welcome@123'?")) return
    setResetting(true)
    try {
      await apiFetch(`/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: 'Welcome@123' })
      })
      alert("Password reset successful!")
    } catch (err) {
      alert("Failed to reset password.")
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RiLoader4Line className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors active:scale-90"
          >
            <RiArrowLeftLine className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Identity Profile</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-indigo-600">Unified Grid Identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-8 rounded-[3rem] bg-background/60 backdrop-blur-xl border-border/40 text-center space-y-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center mx-auto border-4 border-background shadow-xl overflow-hidden">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <RiShieldUserLine className="w-16 h-16 text-indigo-600" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">{user?.name}</h2>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border",
                  user?.role === 'SUPER_ADMIN' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                )}>
                  {user?.role}
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-border/40 text-left">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <RiMailLine className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <RiPhoneLine className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.phoneNo || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <RiBuilding2Line className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.School?.name || 'Unlinked Node'}</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button 
                  onClick={handleResetPassword}
                  disabled={resetting}
                  variant="outline" 
                  className="w-full rounded-2xl h-12 font-bold border-indigo-500/20 text-indigo-600 hover:bg-indigo-500 hover:text-white"
                >
                  {resetting ? <RiLoader4Line className="w-5 h-5 animate-spin mx-auto" /> : "Reset Password"}
                </Button>
                <Button className="w-full rounded-2xl h-12 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20">
                  Suspend Access
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Activity & Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 rounded-[2.5rem] bg-indigo-600 text-white space-y-3">
                <RiCheckboxCircleLine className="w-6 h-6 text-white/60" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Profile Status</p>
                  <p className="text-xl font-black">Verified Identity</p>
                </div>
              </Card>
              <Card className="p-6 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-3">
                <RiHistoryLine className="w-6 h-6 text-indigo-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Logins</p>
                  <p className="text-xl font-black">12 Sessions / Mo</p>
                </div>
              </Card>
            </div>

            <Card className="p-8 rounded-[3rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight">Recent Activity</h3>
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-indigo-600">View All Logs</Button>
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <RiLineChartLine className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pb-6 border-b border-border/40 last:border-none">
                      <p className="text-sm font-bold group-hover:text-indigo-600 transition-colors">Successful login to Nexus Command Center</p>
                      <p className="text-[10px] text-muted-foreground mt-1">2 hours ago • New Delhi, India</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {user?.role === 'STUDENT' && (
              <Card className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20 border-dashed space-y-6">
                <div className="flex items-center gap-3">
                  <RiGraduationCapLine className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-black tracking-tight">Academic Pulse</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Attendance</p>
                    <p className="text-xl font-black text-indigo-600">92%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Average</p>
                    <p className="text-xl font-black text-indigo-600">B+</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Rank</p>
                    <p className="text-xl font-black text-indigo-600">#4</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
