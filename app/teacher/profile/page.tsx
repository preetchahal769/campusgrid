"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setTeacherProfile, updateUserProfile } from "@/lib/store/slices/teacherSlice"
import { logout, updateUser } from "@/lib/store/slices/authSlice"
import { apiFetch, getImageUrl } from "@/lib/api"
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
  RiPhoneLine,
  RiEdit2Line,
  RiSaveLine,
  RiCloseLine,
  RiUser3Line,
  RiCameraLine,
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

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

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

  const startEditing = () => {
    setEditName(profile?.users?.name || user?.name || "")
    setEditPhone(profile?.users?.phoneNo || "")
    setIsEditing(true)
    setError(null)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) { setError("Name is required"); return }

    setIsUpdating(true)
    setError(null)
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
      dispatch(updateUserProfile({ name: updatedUser.name, phoneNo: updatedUser.phoneNo }))
      
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    setError(null)

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
      setError(err.message)
    } finally {
      setIsUploadingPhoto(false)
    }
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
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-black shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Edit Profile</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Update your details</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="ml-auto w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                        <RiUser3Line className="w-3 h-3 text-primary" /> Full Name
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
                  <div className="relative shrink-0 group">
                    <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-xl shadow-primary/30 overflow-hidden relative">
                      {user?.photoUrl ? (
                        <img src={getImageUrl(user.photoUrl)} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        initials
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
                    <h2 className="text-xl font-black tracking-tight truncate">{displayName}</h2>
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
                      Teacher
                    </Badge>
                  </div>
                </div>
              )}
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
