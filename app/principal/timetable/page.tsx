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
  RiTimeLine,
  RiCalendarEventLine,
  RiAddLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiTeamLine,
  RiBookOpenLine,
  RiLayoutGridLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TSSMapping {
  id: string
  subject: { name: string; code: string }
  section: { name: string; grade: { name: string } }
  teachers: { users: { name: string } }
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function ManageTimetablePage() {
  const router = useRouter()
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [tssMappings, setTssMappings] = useState<TSSMapping[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Current slot being added
  const [currentSlot, setCurrentSlot] = useState({
    dayOfWeek: "Monday",
    lectureNo: 1,
    startTime: "08:00 AM",
    endTime: "09:00 AM",
    tssId: "",
  })

  // List of slots to be submitted
  const [slotsToSubmit, setSlotsToSubmit] = useState<any[]>([])

  useEffect(() => {
    const fetchMappings = async () => {
      setIsLoadingData(true)
      try {
        // Attempting to fetch TSS mappings. If this fails, we might need to use /teachers/assign response
        const data = await apiFetch("/academics/tss") 
        setTssMappings(Array.isArray(data) ? data : [])
      } catch (err: any) {
        // If /academics/tss doesn't exist, we'll show an error. 
        // In a real app, we'd have a definitive endpoint.
        setError("Could not load Teacher-Subject mappings. Please ensure teachers are assigned first.")
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchMappings()
  }, [])

  const addSlot = () => {
    if (!currentSlot.tssId) return alert("Please select a mapping")
    
    setSlotsToSubmit(prev => [...prev, { ...currentSlot }])
    // Reset for next slot (increment lecture no)
    setCurrentSlot(prev => ({ ...prev, lectureNo: prev.lectureNo + 1 }))
  }

  const removeSlot = (index: number) => {
    setSlotsToSubmit(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (slotsToSubmit.length === 0) return setError("Add at least one slot")

    setIsSubmitting(true)
    setError(null)
    try {
      await apiFetch("/academics/timetable", {
        method: "POST",
        body: JSON.stringify({
          slots: slotsToSubmit.map(s => ({
            dayOfWeek: s.dayOfWeek,
            lectureNo: Number(s.lectureNo),
            startTime: s.startTime,
            endTime: s.endTime,
            teachersubjectsection_id: s.tssId,
          }))
        }),
      })
      
      setSuccess(`Successfully created ${slotsToSubmit.length} timetable slots!`)
      setSlotsToSubmit([])
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 relative z-0">
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
          <h1 className="text-xl font-black tracking-tight text-white">Manage Timetable</h1>
          <p className="text-xs text-white/70 font-medium">Create and update school schedule</p>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Success/Error Banners */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in slide-in-from-top-2">
            <RiCheckLine className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-top-2">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Add New Slot Form */}
        <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <RiAddLine className="w-3.5 h-3.5 text-primary" /> Add Schedule Slot
            </h3>

            {/* Mapping Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Mapping (Teacher - Sub - Sec)</label>
              <div className="relative">
                <select
                  value={currentSlot.tssId}
                  onChange={e => setCurrentSlot(prev => ({ ...prev, tssId: e.target.value }))}
                  disabled={isLoadingData}
                  className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold appearance-none outline-none focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">{isLoadingData ? "Loading mappings..." : "Select a mapping"}</option>
                  {tssMappings.map(tss => (
                    <option key={tss.id} value={tss.id}>
                      {tss.teachers.users.name} - {tss.subject.name} - {tss.section.grade.name} {tss.section.name}
                    </option>
                  ))}
                </select>
                <RiArrowDownSLine className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Day</label>
                <select
                  value={currentSlot.dayOfWeek}
                  onChange={e => setCurrentSlot(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold appearance-none outline-none focus:ring-4 focus:ring-primary/10"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lecture No</label>
                <input
                  type="number"
                  value={currentSlot.lectureNo}
                  onChange={e => setCurrentSlot(prev => ({ ...prev, lectureNo: parseInt(e.target.value) }))}
                  className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Time</label>
                <input
                  type="text"
                  value={currentSlot.startTime}
                  onChange={e => setCurrentSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  placeholder="08:00 AM"
                  className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Time</label>
                <input
                  type="text"
                  value={currentSlot.endTime}
                  onChange={e => setCurrentSlot(prev => ({ ...prev, endTime: e.target.value }))}
                  placeholder="09:00 AM"
                  className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={addSlot}
              variant="outline"
              className="w-full h-12 rounded-2xl border-primary/30 text-primary font-bold hover:bg-primary/5"
            >
              <RiAddLine className="w-5 h-5 mr-1" /> Add to Batch
            </Button>
          </CardContent>
        </Card>

        {/* Batch List */}
        {slotsToSubmit.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Slots to Create ({slotsToSubmit.length})</h2>
            <div className="space-y-3">
              {slotsToSubmit.map((slot, i) => {
                const mapping = tssMappings.find(m => m.id === slot.tssId)
                return (
                  <Card key={i} className="rounded-2xl border-primary/20 bg-primary/5 animate-in slide-in-from-right-4">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider">{slot.dayOfWeek}</Badge>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lecture {slot.lectureNo}</span>
                        </div>
                        <p className="font-black text-sm truncate">{mapping?.subject.name} - {mapping?.teachers.users.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{slot.startTime} - {slot.endTime}</p>
                      </div>
                      <button
                        onClick={() => removeSlot(i)}
                        className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-all"
                      >
                        <RiCloseLine className="w-5 h-5" />
                      </button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 bg-primary text-white"
            >
              {isSubmitting ? (
                <RiLoader4Line className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <RiCheckLine className="w-5 h-5 mr-2" />
                  Save Timetable ({slotsToSubmit.length} Slots)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
