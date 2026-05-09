"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiMegaphoneLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiGroupLine,
  RiUserLine,
  RiGlobalLine,
  RiUploadLine,
  RiFileLine,
  RiCloseCircleLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ROLE_ASSETS: Record<string, { icon: any; color: string; desc: string }> = {
  STUDENT: { icon: RiUserLine, color: 'border-primary/30 bg-primary/5 text-primary', desc: 'Visible to students' },
  TEACHER: { icon: RiGroupLine, color: 'border-amber-500/30 bg-amber-500/5 text-amber-600', desc: 'Visible to teachers' },
  ADMIN: { icon: RiGlobalLine, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600', desc: 'Visible to admins' },
  PARENT: { icon: RiGroupLine, color: 'border-purple-500/30 bg-purple-500/5 text-purple-600', desc: 'Visible to parents' },
  PRINCIPAL: { icon: RiGlobalLine, color: 'border-rose-500/30 bg-rose-500/5 text-rose-600', desc: 'Visible to principal' },
}

const FALLBACK_ASSET = { icon: RiMegaphoneLine, color: 'border-border/50 bg-muted/20 text-muted-foreground', desc: 'Selected role' }

export default function BroadcastPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetrole, setTargetrole] = useState("")
  const [roles, setRoles] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await apiFetch('/communications/broadcasts/target-roles')
        setRoles(data)
        if (data && data.length > 0) setTargetrole(data[0].value)
      } catch (err: any) {
        console.error("Failed to fetch broadcast roles:", err)
        setError("Failed to load available target roles.")
      } finally {
        setIsLoadingRoles(false)
      }
    }
    fetchRoles()
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required"); return }
    if (!message.trim()) { setError("Message is required"); return }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('message', message.trim())
      
      // Staff (Teachers/Principals) omit the target field entirely for school-wide broadcasts.
      // Admins (who have target roles available) send a JSON-stringified object.
      if (roles && roles.length > 0 && targetrole) {
        const targetObj = targetrole === 'ALL' 
          ? { type: 'ALL' } 
          : { type: 'ROLE', role: targetrole };
        formData.append('target', JSON.stringify(targetObj))
      }
      
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      await apiFetch('/communications/broadcasts', {
        method: 'POST',
        body: formData,
      })
      setSuccess(true)
      setTitle("")
      setMessage("")
      setSelectedFiles([])
      if (roles.length > 0) setTargetrole(roles[0].value)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleAsset = (value: string) => ROLE_ASSETS[value] || FALLBACK_ASSET
  const selectedRole = roles.find(r => r.value === targetrole)
  const selectedAsset = getRoleAsset(targetrole)

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Send Broadcast</h1>
          <p className="text-xs text-muted-foreground font-medium">Announce something to your school</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-6">
        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in slide-in-from-top-2 duration-300">
            <RiCheckLine className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Broadcast sent successfully!</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-top-2 duration-300">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Target Audience - Only show if roles available (Admins) */}
        {roles.length > 0 && (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
              <RiGroupLine className="w-3.5 h-3.5 text-primary" /> Target Audience *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {isLoadingRoles ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl border border-border/40 bg-muted/20 animate-pulse" />
                ))
              ) : (
                roles.map(({ value, label }) => {
                  const asset = getRoleAsset(value)
                  const Icon = asset.icon
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setTargetrole(value); setError(null) }}
                      className={cn(
                        "rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 active:scale-[0.96]",
                        targetrole === value
                          ? asset.color + " shadow-md ring-2 ring-current/10"
                          : "border-border/50 bg-background/40 text-muted-foreground hover:border-primary/20"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-black text-[10px] leading-tight uppercase tracking-wide">{label}</p>
                        <p className="text-[8px] font-bold opacity-60 mt-0.5">{asset.desc}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
            <RiMegaphoneLine className="w-3.5 h-3.5 text-primary" /> Announcement Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(null) }}
            placeholder="e.g. Sports Day Tomorrow!"
            maxLength={120}
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
          />
          <p className="text-[10px] text-muted-foreground text-right font-medium pr-1">{title.length}/120</p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
            <RiFileTextLine className="w-3.5 h-3.5 text-primary" /> Message Body *
          </label>
          <textarea
            value={message}
            onChange={e => { setMessage(e.target.value); setError(null) }}
            placeholder="Write your announcement here..."
            rows={5}
            maxLength={1000}
            className="w-full rounded-2xl bg-muted/40 border border-border/50 p-4 text-sm font-medium resize-none focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
          />
          <p className="text-[10px] text-muted-foreground text-right font-medium pr-1">{message.length}/1000</p>
        </div>

        {/* Attachments */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
            <RiUploadLine className="w-3.5 h-3.5 text-primary" /> Attachments <span className="font-normal opacity-60">(optional)</span>
          </label>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border/60 rounded-3xl bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <RiUploadLine className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Add Documents / Images</p>
                <p className="text-[8px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tighter">Support multiple files</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                onChange={e => {
                  if (e.target.files) {
                    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])
                  }
                }}
              />
            </label>

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-border/50 rounded-2xl text-[10px] font-bold shadow-sm animate-in zoom-in-95 duration-200">
                    <RiFileLine className="w-3.5 h-3.5 text-primary" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button 
                      type="button"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-rose-500 transition-colors ml-1"
                    >
                      <RiCloseCircleLine className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview */}
        {(title || message) && (
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <RiMegaphoneLine className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Preview</p>
              {selectedRole && (
                <div className={cn("ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold border", selectedAsset.color)}>
                  → {selectedRole.label}
                </div>
              )}
            </div>
            {title && <p className="font-black text-base">{title}</p>}
            {message && <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20"
        >
          {isSubmitting ? (
            <RiLoader4Line className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <RiMegaphoneLine className="w-5 h-5 mr-2" />
              Send Broadcast
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
