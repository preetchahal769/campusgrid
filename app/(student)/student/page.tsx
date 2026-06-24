"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { 
  setLoading, 
  setProfile, 
  setBroadcasts, 
  setTimetable, 
  setAttendance,
  setError
} from "@/lib/store/slices/studentSlice"
import { logout } from "@/lib/store/slices/authSlice"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"

const GET_STUDENT_PROFILE = gql`
  query GetStudentProfile {
    studentProfile {
      id
      rollNumber
      rankingPoints
      users {
        id
        name
        email
        phoneNo
        globalRating
      }
      section {
        id
        name
        grade {
          id
          name
        }
      }
      todayAttendance
    }
  }
`

const GET_STUDENT_BROADCASTS = gql`
  query GetStudentBroadcasts {
    studentBroadcasts {
      id
    }
  }
`

// Icons
import { LayoutDashboard, FileText, Calendar, Clock } from "lucide-react"

// Dashboard Layout Primitives
import { DashboardLayout, INDIGO } from "@/components/layout/DashboardLayout"

import dynamic from "next/dynamic"

// Tab Components (Lazy loaded)
const DashboardTab = dynamic(() => import("@/components/student/DashboardTab").then(mod => mod.DashboardTab), { ssr: false })
const HomeworkTab = dynamic(() => import("@/components/student/HomeworkTab").then(mod => mod.HomeworkTab), { ssr: false })
const TimetableTab = dynamic(() => import("@/components/student/TimetableTab").then(mod => mod.TimetableTab), { ssr: false })
const AttendanceTab = dynamic(() => import("@/components/student/AttendanceTab").then(mod => mod.AttendanceTab), { ssr: false })
const NoticesTab = dynamic(() => import("@/components/student/NoticesTab").then(mod => mod.NoticesTab), { ssr: false })
const FeesTab = dynamic(() => import("@/components/student/FeesTab").then(mod => mod.FeesTab), { ssr: false })
const PerformanceTab = dynamic(() => import("@/components/student/PerformanceTab").then(mod => mod.PerformanceTab), { ssr: false })
const ProfileTab = dynamic(() => import("@/components/student/ProfileTab").then(mod => mod.ProfileTab), { ssr: false })


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
  const { profile } = useAppSelector((state) => state.student)

  const { data: profileData, loading: profileLoading } = useQuery<any>(GET_STUDENT_PROFILE, {
    skip: !user || user.role !== 'STUDENT',
  })

  const { data: broadcastsData } = useQuery<any>(GET_STUDENT_BROADCASTS, {
    skip: !user || user.role !== 'STUDENT',
  })

  const broadcasts = broadcastsData?.studentBroadcasts || []
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<string>("dashboard")

  useEffect(() => {
    if (profileData?.studentProfile) {
      dispatch(setProfile(profileData.studentProfile))
    }
  }, [profileData, dispatch])

  useEffect(() => {
    dispatch(setLoading(profileLoading))
  }, [profileLoading, dispatch])

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
    }
  }, [user, router])

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
      unreadCount={broadcasts.length}
      hasProfile={true}
      onLogout={handleLogout}
    >
      {tab === "dashboard" && (
        <DashboardTab
          profile={profile}
          setTab={setTab}
        />
      )}

      {tab === "homework" && <HomeworkTab />}

      {tab === "timetable" && <TimetableTab />}

      {tab === "attendance" && <AttendanceTab />}

      {tab === "notices" && <NoticesTab />}

      {tab === "fees" && <FeesTab />}

      {tab === "performance" && <PerformanceTab profile={profile} />}

      {tab === "profile" && <ProfileTab profile={profile} user={user} />}
    </DashboardLayout>
  )
}
