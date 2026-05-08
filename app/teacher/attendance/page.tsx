"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RiArrowLeftLine, RiCheckLine, RiCloseLine, RiCalendarEventLine, RiTimeLine } from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { toggleStudentStatus, updateLeaveStatusByName, type Student } from "@/lib/store/slices/attendanceSlice"

export default function RapidAttendancePage() {
  const dispatch = useAppDispatch()
  
  // We grab the global students for demo purposes. 
  // In a real app, this would be fetched based on selectedClassId
  const students = useAppSelector((state: any) => state.attendance.class10A as Student[])

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const todaysClasses = [
    { id: "10A", name: "Class 10-A", subject: "Physics", time: "09:00 AM - 09:45 AM", enrolled: 42 },
    { id: "11Sci", name: "Class 11 Science", subject: "Physics Lab", time: "11:00 AM - 12:30 PM", enrolled: 38 },
    { id: "12Arts", name: "Class 12 Arts", subject: "General Science", time: "02:00 PM - 02:45 PM", enrolled: 25 },
  ]

  const toggleStatus = (id: string, newStatus: "present" | "absent") => {
    dispatch(toggleStudentStatus({ id, newStatus }))
  }

  const handleLeaveAction = (name: string, action: "approve" | "decline") => {
    dispatch(updateLeaveStatusByName({ name, leaveAction: action, isMaster: false }))
  }

  const presentCount = students.filter((s: Student) => s.status === "present").length
  const absentCount = students.filter((s: Student) => s.status === "absent").length
  const leaveCount = students.filter((s: Student) => s.status === "leave").length

  // --- View 1: Class Selection ---
  if (!selectedClassId) {
    return (
      <div className="flex flex-col min-h-screen bg-background relative text-foreground">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
              <RiArrowLeftLine className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Take Attendance</h1>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Select Lecture</p>
            </div>
          </div>
          <Link href="/teacher/attendance/history" className="text-xs font-bold bg-primary/10 text-primary px-3 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors shrink-0">
            View Ledger
          </Link>
        </div>

        <ScrollArea className="flex-1 w-full p-4">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest pl-2 mb-2">Today's Lectures</h2>
            
            {todaysClasses.map((cls) => (
              <Card 
                key={cls.id} 
                onClick={() => setSelectedClassId(cls.id)}
                className="p-4 rounded-3xl border-border/40 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-background/60 backdrop-blur-md flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{cls.name}</h3>
                  <p className="text-xs font-semibold text-muted-foreground">{cls.subject} • {cls.enrolled} Students</p>
                </div>
                <div className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-primary/20">
                   <RiTimeLine className="w-4 h-4" />
                   {cls.time.split(" ")[0]} {cls.time.split(" ")[1]}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // --- View 2: Rapid Roster Roll Call ---
  const selectedClass = todaysClasses.find(c => c.id === selectedClassId)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative pb-28 text-foreground animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0 pr-2">
          <button 
            onClick={() => setSelectedClassId(null)}
            className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div className="min-w-0 pr-2">
            <h1 className="text-xl font-bold tracking-tight truncate">{selectedClass?.name}</h1>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5 truncate">{selectedClass?.subject}</p>
          </div>
        </div>
        <Link href="/teacher/attendance/history" className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors shrink-0 hidden sm:block">
           View Ledger
        </Link>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          {students.map((student: Student) => (
            <div key={student.id} className="relative">
               <Card className={cn(
                  "p-3 rounded-2xl border transition-colors shadow-sm bg-background/60 backdrop-blur-md",
                  student.leaveStatus === "approved" ? "border-amber-500/30 bg-amber-500/5 opacity-80" : "border-border/40 hover:border-primary/30"
               )}>
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                   <div className="flex items-center gap-3 min-w-0 pr-2">
                     <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                        student.leaveStatus === "approved" ? "bg-amber-500/20 text-amber-700" : "bg-primary/10 text-primary"
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
                         {student.markedByIncharge && student.status === student.morningStatus && student.morningStatus === "present" && (
                            <span className="text-[9px] bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">Morning: Present</span>
                         )}
                         {student.markedByIncharge && student.status === student.morningStatus && student.morningStatus === "absent" && (
                            <span className="text-[9px] bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-red-600 dark:text-red-400 border border-red-500/20">Morning: Absent</span>
                         )}
                         {student.morningStatus === "absent" && student.presentVotes > 0 && student.presentVotes < 2 && (
                            <span className="text-[9px] bg-orange-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-orange-600 border border-orange-500/20">Late Votes: {student.presentVotes}/2</span>
                         )}
                         {student.morningStatus === "present" && student.absentVotes > 0 && student.absentVotes < 2 && (
                            <span className="text-[9px] bg-orange-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-orange-600 border border-orange-500/20">Absent Votes: {student.absentVotes}/2</span>
                         )}
                         {student.morningStatus === "absent" && student.status === "present" && (
                            <span className="text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-emerald-600 border border-emerald-500/20">Overridden: Late</span>
                         )}
                         {student.morningStatus === "present" && student.status === "absent" && (
                            <span className="text-[9px] bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-rose-600 border border-rose-500/20">Overridden: Absent</span>
                         )}
                       </h3>
                       <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">{student.rollNumber}</p>
                     </div>
                   </div>
                   
                   {/* Dual Toggle Buttons */}
                   {student.leaveStatus !== "approved" ? (
                      <div className="flex bg-muted/60 p-1 rounded-xl border border-border/30 shrink-0 self-start sm:self-auto">
                         <button
                           onClick={() => toggleStatus(student.id, "present")}
                           className={cn(
                             "flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                             student.status === "present" 
                               ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
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
                      <button 
                         onClick={() => toggleStatus(student.id, "present")} 
                         className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 text-amber-600 border border-amber-500/30 hover:bg-amber-500/10 shrink-0"
                      >
                         Override Leave
                      </button>
                   )}
                 </div>

                 {/* Leave Request Action Inline */}
                 {student.leaveStatus === "pending" && (
                   <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex justify-between items-start gap-3">
                         <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 mb-1">
                               <RiCalendarEventLine className="w-3.5 h-3.5" />
                               Leave Requested
                               {student.leaveApproveVotes > 0 && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{student.leaveApproveVotes}/2 Approvals</span>}
                               {student.leaveDeclineVotes > 0 && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20">{student.leaveDeclineVotes}/2 Declines</span>}
                            </div>
                            <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2 pl-5">"{student.leaveReason}"</p>
                         </div>
                         <div className="flex gap-1.5 shrink-0">
                            <button onClick={() => handleLeaveAction(student.name, "approve")} className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                               <RiCheckLine className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleLeaveAction(student.name, "decline")} className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                               <RiCloseLine className="w-4 h-4" />
                            </button>
                         </div>
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
        <div className="bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/10 rounded-[2rem] p-2 flex items-center justify-between">
          <Button 
            onClick={() => setSelectedClassId(null)}
            className="w-full h-14 rounded-full text-base font-bold bg-primary hover:bg-primary/90 flex justify-between items-center px-6 transition-all active:scale-[0.98]">
            <span>Submit Roll Call</span>
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
