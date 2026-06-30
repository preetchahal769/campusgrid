"use client"

import { CheckCircle2, TrendingUp, AlertCircle, DollarSign, ChevronRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { StatCard, SectionCard, Badge, ORANGE, INDIGO } from "@/components/layout/DashboardLayout"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    studentHomework {
      id
      title
      dueDate
      maxMarks
      subject {
        name
      }
      isSubmitted
    }
    studentAttendance(range: "monthly") {
      days {
        date
        status
      }
      stats {
        percentage
      }
    }
    studentTimetable(sectionId: "me") {
      id
      dayOfWeek
      startTime
      endTime
      lectureNo
      teachersubjectsection {
        subject {
          name
        }
      }
    }
    studentBroadcasts {
      id
      title
      message
    }
  }
`

interface DashboardTabProps {
  profile: any
  setTab: (tab: string) => void
}

export function DashboardTab({
  profile,
  setTab,
}: DashboardTabProps) {
  const { data, loading } = useQuery<any>(GET_DASHBOARD_DATA)

  const assignments = data?.studentHomework || []
  const attendanceData = data?.studentAttendance
  const timetable = data?.studentTimetable || []
  const broadcasts = data?.studentBroadcasts || []

  const attendance = attendanceData?.days || []
  const pendingHomeworkCount = assignments.filter((a: any) => !a.isSubmitted).length

  // Real attendance % computed from Redux state for dashboard monthly summary
  const filteredAttendance = attendance.filter((a: any) => {
    const d = new Date(a.date)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    if (d > todayEnd) return false // Ignore any future dates returned by backend seeds
    
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalDays = filteredAttendance.length
  const presentDays = filteredAttendance.filter((a: any) => a.status === 'PRESENT').length
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  const hasChartData = filteredAttendance.length > 0 && filteredAttendance.some((a: any) => a.status === 'PRESENT' || a.status === 'LEAVE')
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="cursor-pointer" onClick={() => setTab("attendance")}>
          <StatCard label="Attendance" value={`${attendancePct}%`} sub="This month" color="#10b981" bg="#f0fdf4" icon={CheckCircle2} />
        </div>
        <div className="cursor-pointer" onClick={() => setTab("performance")}>
          <StatCard label="GPA" value={profile?.users?.globalRating ? (profile.users.globalRating / 10).toFixed(1) : "0.0"} sub="Out of 10" color={INDIGO} bg="#eef0fd" icon={TrendingUp} />
        </div>
        <div className="cursor-pointer" onClick={() => setTab("homework")}>
          <StatCard label="Homework due" value={String(pendingHomeworkCount)} sub="This week" color="#f59e0b" bg="#fffbeb" icon={AlertCircle} />
        </div>
        <div className="cursor-pointer" onClick={() => setTab("fees")}>
          <StatCard label="Fees" value="—" sub="Not loaded" color={ORANGE} bg="#fdf2ec" icon={DollarSign} />
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-3 md:gap-4">
        {/* Upcoming Homework */}
        <SectionCard title="Upcoming Homework" action={
          <button onClick={() => setTab("homework")} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: ORANGE }}>
            All <ChevronRight size={12} />
          </button>
        }>
          <div className="h-44 overflow-y-auto pr-1">
            {assignments.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-500 text-center">No homework assigned</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignments.slice(0, 4).map((hw: any, i: number) => {
                  const isSubmitted = hw.isSubmitted
                  const isOverdue = !isSubmitted && new Date(hw.dueDate) < new Date()
                  const statusText = isSubmitted ? "Submitted" : isOverdue ? "Overdue" : "Pending"
                  const statusVariant = isSubmitted ? "green" : isOverdue ? "red" : "amber"
                  const borderBg = isSubmitted ? "#10b981" : isOverdue ? "#ef4444" : "#f59e0b"

                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: borderBg }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{hw.title}</p>
                        <p className="text-xs text-gray-500">{hw.subject?.name || "Subject"} · Due {new Date(hw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <Badge text={statusText} variant={statusVariant} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Today's Schedule */}
        <SectionCard title="Today's Schedule" action={
          <button onClick={() => setTab("timetable")} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: ORANGE }}>
            Full <ChevronRight size={12} />
          </button>
        }>
          <div className="h-44 overflow-y-auto pr-1">
            {timetable && Array.isArray(timetable) && timetable.length > 0 ? (
              <div className="space-y-2">
                {timetable
                  .filter(t => t.dayOfWeek.toUpperCase() === ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getDay()])
                  .sort((a, b) => a.lectureNo - b.lectureNo)
                  .map((cls, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <span className="text-xs font-mono text-gray-500 w-10 flex-shrink-0">{cls.startTime?.substring(0, 5)}</span>
                      <div className="flex-1 bg-muted/40 rounded-xl px-3 py-2">
                        <p className="text-xs font-bold text-gray-900">{cls.teachersubjectsection?.subject?.name || "Lecture"}</p>
                        <p className="text-[10px] text-gray-500">Classroom</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-500 text-center">No classes scheduled today</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Notices */}
        <SectionCard title="Notices" action={
          broadcasts.length > 0 ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{broadcasts.length} new</span>
          ) : undefined
        }>
          <div className="h-44 overflow-y-auto pr-1">
            {broadcasts.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-500 text-center">No new notices</p>
              </div>
            ) : (
              <div className="space-y-3">
                {broadcasts.slice(0, 3).map((n: any, i: number) => (
                  <div key={i} className="flex gap-2.5 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                    <div>
                      <p className="text-xs leading-snug font-semibold text-gray-900">{n.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Bottom split section: Attendance Trend (full-width on tablet, 2/3 on desktop) + Pedagogical Widgets (side-by-side on tablet, 1/3 on desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4">
        {/* Column 1: Attendance Trend */}
        <div className="xl:col-span-2">
          <SectionCard title="Attendance Trend" action={
            <span className="text-xs font-semibold text-gray-500">
              {presentDays}/{totalDays || 0} days
            </span>
          }>
            <div className="h-40">
              {!hasChartData ? (
                <div className="h-full flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-gray-900">No data available yet</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Attendance trend will appear once marked</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredAttendance.length > 0 ? filteredAttendance.map((a: any) => ({ day: new Date(a.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), pct: a.status === 'PRESENT' ? 100 : a.status === 'LEAVE' ? 50 : 0 })) : []} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={INDIGO} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={INDIGO} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[-10, 110]} ticks={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={20} />
                    <Tooltip 
                      cursor={{ stroke: INDIGO, strokeWidth: 1, strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="pct" stroke={INDIGO} strokeWidth={2.5} fill="url(#attendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Column 2: Pedagogical & Collaboration Widgets */}
        <div className="col-span-1 xl:col-span-1 grid grid-cols-1 gap-3 md:gap-4">
          {/* Learning Journal Card */}
          <SectionCard title="Learning Journal">
            <div className="space-y-2">
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                How can you apply one concept you learned in Mathematics today to a real-world scenario?
              </p>
              <textarea
                placeholder="Write your reflection..."
                rows={2}
                className="w-full border border-border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] bg-muted/20 resize-none placeholder:text-gray-400"
              />
              <button className="w-full bg-[#6366f1] text-white font-bold py-2 rounded-xl text-xs hover:bg-[#5356e0] active:scale-[0.98] transition-all">
                Save Reflection
              </button>
            </div>
          </SectionCard>

          {/* Community Pulse Panel */}
          <SectionCard title="Community Pulse">
            <div className="space-y-2.5">
              {[
                { name: "Rahul Sharma", action: "shared a study note in Physics", time: "10m ago" },
                { name: "Neha Verma", action: "asked a query in Computer Sc.", time: "1h ago" },
              ].map((act, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-gray-900">{act.name}</span>{" "}
                    <span className="text-gray-500">{act.action}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-2">{act.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
