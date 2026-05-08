"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { RiArrowLeftLine, RiCalendarEventLine, RiSearchLine } from "@remixicon/react"
import { format, isSameDay } from "date-fns"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function TeacherAttendanceHistoryPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("10A")

  const classesTaught = [
    { id: "10A", name: "Class 10-A" },
    { id: "11Sci", name: "Class 11 Sci" },
  ]
  const selectedClass = classesTaught.find(c => c.id === selectedClassId)
  
  // Dummy student attendance history data
  const students = [
    { id: "1", name: "Aarav Sharma", rollNumber: "10A-01", status: "present" },
    { id: "2", name: "Diya Patel", rollNumber: "10A-02", status: "leave" },
    { id: "3", name: "Rohan Gupta", rollNumber: "10A-03", status: "present" },
    { id: "4", name: "Ananya Singh", rollNumber: "10A-04", status: "present" },
    { id: "5", name: "Kabir Desai", rollNumber: "10A-05", status: "absent" },
    { id: "6", name: "Neha Verma", rollNumber: "10A-06", status: "present" },
    { id: "7", name: "Arjun Mehta", rollNumber: "10A-07", status: "absent" },
    { id: "8", name: "Priya Reddy", rollNumber: "10A-08", status: "present" },
  ]

  // Simulate slightly different data for different days
  const activeStudents = isSameDay(date, new Date()) ? students : students.map(s => ({
    ...s,
    // Randomize status slightly for past dates to make it look realistic
    status: (s.id === "2" ? "present" : s.id === "5" ? "absent" : s.status) as "present" | "absent" | "leave"
  }))

  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const presentCount = activeStudents.filter(s => s.status === "present").length
  const absentCount = activeStudents.filter(s => s.status === "absent").length
  const leaveCount = activeStudents.filter(s => s.status === "leave").length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-blue-500/5 relative text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
           <Link href="/" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
             <RiArrowLeftLine className="w-5 h-5" />
           </Link>
           <div className="flex-1 min-w-0">
             <h1 className="text-xl font-bold tracking-tight">Attendance Ledger</h1>
             <p className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5 truncate">{selectedClass?.name} History</p>
           </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[120px] h-11 rounded-2xl bg-background/60 shadow-sm border-border/50 text-sm font-semibold shrink-0">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                {classesTaught.map(c => (
                   <SelectItem key={c.id} value={c.id} className="text-xs sm:text-sm font-semibold cursor-pointer">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-11 rounded-2xl bg-background/60 shadow-sm border-border/50 flex-1 justify-start text-left font-semibold text-sm", !date && "text-muted-foreground")}>
                  <RiCalendarEventLine className="mr-2 sm:mr-3 h-5 w-5 opacity-50 text-blue-600 shrink-0" />
                  {date ? format(date, "MMM do, yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-border/50 shadow-xl" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search student or roll number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-full bg-background/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Summary Chips */}
        <div className="flex gap-2 text-xs font-bold pt-1">
          <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex-1 text-center">
            {presentCount} Present
          </div>
          <div className="bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg flex-1 text-center">
            {absentCount} Absent
          </div>
          <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg flex-1 text-center">
            {leaveCount} Leave
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        <div className="space-y-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredStudents.map((student) => (
            <Card key={student.id} className={cn(
              "p-4 rounded-2xl border shadow-sm backdrop-blur-md transition-all flex items-center justify-between",
              student.status === "leave" ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-background/60"
            )}>
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className={cn(
                   "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                   student.status === "leave" ? "bg-amber-500/20 text-amber-700" : "bg-blue-500/10 text-blue-600"
                )}>
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={cn(
                     "font-semibold text-sm leading-tight flex flex-wrap items-center gap-1.5",
                     student.status === "leave" && "text-amber-700 dark:text-amber-500"
                  )}>
                    <span className="truncate">{student.name}</span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">{student.rollNumber}</p>
                </div>
              </div>
              
              <div className="shrink-0 flex items-center">
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border",
                  student.status === "present" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                  student.status === "absent" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                  "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}>
                  {student.status}
                </div>
              </div>
            </Card>
          ))}
          
          {filteredStudents.length === 0 && (
             <div className="text-center py-10 text-muted-foreground text-sm font-medium">
                No students found matching your search.
             </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
