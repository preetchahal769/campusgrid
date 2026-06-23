"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { 
  setLoading, 
  setProfile, 
  setAssignments, 
  setBroadcasts, 
  setTimetable, 
  setAttendance,
  setError
} from "@/lib/store/slices/studentSlice"
import { logout } from "@/lib/store/slices/authSlice"

// Icons
import { LayoutDashboard, FileText, Calendar, Clock } from "lucide-react"

// Dashboard Layout Primitives
import { DashboardLayout, INDIGO } from "@/components/layout/DashboardLayout"

// Tab Components
import { DashboardTab } from "@/components/student/DashboardTab"
import { HomeworkTab } from "@/components/student/HomeworkTab"
import { TimetableTab } from "@/components/student/TimetableTab"
import { AttendanceTab } from "@/components/student/AttendanceTab"
import { NoticesTab } from "@/components/student/NoticesTab"
import { FeesTab } from "@/components/student/FeesTab"
import { PerformanceTab } from "@/components/student/PerformanceTab"
import { ProfileTab } from "@/components/student/ProfileTab"

const NAV = [
  { id: "dashboard",  icon: LayoutDashboard, label: "Dashboard"  },
  { id: "homework",   icon: FileText,        label: "Homework"   },
  { id: "timetable",  icon: Calendar,        label: "Timetable"  },
  { id: "attendance", icon: Clock,           label: "Attendance" },
]

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { profile, assignments, broadcasts, timetable, attendance } = useAppSelector((state) => state.student)
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<string>("dashboard")
  
  // Real attendance % computed from Redux state for dashboard monthly summary
  const filteredAttendanceForHeader = attendance.filter(a => {
    const d = new Date(a.date)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    if (d > todayEnd) return false // Ignore any future dates returned by backend seeds
    
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalDays = filteredAttendanceForHeader.length
  const presentDays = filteredAttendanceForHeader.filter(a => a.status === 'PRESENT').length
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  
  // Homework due count (unsubmitted homework)
  const pendingHomeworkCount = assignments.filter(a => !a.isSubmitted).length

  const fullName = profile?.users?.name || user?.name || "Student"
  const firstName = fullName.split(' ')[0]

  // Formatted Current Date
  const [currentDateStr, setCurrentDateStr] = useState("")
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const now = new Date()
    const dayName = days[now.getDay()]
    const dateNum = now.getDate()
    const monthName = months[now.getMonth()]
    const year = now.getFullYear()
    setCurrentDateStr(`${dayName}, ${dateNum} ${monthName} ${year}`)
  }, [])

  useEffect(() => {
    setMounted(true)
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
        if (profileData) {
          dispatch(setProfile(profileData))
        }
        dispatch(setAssignments(assignmentsData?.length ? assignmentsData : []))
        dispatch(setBroadcasts(broadcastsData?.length ? broadcastsData : []))
        dispatch(setTimetable(timetableData?.length ? timetableData : []))
        dispatch(setAttendance(attendanceData?.days?.length ? attendanceData.days : []))
      } catch (err: any) {
        console.warn("API failed.", err)
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchData()
  }, [dispatch])

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" })
    } catch (e) {
      console.warn("Logout failed", e)
    }
    dispatch(logout())
    router.push("/login")
  }

  if (!mounted) return null
  if (user && user.role !== 'STUDENT') return null

  return (
    <DashboardLayout
      user={{ name: fullName, sub: profile?.rollNumber ? `Roll No: ${profile.rollNumber}` : (user?.email || ""), avatar: firstName.substring(0, 2).toUpperCase() }}
      role="Student" roleColor={INDIGO} roleBg="#eef0fd"
      navItems={NAV} activeId={tab} onNav={setTab}
      greeting={`Good morning, ${firstName} 👋`}
      subline={`Class ${profile?.section?.grade?.name || "11"} — ${profile?.section?.name || "Science (A)"} · ${currentDateStr}`}
      unreadCount={broadcasts.length || 2}
      hasProfile={true}
      onLogout={handleLogout}
    >
      {tab === "dashboard" && (
        <DashboardTab
          attendancePct={attendancePct}
          profile={profile}
          pendingHomeworkCount={pendingHomeworkCount}
          assignments={assignments}
          timetable={timetable}
          broadcasts={broadcasts}
          filteredAttendance={filteredAttendanceForHeader}
          presentDays={presentDays}
          totalDays={totalDays}
          setTab={setTab}
        />
      )}

      {tab === "homework" && <HomeworkTab assignments={assignments} />}

      {tab === "timetable" && <TimetableTab timetable={timetable} />}

      {tab === "attendance" && <AttendanceTab attendance={attendance} />}

      {tab === "notices" && <NoticesTab broadcasts={broadcasts} />}

      {tab === "fees" && <FeesTab />}

      {tab === "performance" && <PerformanceTab profile={profile} />}

      {tab === "profile" && <ProfileTab profile={profile} user={user} />}
    </DashboardLayout>
  )
}
