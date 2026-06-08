"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setProfile, setAttendance } from "@/lib/store/slices/studentSlice"
import { logout, updateUser } from "@/lib/store/slices/authSlice"
import { apiFetch, getImageUrl } from "@/lib/api"
import {
  RiUserLine,
  RiMailLine,
  RiSchoolLine,
  RiMedalLine,
  RiBarChartLine,
  RiCalendarCheckLine,
  RiCalendarCloseLine,
  RiLoader4Line,
  RiArrowLeftLine,
  RiLogoutBoxLine,
  RiShieldCheckLine,
  RiCameraLine,
  RiEdit2Line,
  RiSaveLine,
  RiCloseLine,
  RiPhoneLine,
  RiGlobalLine,
} from "@remixicon/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { profile, attendance } = useAppSelector((state) => state.student)

  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch profile if not in Redux
  useEffect(() => {
    if (profile) return
    const fetch = async () => {
      setIsLoadingProfile(true)
      try {
        const data = await apiFetch('/students/me')
        dispatch(setProfile(data))
      } catch (err: any) {
        setProfileError(err.message)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    fetch()
  }, [dispatch, profile])

  // Always fetch attendance fresh
  useEffect(() => {
    const fetch = async () => {
      setIsLoadingAttendance(true)
      try {
        const data = await apiFetch('/attendance/me')
        dispatch(setAttendance(data))
      } catch (err: any) {
        setAttendanceError(err.message)
      } finally {
        setIsLoadingAttendance(false)
      }
    }
    fetch()
  }, [dispatch])

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to terminate session on backend during logout:', error)
      }
    }
    dispatch(logout())
    window.location.href = '/login'
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    setProfileError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const data = await apiFetch('/users/profile/photo', {
        method: 'PATCH',
        body: formData,
      })

      const photoUrl = data.photoUrl || data.user?.photoUrl
      if (photoUrl) {
        dispatch(updateUser({ photoUrl }))
      }
    } catch (err: any) {
      setProfileError(err.message)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const startEditing = () => {
    setEditName(profile?.users?.name || user?.name || "")
    setEditPhone(profile?.users?.phoneNo || "")
    setIsEditing(true)
    setProfileError(null)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) { setProfileError("Name is required"); return }

    setIsUpdating(true)
    setProfileError(null)
    try {
      const updatedUser = await apiFetch('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim(),
          phoneNo: editPhone.trim() || undefined,
        }),
      })
      
      // Update store
      dispatch(updateUser({ name: updatedUser.name }))
      
      // Refetch profile
      const freshData = await apiFetch('/students/me')
      dispatch(setProfile(freshData))
      
      if (updatedUser.pendingApproval) {
        alert("Your changes have been submitted for approval.")
      }

      setIsEditing(false)
    } catch (err: any) {
      setProfileError(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  // /attendance/me returns only the current user's records
  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const absentDays = attendance.filter(a => a.status === 'ABSENT').length
  const leaveDays = attendance.filter(a => a.status === 'LEAVE').length
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  const attendanceColor = attendancePct >= 75 ? 'text-emerald-500' : attendancePct >= 50 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="min-h-screen pb-10 relative z-0">
      {/* Decorative header bg */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black tracking-tight text-white">My Profile</h1>
        <button onClick={handleLogout} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-red-500/80 transition-colors text-white">
          <RiLogoutBoxLine className="w-5 h-5" />
        </button>
      </div>

      {isLoadingProfile ? (
        <div className="flex justify-center py-20"><RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" /></div>
      ) : profileError ? (
        <div className="mx-5 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-semibold">{profileError}</div>
      ) : (
        <div className="px-5 space-y-5 mt-2">
          {/* Avatar + Name Card */}
          <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden relative">
            {!isEditing && (
              <button
                onClick={startEditing}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all z-10"
              >
                <RiEdit2Line className="w-4 h-4" />
              </button>
            )}
            <CardContent className="p-6">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Edit Profile</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Update your details</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                        <RiUserLine className="w-3 h-3 text-primary" /> Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full h-11 rounded-xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                        <RiPhoneLine className="w-3 h-3 text-primary" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full h-11 rounded-xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isUpdating ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiSaveLine className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black shadow-xl shadow-primary/30 overflow-hidden relative">
                      {user?.photoUrl ? (
                        <img src={getImageUrl(user.photoUrl)} alt={profile?.users?.name || user?.name} className="w-full h-full object-cover" />
                      ) : (
                        (profile?.users?.name || user?.name || 'S')[0].toUpperCase()
                      )}

                      {/* Upload Overlay */}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        {isUploadingPhoto ? (
                          <RiLoader4Line className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          <RiCameraLine className="w-6 h-6 text-white" />
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                      </label>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                      <RiShieldCheckLine className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black tracking-tight truncate">{profile?.users?.name || user?.name}</h2>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                      <RiMailLine className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{profile?.users?.email || user?.email}</span>
                    </p>
                    {profile?.users?.phoneNo && (
                      <p className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 mt-1">
                        <RiPhoneLine className="w-3 h-3 shrink-0" />
                        <span>{profile.users.phoneNo}</span>
                      </p>
                    )}
                    <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-wider">
                      {profile?.status || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Academic Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: RiSchoolLine, label: "Grade", value: profile?.section?.grade?.name || '—' },
                  { icon: RiUserLine, label: "Section", value: profile?.section?.name || '—' },
                  { icon: RiBarChartLine, label: "Roll No.", value: profile?.rollNumber?.toString() || '—' },
                  { icon: RiSchoolLine, label: "Admission", value: profile?.admissionNumber || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted/30 rounded-2xl p-3.5 space-y-1.5 border border-border/40">
                    <Icon className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="font-black text-sm tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Global Rank */}
          <Card className="rounded-3xl border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <RiGlobalLine className="w-3.5 h-3.5 text-primary" /> Global Standing
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-primary">#{profile?.users.globalRank ?? '—'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Rank</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black">{profile?.users.globalRating ?? '—'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rating</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black">{profile?.rankingPoints ?? '—'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <RiCalendarCheckLine className="w-3.5 h-3.5 text-primary" /> Attendance
                </h3>
                {isLoadingAttendance && <RiLoader4Line className="w-4 h-4 animate-spin text-primary opacity-50" />}
              </div>

              {attendanceError ? (
                <p className="text-sm text-destructive font-semibold">{attendanceError}</p>
              ) : (
                <>
                  {/* Ring Progress */}
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/30" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                          strokeDasharray={`${attendancePct} ${100 - attendancePct}`}
                          strokeLinecap="round"
                          className={cn(attendancePct >= 75 ? "text-emerald-500" : attendancePct >= 50 ? "text-amber-500" : "text-red-500")}
                          stroke="currentColor"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn("text-lg font-black", attendanceColor)}>{attendancePct}%</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
                        <RiCalendarCheckLine className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                        <p className="text-lg font-black text-emerald-500">{presentDays}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Present</p>
                      </div>
                      <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
                        <RiCalendarCloseLine className="w-4 h-4 text-red-500 mx-auto mb-1" />
                        <p className="text-lg font-black text-red-500">{absentDays}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Absent</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Attendance Log */}
                  {attendance.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent History</p>
                      {attendance.slice(0, 5).map((record, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {format(new Date(record.date), 'MMM d, yyyy')}
                          </span>
                          <Badge className={cn(
                            "text-[10px] font-bold uppercase",
                            record.status === 'PRESENT' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : record.status === 'LEAVE' ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                          )}>
                            {record.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Sign Out Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-14 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold text-base transition-all"
          >
            <RiLogoutBoxLine className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  )
}
