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
  RiShieldUserLine,
  RiLayoutGridLine,
  RiArrowDownSLine,
  RiUser3Line,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Teacher {
  id: string
  users: {
    name: string
  }
}

interface Section {
  id: string
  name: string
  grade: {
    name: string
  }
}

export default function SetInchargePage() {
  const router = useRouter()
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [sections, setSections] = useState<Section[]>([])
  
  const [teacherId, setTeacherId] = useState("")
  const [sectionId, setSectionId] = useState("")

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        const [teachersData, sectionsData] = await Promise.all([
          apiFetch("/teachers"), // Assuming this exists
          apiFetch("/academics/sections"),
        ])
        
        setTeachers(Array.isArray(teachersData) ? teachersData : [])
        setSections(Array.isArray(sectionsData) ? sectionsData : [])
      } catch (err: any) {
        setError("Failed to load required data. Please try again.")
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionId) return setError("Please select a section")
    if (!teacherId) return setError("Please select a teacher")

    setIsSubmitting(true)
    setError(null)
    try {
      await apiFetch(`/academics/sections/${sectionId}/incharge`, {
        method: "PATCH",
        body: JSON.stringify({
          teacherId: teacherId,
        }),
      })
      
      const teacherName = teachers.find(t => t.id === teacherId)?.users.name
      const sectionName = sections.find(s => s.id === sectionId)?.name
      
      setSuccess(`Successfully set ${teacherName} as in-charge for ${sectionName}!`)
      setTeacherId("")
      setSectionId("")
      setTimeout(() => setSuccess(null), 5000)
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
          className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Class In-charge</h1>
          <p className="text-xs text-white/70 font-medium">Assign a teacher to manage a section</p>
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

        {/* School Context Pill */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
            <span className="text-rose-500 text-sm font-black">🏫</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Oversight Context</p>
            <p className={cn("text-sm font-bold truncate", !schoolId && "text-destructive")}>
              {isLoadingSchool ? "Loading..." : schoolDisplay}
            </p>
          </div>
        </div>

        {/* Section Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiLayoutGridLine className="w-3.5 h-3.5 text-primary" /> Select Section *
          </label>
          <div className="relative">
            <select
              value={sectionId}
              onChange={e => setSectionId(e.target.value)}
              disabled={isLoadingData || isSubmitting}
              className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all appearance-none"
            >
              <option value="">{isLoadingData ? "Loading sections..." : "Select a section"}</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.grade.name} - {section.name}</option>
              ))}
            </select>
            <RiArrowDownSLine className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Teacher Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiUser3Line className="w-3.5 h-3.5 text-primary" /> Select Teacher *
          </label>
          <div className="relative">
            <select
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
              disabled={isLoadingData || isSubmitting}
              className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all appearance-none"
            >
              <option value="">{isLoadingData ? "Loading teachers..." : "Select a teacher"}</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.users.name}</option>
              ))}
            </select>
            <RiArrowDownSLine className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingData}
          className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-rose-500/20 mt-2 bg-rose-600 hover:bg-rose-700 text-white"
        >
          {isSubmitting ? (
            <RiLoader4Line className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <RiShieldUserLine className="w-5 h-5 mr-2" />
              Set In-charge
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
