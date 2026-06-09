"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { updateUser } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"
import {
  RiCameraLensLine,
  RiPhoneLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiCheckLine,
  RiUserSmileLine,
  RiUploadCloud2Line
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"


export default function OnboardingPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  
  const [mounted, setMounted] = useState(false)
  const [phoneNo, setPhoneNo] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    // TypeScript needs to know phoneNo exists on user or we cast it
    if (user && (user as any).phoneNo) {
      setPhoneNo((user as any).phoneNo)
    }
  }, [user])

  if (!mounted || !user) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return setError("Image must be less than 5MB")
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNo.trim()) return setError("Please enter your phone number")

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Update Profile (Phone)
      const updatedUser = await apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ phoneNo }),
      })

      // 2. Upload Photo if selected
      let finalPhotoUrl = updatedUser.photoUrl
      if (photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)
        
        const photoData = await apiFetch("/users/profile/photo", {
          method: 'PATCH',
          body: formData
        })

        finalPhotoUrl = photoData.photoUrl
      }

      // 3. Update Redux state
      dispatch(updateUser({ ...updatedUser, photoUrl: finalPhotoUrl }))

      // 4. Redirect to proper dashboard
      router.push(`/${user.role.toLowerCase()}`)

    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0A4EA6]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white p-8 relative z-10 animate-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0A4EA6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RiUserSmileLine className="w-8 h-8 text-[#0A4EA6]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Welcome to Siksha Tantar</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Hi {user.name.split(' ')[0]}! Let's complete your profile before you enter the portal.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg bg-zinc-100 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#0A4EA6]/30 transition-all"
            >
              {photoPreview || user.photoUrl ? (
                <img 
                  src={photoPreview || user.photoUrl} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <RiCameraLensLine className="w-10 h-10 text-zinc-300 group-hover:text-[#0A4EA6]/50 transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <RiUploadCloud2Line className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Profile Photo</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 pl-2">
              <RiPhoneLine className="w-3.5 h-3.5 text-[#0A4EA6]" /> Phone Number *
            </label>
            <input
              type="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="e.g. +1 234 567 8900"
              className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-[#0A4EA6]/10 focus:bg-background outline-none transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-[#0A4EA6]/20 mt-4 bg-[#0A4EA6] hover:bg-[#083b7c] text-white"
          >
            {isSubmitting ? (
              <RiLoader4Line className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <RiCheckLine className="w-5 h-5 mr-2" />
                Complete Profile
              </>
            )}
          </Button>

        </form>
      </div>
    </div>
  )
}
