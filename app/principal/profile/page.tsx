"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout, updateUser } from "@/lib/store/slices/authSlice"
import { apiFetch, getImageUrl } from "@/lib/api"
import { useSchoolInfo } from "@/hooks/useSchoolInfo"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiMailLine,
  RiShieldCheckLine,
  RiLogoutBoxLine,
  RiPhoneLine,
  RiEdit2Line,
  RiSaveLine,
  RiCloseLine,
  RiUser3Line,
  RiBuildingLine,
  RiLockPasswordLine,
  RiCameraLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function PrincipalProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { schoolDisplay, schoolId } = useSchoolInfo()

  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phoneNo: "", // We'll try to fetch this or keep it empty if not available
  })

  useEffect(() => {
    if (user) {
      setEditForm(prev => ({
        ...prev,
        name: user.name || "",
      }))
    }
  }, [user])

  const handleLogout = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    dispatch(logout())
    router.push('/login')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const updatedUser = await apiFetch('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: editForm.name,
          phoneNo: editForm.phoneNo,
        })
      })

      dispatch(updateUser({ 
        name: updatedUser.name,
        // If the backend returns more fields, we can add them here
      }))
      
      setIsEditing(false)
    } catch (err: any) {
      setUpdateError(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    setUpdateError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const data = await apiFetch('/users/profile/photo', {
        method: 'PATCH',
        body: formData,
      })

      // Handle both direct object and nested user object responses
      const photoUrl = data.photoUrl || data.user?.photoUrl
      if (photoUrl) {
        dispatch(updateUser({ photoUrl }))
      }
    } catch (err: any) {
      setUpdateError(err.message)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Decorative header bg */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-violet-500/20 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black tracking-tight">Principal Profile</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
            isEditing ? "bg-rose-500 text-white" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          )}
        >
          {isEditing ? <RiCloseLine className="w-5 h-5" /> : <RiEdit2Line className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-5 space-y-5 mt-2">
        {/* Profile Card */}
        <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in duration-500">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-violet-500/30 overflow-hidden relative">
                  {mounted && user?.photoUrl ? (
                    <img src={getImageUrl(user.photoUrl)} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    (user?.name || 'P')[0].toUpperCase()
                  )}
                  
                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    {isUploadingPhoto ? (
                      <RiLoader4Line className="w-8 h-8 animate-spin text-white" />
                    ) : (
                      <RiCameraLine className="w-8 h-8 text-white" />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                  </label>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center">
                  <RiShieldCheckLine className="w-4 h-4 text-white" />
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight">{mounted ? user?.name : "..."}</h2>
                  <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                    <RiMailLine className="w-3.5 h-3.5" />
                    {mounted ? user?.email : "..."}
                  </p>
                  <Badge className="mt-2 bg-violet-500/10 text-violet-600 border-violet-500/20 font-black text-[10px] uppercase tracking-widest">
                    {mounted ? user?.role : "..."}
                  </Badge>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="w-full space-y-4 pt-2">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <div className="relative">
                      <RiUser3Line className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                    <div className="relative">
                      <RiPhoneLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={editForm.phoneNo}
                        onChange={e => setEditForm({ ...editForm, phoneNo: e.target.value })}
                        className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>

                  {updateError && (
                    <p className="text-xs text-rose-500 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{updateError}</p>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/20"
                  >
                    {isUpdating ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <><RiSaveLine className="w-5 h-5 mr-2" /> Save Changes</>}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Institution Info */}
        <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <RiBuildingLine className="w-3.5 h-3.5 text-violet-500" /> Institution Details
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 shrink-0">
                  <RiBuildingLine className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Managed School</p>
                  <p className="font-black text-sm tracking-tight">{mounted ? schoolDisplay : "..."}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                  <RiShieldCheckLine className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Account Status</p>
                  <p className="font-black text-sm tracking-tight text-emerald-500">Verified Administrator</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <RiLockPasswordLine className="w-3.5 h-3.5 text-amber-500" /> Security
            </h3>
            <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/40 hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <RiLockPasswordLine className="w-5 h-5" />
                </div>
                <p className="font-bold text-sm">Change Password</p>
              </div>
              <RiArrowLeftLine className="w-5 h-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full h-14 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-bold text-base transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
        >
          <RiLogoutBoxLine className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
