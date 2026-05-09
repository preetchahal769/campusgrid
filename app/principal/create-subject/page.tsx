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
  RiBookOpenLine,
  RiBuilding2Line,
  RiPriceTagLine,
  RiFileListLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SUBJECT_TYPES = ["Theory", "Practical", "Elective", "Lab", "Physical Education"]

export default function CreateSubjectPage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [type, setType] = useState("Theory")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Subject name is required"); return }
    if (!code.trim()) { setError("Subject code is required"); return }
    if (!user?.School_id) { setError("Your account is not linked to a school. Please contact the administrator."); return }

    setIsSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch("/academics/subjects", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          type,
          code: code.trim().toUpperCase(),
          School_id: user.School_id,
        }),
      })
      setSuccess(`Subject "${data.name}" (${data.code}) created successfully!`)
      setName("")
      setCode("")
      setType("Theory")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-52 bg-gradient-to-br from-blue-500/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Create Subject</h1>
          <p className="text-xs text-muted-foreground font-medium">Add a new subject to your school curriculum</p>
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
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <RiBuilding2Line className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Linked School</p>
            <p className={`text-sm font-bold truncate ${!schoolId ? 'text-destructive' : ''}`}>
              {isLoadingSchool ? "Loading..." : schoolId ? schoolDisplay : "Not assigned"}
            </p>
          </div>
        </div>

        {/* Subject Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiBookOpenLine className="w-3.5 h-3.5 text-primary" /> Subject Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(null) }}
            placeholder="e.g. Chemistry, Mathematics, History..."
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
          />
        </div>

        {/* Code + Type Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Subject Code */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RiPriceTagLine className="w-3.5 h-3.5 text-primary" /> Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setError(null) }}
              placeholder="e.g. CHEM01"
              maxLength={10}
              className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-black font-mono uppercase focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
            />
          </div>

          {/* Subject Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RiFileListLine className="w-3.5 h-3.5 text-primary" /> Type *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              disabled={isSubmitting}
              className={cn(
                "w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold appearance-none outline-none transition-all",
                "focus:ring-4 focus:ring-primary/10 focus:bg-background"
              )}
            >
              {SUBJECT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Preview */}
        {(name || code) && (
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3 animate-in fade-in duration-300">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Preview</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <RiBookOpenLine className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-base tracking-tight">{name || "Subject name..."}</p>
                  {code && (
                    <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                      {code.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-muted-foreground mt-0.5">
                  Type: <span className="text-blue-500">{type}</span>
                </p>
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
              Create Subject
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
