"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RiArrowLeftLine, 
  RiFileTextLine, 
  RiSearchLine, 
  RiSaveLine, 
  RiLoader4Line,
  RiCheckLine
} from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TeacherMarksPage() {
  const { user } = useAppSelector((state) => state.auth)
  const [schedules, setSchedules] = useState<any[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [marks, setMarks] = useState<Record<string, { obtainedMarks: number; remarks: string }>>({})
  
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch teacher schedules on load
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const data = await apiFetch("/academics/exams/my-schedules")
        setSchedules(data)
        if (data.length > 0) {
          setSelectedScheduleId(data[0].id)
        }
      } catch (err) {
        console.error("Failed to load schedules:", err)
      } finally {
        setLoadingSchedules(false)
      }
    }
    loadSchedules()
  }, [])

  const selectedSchedule = schedules.find(s => s.id === selectedScheduleId)

  // Fetch student roster and existing results when schedule changes
  useEffect(() => {
    if (!selectedScheduleId || !selectedSchedule) return

    const loadData = async () => {
      setLoadingStudents(true)
      try {
        // 1. Fetch section student roster
        const roster = await apiFetch(`/students/section/${selectedSchedule.sectionId}`)
        
        // 2. Fetch existing results for this schedule
        const existingResults = await apiFetch(`/academics/exams/schedules/${selectedScheduleId}/results`)
        
        // Match results
        const marksMap: Record<string, { obtainedMarks: number; remarks: string }> = {}
        roster.forEach((student: any) => {
          const matched = existingResults.find((r: any) => r.studentId === student.id)
          marksMap[student.id] = {
            obtainedMarks: matched ? matched.obtainedMarks : 0,
            remarks: matched ? matched.remarks || "" : ""
          }
        })

        setStudents(roster)
        setMarks(marksMap)
      } catch (err) {
        console.error("Failed to load section data:", err)
      } finally {
        setLoadingStudents(false)
      }
    }

    loadData()
  }, [selectedScheduleId, selectedSchedule])

  const handleScoreChange = (studentId: string, value: string) => {
    const parsed = parseFloat(value) || 0
    const maxMarks = selectedSchedule?.maxMarks || 100
    const score = Math.min(Math.max(parsed, 0), maxMarks)

    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        obtainedMarks: score
      }
    }))
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value
      }
    }))
  }

  const calculateLetterGrade = (score: number) => {
    const max = selectedSchedule?.maxMarks || 100
    const percent = (score / max) * 100
    if (percent >= 95) return 'A++'
    if (percent >= 90) return 'A+'
    if (percent >= 80) return 'A'
    if (percent >= 70) return 'B'
    if (percent >= 60) return 'C'
    if (percent >= 50) return 'D'
    if (percent >= 33) return 'E'
    return 'F'
  }

  const handleSave = async () => {
    if (!selectedScheduleId) return
    setSaving(true)
    try {
      const results = students.map(s => {
        const studentMark = marks[s.id] || { obtainedMarks: 0, remarks: "" }
        return {
          studentId: s.id,
          obtainedMarks: studentMark.obtainedMarks,
          remarks: studentMark.remarks,
          grade: calculateLetterGrade(studentMark.obtainedMarks)
        }
      })

      await apiFetch("/academics/exams/results", {
        method: "POST",
        body: JSON.stringify({
          examScheduleId: selectedScheduleId,
          results
        })
      })
      alert("Marks saved successfully!")
    } catch (err: any) {
      alert(err.message || "Failed to save marks")
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.users.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.rollNumber && s.rollNumber.toString().includes(searchQuery))
  )

  const classAverage = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + (marks[s.id]?.obtainedMarks || 0), 0) / students.length)
    : 0

  return (
    <div className="flex flex-col min-h-[100dvh] relative z-0 text-foreground">
      {/* Header Backer */}
      <div className="absolute top-0 left-0 w-full h-[250px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      <div className="sticky top-0 z-10 px-6 pt-12 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
           <Link href="/teacher" className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white">
             <RiArrowLeftLine className="w-5 h-5" />
           </Link>
           <div className="flex-1 min-w-0">
             <h1 className="text-xl font-black tracking-tight text-white">Mark Sheets</h1>
             <p className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-widest mt-0.5 truncate">
               {selectedSchedule ? `${selectedSchedule.section.grade.name} - ${selectedSchedule.section.name} • ${selectedSchedule.subject.name}` : "Loading Schedules..."}
             </p>
           </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          {loadingSchedules ? (
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <RiLoader4Line className="w-4 h-4 animate-spin" />
              Loading your exam schedules...
            </div>
          ) : (
            <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
              <SelectTrigger className="w-full sm:w-[320px] h-11 rounded-xl bg-background/90 shadow-sm border-border/50 text-xs font-semibold">
                <SelectValue placeholder="Select Exam / Class" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                {schedules.map(s => (
                   <SelectItem key={s.id} value={s.id} className="text-xs font-semibold cursor-pointer">
                     {s.exam.title} ({s.subject.name} - {s.section.name})
                   </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button 
            onClick={handleSave} 
            disabled={saving || loadingStudents || students.length === 0}
            className="ml-auto rounded-xl h-11 px-5 gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white border-none shrink-0"
          >
            {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSaveLine className="w-4 h-4" />}
            Save Grades
          </Button>
        </div>

        {/* Global Stats */}
        {students.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
               <div>
                  <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Class Average</div>
                  <div className="text-[10px] font-semibold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest mt-0.5">
                    Out of {selectedSchedule?.maxMarks}
                  </div>
               </div>
               <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{classAverage}</div>
            </div>
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
               <div>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Total Rostered</div>
                  <div className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-0.5">Students</div>
               </div>
               <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{students.length}</div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search student or roll number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-full bg-background/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md transition-all shadow-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        {loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Loading Class Roster...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="space-y-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredStudents.map((student) => {
              const studentMark = marks[student.id] || { obtainedMarks: 0, remarks: "" }
              const grade = calculateLetterGrade(studentMark.obtainedMarks)
              
              return (
                <Card key={student.id} className="p-4 rounded-2xl border-border/40 shadow-sm bg-background/60 backdrop-blur-md flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="min-w-0 pr-2">
                       <h3 className="font-bold text-base leading-tight truncate">{student.users.name}</h3>
                       <p className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
                         Roll No: {student.rollNumber || "N/A"}
                       </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Grade</span>
                        <span className={cn(
                          "text-base font-black",
                          grade === 'F' ? 'text-red-500' : 'text-emerald-600'
                        )}>{grade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                        Score (Max {selectedSchedule?.maxMarks})
                      </label>
                      <input 
                        type="number"
                        min={0}
                        max={selectedSchedule?.maxMarks || 100}
                        value={studentMark.obtainedMarks}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-background/80 border border-border/40 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                        Feedback Remarks
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Good progress"
                        value={studentMark.remarks}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-background/80 border border-border/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border/50">
              <RiFileTextLine className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-lg font-bold tracking-tight mb-2">No Students Found</h2>
            <p className="text-xs text-muted-foreground max-w-[280px]">
               No active students are rostered in this section, or they don't match your query.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
