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
  RiListSettingsLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CreateGradePage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [name, setName] = useState("")
  const [classesCount, setClassesCount] = useState("1")
  const [startNumber, setStartNumber] = useState("1")
  const [sectionsCount, setSectionsCount] = useState("3")
  const [sectionSeriesType, setSectionSeriesType] = useState("ALPHABET")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Base Name / Class Name is required"); return }
    if (!user?.School_id) { setError("Your account is not linked to a school. Please contact the administrator."); return }

    setIsSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/grades', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          School_id: user.School_id,
          classesCount: classesCount ? parseInt(classesCount) : 1,
          startNumber: startNumber ? parseInt(startNumber) : 1,
          sectionsCount: sectionsCount ? parseInt(sectionsCount) : 0,
          sectionSeriesType: sectionSeriesType,
        }),
      })

      const count = classesCount ? parseInt(classesCount) : 1
      setSuccess(`Successfully created ${count} classes with auto-generated sections!`)
      setName("")
      setClassesCount("1")
      setStartNumber("1")
      setSectionsCount("3")
      setSectionSeriesType("ALPHABET")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Preview Helpers
  const getSectionPreview = (idx: number) => {
    if (sectionSeriesType === 'NUMERIC') return (idx + 1).toString()
    if (sectionSeriesType === 'ROMAN') {
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
      return romans[idx] || `Sec-${idx + 1}`
    }
    return String.fromCharCode(65 + idx) // 'A', 'B', 'C'...
  }

  const classCountVal = Math.min(15, parseInt(classesCount) || 1)
  const secCountVal = Math.min(10, parseInt(sectionsCount) || 0)
  const startNumVal = parseInt(startNumber) || 1

  return (
    <div className="min-h-screen pb-12 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-violet-600 rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white animate-all duration-300"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white font-outfit">Class & Sections Setup</h1>
          <p className="text-xs text-white/70 font-medium">Auto-generate single or multiple classes and sections</p>
        </div>
      </div>

      <div className="px-5 max-w-2xl mx-auto space-y-5">
        
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

        {/* Linked School Info */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <RiBuilding2Line className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Setup Context</p>
            <p className={`text-sm font-bold truncate ${!schoolId ? 'text-destructive' : ''}`}>
              {isLoadingSchool ? "Loading..." : schoolId ? schoolDisplay : "Not assigned"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-5">
          
          {/* Base Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RiGraduationCapLine className="w-3.5 h-3.5 text-violet-600" /> Class Base Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(null) }}
              placeholder="e.g. Grade, Class, Form, Batch..."
              className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of Classes */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                Number of Classes
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={classesCount}
                onChange={e => setClassesCount(e.target.value)}
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
              />
            </div>

            {/* Start Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                Start Numbering From
              </label>
              <input
                type="number"
                min="0"
                value={startNumber}
                onChange={e => setStartNumber(e.target.value)}
                disabled={classesCount === "1"}
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sections per class */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                Sections Per Class
              </label>
              <input
                type="number"
                min="0"
                max="26"
                value={sectionsCount}
                onChange={e => setSectionsCount(e.target.value)}
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
              />
            </div>

            {/* Section series type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                Section Series Type
              </label>
              <select
                value={sectionSeriesType}
                onChange={e => setSectionSeriesType(e.target.value)}
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all appearance-none"
              >
                <option value="ALPHABET">Alphabetical (A, B, C...)</option>
                <option value="NUMERIC">Numerical (1, 2, 3...)</option>
                <option value="ROMAN">Roman Numeral (I, II, III...)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Staging Preview Widget */}
          {name.trim() && (
            <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3 animate-in fade-in duration-300">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500 flex items-center gap-1.5">
                <RiListSettingsLine className="w-3.5 h-3.5" /> Generation Preview (Showing up to 3)
              </p>
              <div className="space-y-2">
                {Array.from({ length: Math.min(3, classCountVal) }, (_, cIdx) => {
                  const cName = classCountVal > 1 
                    ? `${name.trim()} ${startNumVal + cIdx}`
                    : name.trim();
                  
                  return (
                    <div key={cIdx} className="bg-white border border-zinc-100 rounded-xl p-3 flex items-center justify-between text-xs">
                      <span className="font-black text-zinc-800">{cName}</span>
                      <div className="flex items-center gap-1">
                        {secCountVal > 0 ? (
                          Array.from({ length: secCountVal }, (_, sIdx) => (
                            <span key={sIdx} className="bg-zinc-100 text-zinc-600 font-bold px-2 py-0.5 rounded-md text-[10px]">
                              {getSectionPreview(sIdx)}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-semibold italic">No sections</span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {classCountVal > 3 && (
                  <p className="text-[10px] text-zinc-400 font-bold italic text-right">+ {classCountVal - 3} more classes...</p>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || !user?.School_id}
            className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-sm tracking-wide shadow-lg shadow-violet-600/20"
          >
            {isSubmitting ? (
              <RiLoader4Line className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <>
                <RiCheckLine className="w-5 h-5 mr-2" />
                Generate Classes & Sections
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
