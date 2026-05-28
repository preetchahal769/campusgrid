"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RiArrowLeftLine, RiCheckLine } from "@remixicon/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { toggleStudentStatus, submitMorningRoll, type Student } from "@/lib/store/slices/attendanceSlice"

export default function MorningRollPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const students = useAppSelector((state) => state.attendance.class10A)

  const toggleStatus = (id: string, newStatus: "present" | "absent") => {
    dispatch(toggleStudentStatus({ id, newStatus, isMorningRoll: true }))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      dispatch(submitMorningRoll())
      router.push("/")
    }, 1000)
  }

  const presentCount = students.filter((s: Student) => s.status === "present").length
  const absentCount = students.filter((s: Student) => s.status === "absent").length
  const leaveCount = students.filter((s: Student) => s.status === "leave").length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-blue-500/5 relative pb-28 text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Morning Roll</h1>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Class 10-A Incharge</p>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {students.map((student: Student) => (
            <div key={student.id} className="relative">
               <Card className={cn(
                  "p-3 rounded-2xl border transition-colors shadow-sm bg-background/60 backdrop-blur-md",
                  student.leaveStatus === "approved" ? "border-amber-500/30 bg-amber-500/5 opacity-80" : "border-border/40 hover:border-blue-500/30"
               )}>
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                   <div className="flex items-center gap-3 min-w-0 pr-2">
                     <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                        student.leaveStatus === "approved" ? "bg-amber-500/20 text-amber-700" : "bg-blue-500/10 text-blue-600"
                     )}>
                       {student.name.charAt(0)}
                     </div>
                     <div className="min-w-0 flex-1">
                       <h3 className={cn(
                          "font-semibold text-sm leading-tight flex flex-wrap items-center gap-1.5",
                          student.leaveStatus === "approved" && "text-amber-700 dark:text-amber-500"
                       )}>
                         <span className="truncate max-w-[140px] sm:max-w-[200px]">{student.name}</span>
                         {student.leaveStatus === "approved" && (
                            <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400">On Leave</span>
                         )}
                       </h3>
                       <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">{student.rollNumber}</p>
                     </div>
                   </div>
                   
                   {/* Dual Toggles strictly for Morning Roll */}
                   {student.leaveStatus !== "approved" ? (
                      <div className="flex bg-muted/60 p-1 rounded-xl border border-border/30 shrink-0 self-start sm:self-auto">
                         <button
                           onClick={() => toggleStatus(student.id, "present")}
                           className={cn(
                             "flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                             student.status === "present" 
                               ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" 
                               : "text-muted-foreground hover:bg-background/80"
                           )}
                         >
                           P
                         </button>
                         <button
                           onClick={() => toggleStatus(student.id, "absent")}
                           className={cn(
                             "flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                             student.status === "absent" 
                               ? "bg-red-500 text-white shadow-md shadow-red-500/20" 
                               : "text-muted-foreground hover:bg-background/80"
                           )}
                         >
                           A
                         </button>
                      </div>
                   ) : (
                      <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 uppercase tracking-widest">
                         Leave Approved
                      </div>
                   )}
                 </div>
               </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-20 animate-in slide-in-from-bottom-8 duration-500 delay-300">
        <div className="bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-blue-500/10 rounded-[2rem] p-2 flex items-center justify-between">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 rounded-full text-base font-bold bg-blue-600 hover:bg-blue-700 flex justify-between items-center px-6 transition-all active:scale-[0.98]">
            <span>{isSubmitting ? "Locking Attendance..." : "Lock Morning Roll"}</span>
            <div className="flex gap-1.5 text-[11px] sm:text-xs">
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-mono">{presentCount} P</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-mono">{absentCount} A</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
