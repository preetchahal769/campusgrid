"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RiArrowLeftLine, RiUserLine, RiTimeLine, RiAlertFill } from "@remixicon/react"
import Link from "next/link"

interface Staff {
  id: string
  name: string
  role: string
  status: "present" | "away"
  timeIn?: string
  reason?: string
  affectedClasses?: string[]
}

export default function StaffAvailabilityPage() {
  const [staff, setStaff] = useState<Staff[]>([
    { id: "1", name: "Dr. A. Einstein", role: "Physics Teacher", status: "present", timeIn: "07:45 AM" },
    { id: "2", name: "Ms. V. Woolf", role: "Literature Teacher", status: "present", timeIn: "08:02 AM" },
    { id: "3", name: "Prof. G. Leibniz", role: "Math Teacher", status: "present", timeIn: "08:15 AM" },
    { 
      id: "4", 
      name: "Dr. L. Pauling", 
      role: "Chemistry Dept Head", 
      status: "away", 
      reason: "Sick Leave",
      affectedClasses: ["10-A (09:00 AM)", "12-Sci (11:00 AM)"]
    },
    { 
      id: "5", 
      name: "Mr. R. Feynman", 
      role: "Physics Sub", 
      status: "away", 
      reason: "Conference",
      affectedClasses: ["11-B (02:00 PM)"]
    },
  ])

  const presentStaff = staff.filter(s => s.status === "present")
  const awayStaff = staff.filter(s => s.status === "away")

  return (
    <div className="flex flex-col min-h-screen pb-6 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors shrink-0">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white">Staff Availability</h1>
        </div>
        <div className="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs border border-white/30 backdrop-blur-sm">
          {presentStaff.length} / {staff.length} Present
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Action Required Section */}
          {awayStaff.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-2">
                <RiAlertFill className="w-5 h-5 text-red-500" />
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest">Substitution Required</h2>
              </div>
              
              <div className="space-y-3">
                {awayStaff.map((person) => (
                  <Card key={person.id} className="p-4 rounded-3xl border-red-500/30 shadow-sm bg-red-500/5 backdrop-blur-md">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                           {person.name.charAt(0)}
                         </div>
                         <div>
                           <h3 className="font-bold text-base leading-none mb-1 text-red-700 dark:text-red-400">{person.name}</h3>
                           <div className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest">{person.role}</div>
                         </div>
                      </div>
                      <div className="bg-red-500/10 text-red-600 font-bold px-2 py-0.5 rounded-md text-[10px] border border-red-500/20 uppercase tracking-wider">
                        {person.reason}
                      </div>
                    </div>

                    <div className="bg-background/80 rounded-2xl p-3 border border-red-500/10">
                       <p className="text-xs font-bold text-foreground/70 mb-2">Affected Lectures:</p>
                       <div className="flex flex-wrap gap-2">
                          {person.affectedClasses?.map((cls, idx) => (
                            <span key={idx} className="bg-muted px-2 py-1 rounded-lg text-xs font-semibold border border-border/50">
                               {cls}
                            </span>
                          ))}
                       </div>
                       <Button variant="outline" className="w-full mt-3 h-10 rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-700 text-xs font-bold transition-colors">
                          Assign Substitute
                       </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Present Staff Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-2 mt-4">
              <RiUserLine className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Checked In Today</h2>
            </div>
            
            <div className="space-y-2">
              {presentStaff.map((person) => (
                <Card key={person.id} className="p-3 rounded-2xl border-border/40 shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors bg-background/60 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">{person.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">{person.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                     <RiTimeLine className="w-3.5 h-3.5" />
                     {person.timeIn}
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  )
}
