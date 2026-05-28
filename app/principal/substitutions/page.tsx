"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { 
  RiArrowLeftLine, 
  RiUserSharedLine, 
  RiTimeLine, 
  RiCheckLine, 
  RiErrorWarningLine,
  RiLoader4Line,
  RiUserSearchLine,
  RiMessage2Line,
  RiInformationLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function SubstitutionPage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)
  
  const [absentTeachers, setAbsentTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)
  const [availableSubs, setAvailableSubs] = useState<any[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    role: 'TEACHING',
    message: ''
  })

  useEffect(() => {
    setMounted(true)
    if (user && user.role !== 'PRINCIPAL') {
      router.replace(`/${user.role.toLowerCase()}`)
      return
    }

    const fetchData = async () => {
      try {
        const data = await apiFetch('/academics/substitutions/absent-teachers')
        setAbsentTeachers(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, router])

  const fetchSubstitutes = async (slot: any) => {
    setSelectedSlot(slot)
    setLoadingSubs(true)
    setAvailableSubs([])
    try {
      const day = new Date().toLocaleDateString('en-US', { weekday: 'long' }) // Dynamic in production
      const data = await apiFetch(`/academics/substitutions/available-teachers?lectureNo=${slot.lectureNo}&dayOfWeek=${day}`)
      setAvailableSubs(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingSubs(false)
    }
  }

  const handleAssign = async (subTeacherId: string) => {
    if (!selectedSlot) return
    setSubmitting(true)
    try {
      await apiFetch('/academics/substitutions/assign', {
        method: 'POST',
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          timetableId: selectedSlot.timetableId,
          subTeacherId,
          role: assignmentData.role,
          message: assignmentData.message
        })
      })
      
      // Refresh data
      const data = await apiFetch('/academics/substitutions/absent-teachers')
      setAbsentTeachers(data)
      setSelectedSlot(null)
      alert("Substitution assigned successfully!")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-background border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Staff Substitutions</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Manage Absentee Coverage</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full whitespace-nowrap">
            <RiCheckLine className="w-3 h-3 mr-1.5" />
            Covered
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 px-3 py-1 rounded-full whitespace-nowrap">
            <RiErrorWarningLine className="w-3 h-3 mr-1.5" />
            Urgent: Unassigned
          </Badge>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Scanning Attendance Records...</p>
          </div>
        ) : absentTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <RiCheckLine className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold">All Staff Present</h3>
            <p className="text-sm text-muted-foreground max-w-[240px]">No teacher absences reported for today. All lectures are covered.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Absent Teachers ({absentTeachers.length})</h2>
            
            <div className="space-y-4">
              {absentTeachers.map((teacher) => (
                <Card key={teacher.teacherId} className="p-5 rounded-3xl border-border/40 shadow-sm overflow-hidden relative">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{teacher.name}</h3>
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md inline-block mt-0.5">ON LEAVE</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Affected Lectures Today</p>
                    {teacher.affectedSlots.map((slot: any) => (
                      <div 
                        key={slot.timetableId}
                        onClick={() => fetchSubstitutes(slot)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-2xl border border-border/40 transition-all cursor-pointer",
                          slot.isCovered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30 hover:border-primary/40 hover:bg-background"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center font-black text-xs border border-border/20 shadow-sm">
                            {slot.lectureNo}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{slot.subject}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">{slot.class}</p>
                          </div>
                        </div>
                        {slot.isCovered ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-wider">
                            <RiCheckLine className="w-3 h-3" />
                            Covered
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-wider animate-pulse">
                            <RiUserSharedLine className="w-3 h-3" />
                            Assign
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Substitution Drawer/Modal Simulation */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-background rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black tracking-tight">Assign Substitute</h2>
                <p className="text-xs font-semibold text-muted-foreground mt-1">
                  Lecture {selectedSlot.lectureNo} • {selectedSlot.subject} • {selectedSlot.class}
                </p>
              </div>
              <button onClick={() => setSelectedSlot(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close</button>
            </div>

            <div className="space-y-6">
              {/* Role & Message */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Role</label>
                  <select 
                    value={assignmentData.role}
                    onChange={(e) => setAssignmentData({...assignmentData, role: e.target.value})}
                    className="w-full h-11 rounded-xl bg-muted/50 border border-border/40 px-3 text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all"
                  >
                    <option value="TEACHING">Full Teaching</option>
                    <option value="REVISION">Revision Only</option>
                    <option value="DISCIPLINE">Supervision</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Instructions</label>
                  <div className="relative">
                    <RiMessage2Line className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text"
                      placeholder="e.g., Cover Chapter 5"
                      value={assignmentData.message}
                      onChange={(e) => setAssignmentData({...assignmentData, message: e.target.value})}
                      className="w-full h-11 rounded-xl bg-muted/50 border border-border/40 pl-9 pr-3 text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>

              {/* Substitute List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Staff Today</h3>
                  {loadingSubs && <RiLoader4Line className="w-3 h-3 animate-spin text-primary" />}
                </div>
                
                <ScrollArea className="h-[300px] -mx-1 px-1">
                  <div className="space-y-2 pb-4">
                    {loadingSubs ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-muted/30 animate-pulse" />
                      ))
                    ) : availableSubs.length === 0 ? (
                      <div className="text-center py-10 bg-muted/20 rounded-3xl border border-dashed border-border/60">
                        <RiUserSearchLine className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs font-medium text-muted-foreground">No free teachers found for this slot.</p>
                      </div>
                    ) : (
                      availableSubs.map((sub) => (
                        <Card 
                          key={sub.id} 
                          className="p-3 rounded-2xl border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                {sub.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{sub.name}</p>
                                <p className="text-[10px] font-semibold text-muted-foreground">{sub.department || 'Academic Staff'}</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleAssign(sub.id)}
                              disabled={submitting}
                              className="rounded-xl font-bold text-[10px] h-8 px-4"
                            >
                              Assign
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
