"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { apiFetch, getImageUrl } from "@/lib/api"
import { 
  setLoading, 
  setProfile, 
  setAssignments, 
  setBroadcasts, 
  setTimetable, 
  setAttendance,
  setError 
} from "@/lib/store/slices/studentSlice"
import { 
  RiNotification3Line, 
  RiCalendarEventLine, 
  RiBookOpenLine, 
  RiPulseLine, 
  RiSearchLine,
  RiArrowRightSLine,
  RiDashboard3Line,
  RiFocus2Line,
  RiChatSmile3Line,
  RiUserLine,
  RiCheckLine,
} from "@remixicon/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WelcomeBoard } from "@/components/ui/welcome-board"
import { cn } from "@/lib/utils"

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { profile, assignments, broadcasts, attendance, isLoading } = useAppSelector((state) => state.student)
  const [mounted, setMounted] = useState(false)
  
  // Real attendance % computed from Redux state
  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null
  
  // Profile name is the real student name from /students/me
  // Fall back to auth user name from login response, then generic
  const fullName = profile?.users?.name || user?.name || "Student"
  const firstName = fullName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"

  useEffect(() => {
    setMounted(true)
    // Role-based protection
    if (user && user.role !== 'STUDENT') {
      router.replace(`/${user.role.toLowerCase()}`)
      return
    }

    const fetchData = async () => {
      dispatch(setLoading(true))
      try {
        const [profileData, assignmentsData, broadcastsData, timetableData, attendanceData] = await Promise.all([
          apiFetch('/students/me'),
          apiFetch('/academics/assignments'),
          apiFetch('/communications/broadcasts'),
          apiFetch('/academics/timetable/section/me').catch(async () => {
            const p = await apiFetch('/students/me')
            return apiFetch(`/academics/timetable/section/${p.section.id}`)
          }),
          apiFetch('/attendance/me'),
        ])

        dispatch(setProfile(profileData))
        dispatch(setAssignments(assignmentsData))
        dispatch(setBroadcasts(broadcastsData))
        dispatch(setTimetable(timetableData))
        dispatch(setAttendance(attendanceData))
      } catch (err: any) {
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchData()
  }, [dispatch])

  if (!mounted) return null
  if (user && user.role !== 'STUDENT') return null

  return (
    <div className="relative overflow-x-hidden min-h-full pb-10 z-0">
      {/* Blue Sweeping Header Background */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      <main className="px-5 md:px-8 pt-6 space-y-8">
        {/* School Updates Banner */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-sm font-bold text-white mb-3 px-1">School Updates</h2>
          <WelcomeBoard 
            title="Exam Date"
            subtitle="Your exam start date is 10 Aug 2025"
            illustrationSrc="/student-illustration.png"
          />
        </section>

        {/* Academics Grid (3 Column) */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mt-8">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 px-1">Academics</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { label: 'Homework', icon: RiBookOpenLine, route: '/homework', color: 'text-[#FA5D5D]', bg: 'bg-[#FA5D5D]/10' },
              { label: 'Attendance', icon: RiCheckLine, route: '/attendance', color: 'text-[#6FCA72]', bg: 'bg-[#6FCA72]/10' },
              { label: 'Time Table', icon: RiCalendarEventLine, route: '/timetable', color: 'text-[#FDB543]', bg: 'bg-[#FDB543]/10' },
              { label: 'Notices', icon: RiNotification3Line, route: '/notices', color: 'text-[#45A3F5]', bg: 'bg-[#45A3F5]/10' },
              { label: 'Profile', icon: RiUserLine, route: '/profile', color: 'text-[#825CD6]', bg: 'bg-[#825CD6]/10' },
              { label: 'Performance', icon: RiPulseLine, route: '/performance', color: 'text-[#FA5D5D]', bg: 'bg-[#FA5D5D]/10' },
            ].map(({ label, icon: Icon, route, color, bg }) => (
              <Card
                key={label}
                className="cursor-pointer hover:shadow-md transition-all rounded-3xl border border-zinc-100 shadow-sm aspect-square flex flex-col items-center justify-center p-3 relative group"
                onClick={() => router.push(route)}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", bg, color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-[11px] md:text-sm text-center text-zinc-700 leading-tight">{label}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Assignments Learning Track */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <RiBookOpenLine className="w-5 h-5 text-primary" />
              Homework
            </h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/homework')} className="text-xs font-bold text-primary gap-1">
              View All <RiArrowRightSLine className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {assignments.length === 0 ? (
              [1, 2].map((i) => (
                <div key={i} className="min-w-[280px] h-40 rounded-3xl bg-muted/30 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground animate-pulse">
                  <span className="text-xs font-bold italic opacity-30">Loading assignments...</span>
                </div>
              ))
            ) : (
              assignments.map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className={cn(
                    "min-w-[280px] rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/20 hover:border-primary/40 transition-all overflow-hidden group",
                    assignment.isSubmitted && "opacity-60 grayscale-[30%]"
                  )}
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-full px-3 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter">
                          {assignment.subject.name}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {assignment.isSubmitted ? "Completed" : "Due in 2 days"}
                        </span>
                      </div>
                      <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                        {assignment.title}
                      </h4>
                    </div>
                    <Button 
                      variant={assignment.isSubmitted ? "outline" : "default"}
                      onClick={() => router.push('/homework')}
                      className={cn(
                        "w-full mt-4 rounded-xl font-bold text-xs h-10 transition-all",
                        assignment.isSubmitted ? "border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5" : "shadow-md shadow-primary/20"
                      )}
                    >
                      {assignment.isSubmitted ? (
                        <>
                          <RiCheckLine className="w-4 h-4 mr-1.5" />
                          Submitted
                        </>
                      ) : (
                        "Submit Work"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
