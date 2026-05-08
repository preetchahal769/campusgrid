"use client"

import { useState } from "react"
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
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TARGET_OPTIONS = [
  { value: 'STUDENT', label: 'Students Only', icon: RiUserLine, desc: 'Visible to all students', color: 'border-primary/30 bg-primary/5 text-primary' },
  { value: 'TEACHER', label: 'Teachers Only', icon: RiGroupLine, desc: 'Visible to all teachers', color: 'border-amber-500/30 bg-amber-500/5 text-amber-600' },
  { value: 'ALL',     label: 'Everyone',      icon: RiGlobalLine, desc: 'Visible to all roles',   color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600' },
]

export default function BroadcastPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetrole, setTargetrole] = useState<'STUDENT' | 'TEACHER' | 'ALL'>('STUDENT')

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
      await apiFetch('/communications/broadcasts', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), message: message.trim(), targetrole }),
      })
      setSuccess(true)
      setTitle("")
      setMessage("")
      setTargetrole('STUDENT')
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedOption = TARGET_OPTIONS.find(o => o.value === targetrole)!

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

        {/* Target Audience */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
            <RiGroupLine className="w-3.5 h-3.5 text-primary" /> Target Audience *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TARGET_OPTIONS.map(({ value, label, icon: Icon, desc, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setTargetrole(value as any); setError(null) }}
                className={cn(
                  "rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 active:scale-[0.96]",
                  targetrole === value
                    ? color + " shadow-md"
                    : "border-border/50 bg-background/40 text-muted-foreground hover:border-primary/20"
                )}
              >
                <Icon className="w-5 h-5" />
                <div>
                  <p className="font-black text-xs leading-tight">{label}</p>
                  <p className="text-[9px] font-medium opacity-60 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

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

        {/* Live Preview */}
        {(title || message) && (
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <RiMegaphoneLine className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Preview</p>
              <div className={cn("ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold border", selectedOption.color)}>
                → {selectedOption.label}
              </div>
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
