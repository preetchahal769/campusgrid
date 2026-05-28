"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiFetch } from "@/lib/api"
import { 
  RiArrowLeftLine, 
  RiCheckLine, 
  RiCloseLine, 
  RiCalendarEventLine, 
  RiTimeLine, 
  RiLoader4Line, 
  RiErrorWarningLine 
} from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface StudentRosterItem {
  id: string
  name: string
  rollNumber: string
  isOnLeave: boolean
  leaveReason?: string
}

interface SectionRosterData {
  sectionId: string
  sectionName: string
  gradeName: string
  students: StudentRosterItem[]
}

export default function RapidAttendancePage() {
  const router = useRouter()
  
  const [sectionData, setSectionData] = useState<SectionRosterData | null>(null)
  const [students, setStudents] = useState<StudentRosterItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({})

  useEffect(() => {
    const fetchClassStudents = async () => {
      try {
        const data = await apiFetch('/academics/sections/my-class/students')
        setSectionData(data)
        setStudents(data.students)
        
        // Initialize attendance state with defaults (On-leave students are ABSENT by default but shown differently)
        const initial: Record<string, 'PRESENT' | 'ABSENT'> = {}
        data.students.forEach((s: StudentRosterItem) => {
          initial[s.id] = s.isOnLeave ? 'ABSENT' : 'PRESENT'
        })
        setAttendance(initial)
      } catch (err: any) {
        // If 403/404, they might not be an in-charge, which is fine
        if (err.message?.includes('403') || err.message?.includes('404')) {
          setError("You are not assigned as an in-charge for any section.")
        } else {
          setError(err.message)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchClassStudents()
  }, [])

  const toggleStatus = (id: string, status: 'PRESENT' | 'ABSENT') => {
    setAttendance(prev => ({ ...prev, [id]: status }))
  }

  const handleSubmit = async () => {
    if (!sectionData) return
    setIsSubmitting(true)
    try {
      const records = students.map(s => ({
        users_id: s.id, // Backend expects student's user ID or profile ID? Guide says 'users_id'
        status: attendance[s.id] || 'ABSENT',
        date: new Date().toISOString().split('T')[0]
      }))

      await apiFetch(`/attendance/class/${sectionData.sectionId}`, {
        method: 'POST',
        body: JSON.stringify(records)
      })
      
      router.push('/teacher')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length
  const absentCount = Object.values(attendance).filter(v => v === 'ABSENT').length
  const leaveCount = students.filter(s => s.isOnLeave).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !sectionData) {
    return (
      <div className="p-6 space-y-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors">
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <RiErrorWarningLine className="w-12 h-12 text-destructive opacity-40" />
          <p className="text-muted-foreground font-medium">{error}</p>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative pb-28 text-foreground animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0 pr-2">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div className="min-w-0 pr-2">
            <h1 className="text-xl font-bold tracking-tight truncate">Class Attendance</h1>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5 truncate">Mark Morning Roll Call</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          {students.map((student: StudentRosterItem) => (
            <div key={student.id} className="relative">
               <Card className={cn(
                  "p-3 rounded-2xl border transition-colors shadow-sm bg-background/60 backdrop-blur-md",
                  student.isOnLeave ? "border-amber-500/30 bg-amber-500/5 opacity-80" : "border-border/40 hover:border-primary/30"
               )}>
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                   <div className="flex items-center gap-3 min-w-0 pr-2">
                     <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                        student.isOnLeave ? "bg-amber-500/20 text-amber-700" : "bg-primary/10 text-primary"
                     )}>
                       {student.name.charAt(0)}
                     </div>
                     <div className="min-w-0 flex-1">
                       <h3 className={cn(
                          "font-semibold text-sm leading-tight flex flex-wrap items-center gap-1.5",
                          student.isOnLeave && "text-amber-700 dark:text-amber-500"
                       )}>
                         <span className="truncate max-w-[140px] sm:max-w-[200px]">{student.name}</span>
                         {student.isOnLeave && (
                            <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">On Leave</span>
                         )}
                       </h3>
                       <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">ROLL {student.rollNumber}</p>
                     </div>
                   </div>
                   
                   {/* Dual Toggle Buttons */}
                   <div className="flex bg-muted/60 p-1 rounded-xl border border-border/30 shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() => toggleStatus(student.id, "PRESENT")}
                        className={cn(
                          "flex items-center justify-center px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                          attendance[student.id] === "PRESENT" 
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                            : "text-muted-foreground hover:bg-background/80"
                        )}
                      >
                        P
                      </button>
                      <button
                        onClick={() => toggleStatus(student.id, "ABSENT")}
                        className={cn(
                          "flex items-center justify-center px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                          attendance[student.id] === "ABSENT" 
                            ? "bg-red-500 text-white shadow-md shadow-red-500/20" 
                            : "text-muted-foreground hover:bg-background/80"
                        )}
                      >
                        A
                      </button>
                   </div>
                 </div>

                 {/* Leave Reason Inline */}
                 {student.isOnLeave && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                       <div className="flex items-start gap-2">
                          <RiCalendarEventLine className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-amber-700 font-medium italic">"{student.leaveReason || 'Personal Leave'}"</p>
                       </div>
                    </div>
                 )}
               </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-20 animate-in slide-in-from-bottom-8 duration-500 delay-300">
        <div className="bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/10 rounded-[2rem] p-2">
          <Button 
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full h-14 rounded-full text-base font-bold bg-primary hover:bg-primary/90 flex justify-between items-center px-6 transition-all active:scale-[0.98]">
            {isSubmitting ? (
              <RiLoader4Line className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              <>
                <span>Submit Attendance</span>
                <div className="flex gap-1.5 text-[11px]">
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-mono">{presentCount} P</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-mono">{absentCount} A</span>
                </div>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
