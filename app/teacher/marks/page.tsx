"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { RiArrowLeftLine, RiFileTextLine, RiSearchLine, RiCheckDoubleLine, RiCalendarEventLine } from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TeacherMarksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [examCategory, setExamCategory] = useState("Daily Test")
  const [selectedClassId, setSelectedClassId] = useState("10A")
  const [session, setSession] = useState("2025-2026")

  const classesTaught = [
    { id: "10A", name: "Class 10-A", subject: "Physics" },
    { id: "11Sci", name: "Class 11 Sci", subject: "Physics Lab" },
  ]
  const selectedClass = classesTaught.find(c => c.id === selectedClassId)
  
  const isTermExam = examCategory === "Mid Term" || examCategory === "Final Term"
  // Simulated logic where tests are held on weekdays except for the 13th
  const isTestHeld = date && date.getDay() !== 0 && date.getDate() !== 13
  const hasData = isTermExam || isTestHeld
  
  // Dummy student marks data
  const students = [
    { id: "1", name: "Aarav Sharma", rollNumber: "10A-01", score: 92, total: 100, rank: 1, status: "Evaluated" },
    { id: "2", name: "Diya Patel", rollNumber: "10A-02", score: 78, total: 100, rank: 4, status: "Evaluated" },
    { id: "3", name: "Rohan Gupta", rollNumber: "10A-03", score: 85, total: 100, rank: 2, status: "Evaluated" },
    { id: "4", name: "Ananya Singh", rollNumber: "10A-04", score: 81, total: 100, rank: 3, status: "Flagged" },
    { id: "5", name: "Kabir Desai", rollNumber: "10A-05", score: 32, total: 100, rank: 7, status: "Evaluated" },
    { id: "6", name: "Neha Verma", rollNumber: "10A-06", score: 72, total: 100, rank: 6, status: "Evaluated" },
    { id: "7", name: "Arjun Mehta", rollNumber: "10A-07", score: 35, total: 100, rank: 5, status: "Evaluated" },
  ].sort((a, b) => a.rank - b.rank)

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const classAverage = Math.round(students.reduce((acc, s) => acc + s.score, 0) / students.length)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-indigo-500/5 relative text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
           <Link href="/" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
             <RiArrowLeftLine className="w-5 h-5" />
           </Link>
           <div className="flex-1 min-w-0">
             <h1 className="text-xl font-bold tracking-tight">Mark Sheets</h1>
             <p className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5 truncate">{selectedClass?.name} • {selectedClass?.subject}</p>
           </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-auto min-w-[120px] h-10 rounded-xl bg-background/60 shadow-sm border-border/50 text-xs font-semibold">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
              {classesTaught.map(c => (
                 <SelectItem key={c.id} value={c.id} className="text-xs font-semibold cursor-pointer">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={examCategory} onValueChange={setExamCategory}>
            <SelectTrigger className="w-[120px] h-10 rounded-xl bg-background/60 shadow-sm border-border/50 text-xs font-semibold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
              <SelectItem value="Daily Test" className="text-xs font-semibold cursor-pointer">Daily Test</SelectItem>
              <SelectItem value="Weekly Quiz" className="text-xs font-semibold cursor-pointer">Weekly Quiz</SelectItem>
              <SelectItem value="Mid Term" className="text-xs font-semibold cursor-pointer">Mid Term</SelectItem>
              <SelectItem value="Final Term" className="text-xs font-semibold cursor-pointer">Final Term</SelectItem>
            </SelectContent>
          </Select>
          
          {isTermExam ? (
             <Select value={session} onValueChange={setSession}>
               <SelectTrigger className="w-[120px] h-10 rounded-xl bg-background/60 shadow-sm border-border/50 text-xs font-semibold">
                 <SelectValue placeholder="Session" />
               </SelectTrigger>
               <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                 <SelectItem value="2024-2025" className="text-xs font-semibold cursor-pointer">2024-2025</SelectItem>
                 <SelectItem value="2025-2026" className="text-xs font-semibold cursor-pointer">2025-2026</SelectItem>
                 <SelectItem value="2026-2027" className="text-xs font-semibold cursor-pointer">2026-2027</SelectItem>
               </SelectContent>
             </Select>
          ) : (
             <Popover>
               <PopoverTrigger asChild>
                 <Button variant="outline" className={cn("h-10 rounded-xl bg-background/60 shadow-sm border-border/50 flex-1 justify-start text-left font-semibold text-xs", !date && "text-muted-foreground")}>
                   <RiCalendarEventLine className="mr-2 h-4 w-4 opacity-50" />
                   {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
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
          )}
        </div>

        {/* Global Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
             <div>
                <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Class Average</div>
                <div className="text-[10px] font-semibold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest mt-0.5">Out of 100</div>
             </div>
             <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{classAverage}</div>
          </div>
          <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
             <div>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Highest</div>
                <div className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-0.5">Aarav Sharma</div>
             </div>
             <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">92</div>
          </div>
        </div>

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
        {hasData ? (
          <div className="space-y-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredStudents.map((student, index) => (
              <Card key={student.id} className="p-4 rounded-2xl border-border/40 shadow-sm bg-background/60 backdrop-blur-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0 border border-border/50">
                      #{student.rank}
                    </div>
                    <div className="min-w-0 pr-2">
                       <h3 className="font-semibold text-sm leading-tight truncate">{student.name}</h3>
                       <p className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">{student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn(
                       "text-lg font-black tracking-tight",
                       student.score >= 75 ? "text-emerald-600" : student.score < 33 ? "text-red-600" : "text-primary"
                    )}>
                       {student.score}<span className="text-xs font-semibold text-muted-foreground block text-right mt-[-4px]">/{student.total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                  <div className="flex-1">
                    <span className={cn(
                       "text-[9px] px-1.5 py-0.5 rounded uppercase tracking-widest font-bold border",
                       student.status === "Evaluated" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    )}>
                      {student.status}
                    </span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-semibold gap-1.5 border-indigo-500/20 text-indigo-700 hover:bg-indigo-500/10 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                         <RiFileTextLine className="w-3.5 h-3.5" />
                         Answer Sheet
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[400px] sm:max-w-[500px] w-[90vw] p-0 rounded-[2rem] bg-background/95 backdrop-blur-2xl border-border/40 overflow-hidden">
                      <DialogHeader className="p-5 pb-0">
                        <DialogTitle className="flex justify-between items-center text-lg">
                          {student.name}'s Paper
                        </DialogTitle>
                        <DialogDescription className="text-xs font-mono uppercase space-x-2">
                          <span>{student.rollNumber}</span>
                          <span>•</span>
                          <span>Marks: {student.score}/{student.total}</span>
                          <span className="block mt-1 text-indigo-400">{examCategory} • {isTermExam ? session : (date && format(date, "PP"))}</span>
                        </DialogDescription>
                      </DialogHeader>
                      
                      {/* Simulated Scanned Answer Sheet */}
                      <div className="p-5">
                         <div className="w-full aspect-[3/4] bg-[#f8f5eb] dark:bg-[#e6e2d3] rounded-xl border border-border/20 shadow-inner relative overflow-hidden flex flex-col p-6">
                            {/* Paper lines overlay */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #1d4ed8 28px)" }}></div>
                            
                            {/* Hand-written like text */}
                            <div className="font-serif italic text-blue-900/80 text-lg leading-[28px] mt-8 relative z-10 w-full h-full">
                               <p>Q1. Explain the laws of thermodynamics.</p>
                               <p className="mt-[28px]">Ans: The first law states that energy cannot be created or destroyed...</p>
                               
                               {/* Teacher Markup Overlay */}
                               <div className="absolute top-[80px] right-2 transform rotate-12 flex flex-col items-center">
                                  <RiCheckDoubleLine className="w-8 h-8 text-red-600 opacity-80" />
                                  <span className="text-red-600 font-bold font-sans text-xs uppercase tracking-widest mt-1">Excellent</span>
                               </div>

                               <div className="absolute bottom-4 right-4 transform -rotate-6">
                                  <div className="w-16 h-16 rounded-full border-4 border-red-600/50 flex items-center justify-center font-bold text-red-600/80 text-xl font-sans">
                                     {student.score}
                                  </div>
                               </div>
                            </div>
                            
                            {/* Scanner UI artifacts */}
                            <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-muted-foreground/40 uppercase font-bold tracking-widest">
                               Scan ID: #{Math.random().toString(36).substr(2, 9)}<br/>
                               Processed: 2026-03-22
                            </div>
                         </div>
                         
                         <div className="mt-4 bg-muted/50 rounded-xl p-3 border border-border/30">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Teacher Feedback Note</label>
                            <p className="text-sm font-medium">
                               {student.score >= 75 ? "Excellent work. Distinction secured!" : 
                                student.score >= 33 ? "Passed, but focus more on theoretical derivations." : 
                                "Needs serious improvement to clear passing score of 33."}
                            </p>
                         </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border/50">
              <RiFileTextLine className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">No Test Held</h2>
            <p className="text-sm text-muted-foreground max-w-[280px]">
               No {examCategory.toLowerCase()} was officially scheduled or recorded for the selected date.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
