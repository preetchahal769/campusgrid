"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setTeacherProfile } from "@/lib/store/slices/teacherSlice"
import { logout } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiMailLine,
  RiShieldCheckLine,
  RiBookOpenLine,
  RiMedalLine,
  RiTimeLine,
  RiGroupLine,
  RiLogoutBoxLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function TeacherProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { profile } = useAppSelector((state) => state.teacher)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) return
    const fetch = async () => {
      setIsLoading(true)
      try {
        const data = await apiFetch('/teachers/me')
        dispatch(setTeacherProfile(data))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [dispatch, profile])

  const handleLogout = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    dispatch(logout())
    router.push('/login')
  }

  const displayName = profile?.users?.name || user?.name || 'Teacher'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black tracking-tight">My Profile</h1>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground text-destructive transition-colors"
        >
          <RiLogoutBoxLine className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" />
        </div>
      ) : error ? (
        <div className="mx-5 flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
          <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : (
        <div className="px-5 space-y-5">
          {/* Avatar + Name Card */}
          <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-xl shadow-primary/30">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                    <RiShieldCheckLine className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black tracking-tight truncate">{displayName}</h2>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                    <RiMailLine className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{profile?.users?.email || user?.email}</span>
                  </p>
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-wider">
                    Teacher
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Professional Details</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: RiMedalLine,  label: 'Qualification',   value: profile?.qualification  || '—' },
                  { icon: RiBookOpenLine, label: 'Specialization', value: profile?.specilization  || '—' },
                  { icon: RiTimeLine,   label: 'Experience',      value: profile?.Experince       || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 bg-muted/30 rounded-2xl p-4 border border-border/40">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                      <p className="font-black text-sm mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Sections */}
          {profile?.teachersubjectsection && profile.teachersubjectsection.length > 0 && (
            <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <RiGroupLine className="w-3.5 h-3.5 text-primary" />
                  Assigned Classes
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 font-bold text-[10px]">
                    {profile.teachersubjectsection.length}
                  </Badge>
                </h3>
                <div className="space-y-3">
                  {profile.teachersubjectsection.map((tss, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
                      <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <RiBookOpenLine className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{tss.subject.name}</p>
                        <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                          {tss.section.grade.name} · {tss.section.name}
                        </p>
                      </div>
                      <Badge className="text-[9px] font-bold border border-border/50 text-muted-foreground bg-muted/30 shrink-0">
                        {tss.subject.code}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full h-14 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold text-base transition-all flex items-center justify-center gap-2"
          >
            <RiLogoutBoxLine className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
