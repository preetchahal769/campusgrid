"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useSchoolInfo } from "@/hooks/useSchoolInfo"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiLayoutGridLine,
  RiGraduationCapLine,
  RiArrowDownSLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Grade {
  id: string
  name: string
}

export default function CreateSectionPage() {
  const router = useRouter()

  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [name, setName] = useState("")
  const [gradeId, setGradeId] = useState("")
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoadingGrades, setIsLoadingGrades] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await apiFetch('/academics/grades')
        setGrades(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError("Failed to load grades. Please try again.")
      } finally {
        setIsLoadingGrades(false)
      }
    }
    fetchGrades()
  }, [])

  const selectedGrade = grades.find(g => g.id === gradeId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Section name is required"); return }
    if (!gradeId) { setError("Please select a grade"); return }

    setIsSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/sections', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          grade_id: gradeId,
        }),
      })
      setSuccess(`Section "${data.name}" created in ${selectedGrade?.name ?? 'grade'} successfully!`)
      setName("")
      setGradeId("")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-52 bg-gradient-to-br from-indigo-500/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Create Section</h1>
          <p className="text-xs text-muted-foreground font-medium">Add a section under an existing grade</p>
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

        {/* School pill */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <RiArrowLeftLine className="w-4 h-4 text-indigo-500 hidden" />
            <span className="text-indigo-500 text-sm font-black">🏫</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Linked School</p>
            <p className={`text-sm font-bold truncate ${!schoolId ? 'text-destructive' : ''}`}>
              {isLoadingSchool ? "Loading..." : schoolId ? schoolDisplay : "Not assigned"}
            </p>
          </div>
        </div>

        {/* Grade Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiGraduationCapLine className="w-3.5 h-3.5 text-primary" /> Parent Grade *
          </label>
          <div className="relative group">
            <select
              value={gradeId}
              onChange={e => { setGradeId(e.target.value); setError(null) }}
              disabled={isLoadingGrades || isSubmitting}
              className={cn(
                "w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 pr-10 text-sm font-bold appearance-none outline-none transition-all",
                "focus:ring-4 focus:ring-primary/10 focus:bg-background focus:border-primary/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !gradeId && "text-muted-foreground font-medium"
              )}
            >
              <option value="">
                {isLoadingGrades ? "Loading grades..." : "Select a grade"}
              </option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>{grade.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              {isLoadingGrades ? (
                <RiLoader4Line className="w-5 h-5 animate-spin" />
              ) : (
                <RiArrowDownSLine className="w-5 h-5" />
              )}
            </div>
          </div>
          {grades.length === 0 && !isLoadingGrades && (
            <p className="text-[10px] font-bold text-amber-600 pl-1">
              No grades found. <button type="button" onClick={() => router.push('/principal/create-grade')} className="underline hover:text-amber-700">Create a grade first.</button>
            </p>
          )}
        </div>

        {/* Section Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiLayoutGridLine className="w-3.5 h-3.5 text-primary" /> Section Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(null) }}
            placeholder="e.g. Section A, Section B, Red House..."
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
          />
        </div>

        {/* Live Preview */}
        {(name || gradeId) && (
          <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-3 animate-in fade-in duration-300">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Preview</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <RiLayoutGridLine className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">{name || "Section name..."}</p>
                <p className="text-[11px] font-bold text-muted-foreground mt-0.5">
                  under <span className="text-indigo-500">{selectedGrade?.name ?? "— select a grade"}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingGrades}
          className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 mt-2"
        >
          {isSubmitting ? (
            <RiLoader4Line className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <RiCheckLine className="w-5 h-5 mr-2" />
              Create Section
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
