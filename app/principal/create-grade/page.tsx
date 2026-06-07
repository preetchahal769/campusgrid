"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { useSchoolInfo } from "@/hooks/useSchoolInfo"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiGraduationCapLine,
  RiBuilding2Line,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CreateGradePage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Grade name is required"); return }
    if (!user?.School_id) { setError("Your account is not linked to a school. Please contact the administrator."); return }

    setIsSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/grades', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          School_id: user.School_id,
        }),
      })
      setSuccess(`Grade "${data.name}" created successfully!`)
      setName("")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-12 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Create Grade</h1>
          <p className="text-xs text-white/70 font-medium">Add a new class level to your school</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-5">

        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in slide-in-from-top-2 duration-300">
            <RiCheckLine className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">{success}</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-top-2 duration-300">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <RiBuilding2Line className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Linked School</p>
            <p className={`text-sm font-bold truncate ${!schoolId ? 'text-destructive' : ''}`}>
              {isLoadingSchool ? "Loading..." : schoolId ? schoolDisplay : "Not assigned"}
            </p>
          </div>
        </div>

        {/* Grade Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiGraduationCapLine className="w-3.5 h-3.5 text-primary" /> Grade Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(null) }}
            placeholder="e.g. Class 10, Grade 8, Form 4..."
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
          />
        </div>

        {/* Live Preview */}
        {name && (
          <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3 animate-in fade-in duration-300">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Preview</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
                <RiGraduationCapLine className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">{name}</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">New Grade · Sections can be added after creation</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || !user?.School_id}
          className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 mt-2"
        >
          {isSubmitting ? (
            <RiLoader4Line className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <RiCheckLine className="w-5 h-5 mr-2" />
              Create Grade
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
