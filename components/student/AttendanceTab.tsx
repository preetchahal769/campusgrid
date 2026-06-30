"use client"

import { useState } from "react"
import { CheckCircle2, ChevronLeft, ChevronRight, XCircle, AlertCircle, Calendar as CalendarIcon, Clock } from "lucide-react"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { cn } from "@/lib/utils"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"

const GET_STUDENT_ATTENDANCE = gql`
  query GetStudentAttendance($range: String, $month: Int, $year: Int) {
    studentAttendance(range: $range, month: $month, year: $year) {
      days {
        date
        status
        title
      }
      stats {
        present
        absent
        leave
        holiday
        unmarked
        percentage
      }
    }
  }
`

interface AttendanceItem {
  date: string
  status: "PRESENT" | "ABSENT" | "LEAVE" | "HOLIDAY" | "UNMARKED"
  title?: string
}

export function AttendanceTab() {
  const { data, loading: isLoading, error } = useQuery<any>(GET_STUDENT_ATTENDANCE)
  const attendanceData = data?.studentAttendance
  const attendance = attendanceData?.days || []
  const [timeframe, setTimeframe] = useState<"month" | "year">("month")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-2xl p-4 h-20 animate-pulse" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-border h-64 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm font-semibold text-red-500">Failed to load attendance record.</p>
      </div>
    )
  }

  // Filter attendance records by the selected timeframe
  const filteredAttendance = attendance.filter((a: AttendanceItem) => {
    const d = new Date(a.date)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    if (d > todayEnd) return false // Ignore future dates

    if (timeframe === "month") {
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
    } else {
      return d.getFullYear() === selectedDate.getFullYear()
    }
  })

  const presentDays = filteredAttendance.filter((a: AttendanceItem) => a.status === "PRESENT").length
  const absentDays = filteredAttendance.filter((a: AttendanceItem) => a.status === "ABSENT").length
  const leaveDays = filteredAttendance.filter((a: AttendanceItem) => a.status === "LEAVE").length
  const holidayDays = filteredAttendance.filter((a: AttendanceItem) => a.status === "HOLIDAY").length
  const unmarkedDays = filteredAttendance.filter((a: AttendanceItem) => a.status === "UNMARKED").length
  
  const workingDays = presentDays + absentDays
  const hasChartData = filteredAttendance.length > 0 && filteredAttendance.some((a: AttendanceItem) => a.status === "PRESENT" || a.status === "LEAVE")
  const attendancePct = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 100

  // Today dynamic status
  const today = new Date()
  const todayRecord = attendance.find((a: AttendanceItem) => {
    const ad = new Date(a.date)
    return ad.getDate() === today.getDate() && ad.getMonth() === today.getMonth() && ad.getFullYear() === today.getFullYear()
  })

  const todayStatus = todayRecord?.status || "UNMARKED"

  let bannerBg = "bg-gray-50 border-gray-200"
  let bannerIconBg = "bg-gray-100"
  let bannerIconColor = "text-gray-500"
  let bannerTitle = "Today — Not Marked"
  let bannerSubline = "Attendance has not been marked for today yet"
  let bannerBadgeBg = "bg-gray-200/80 text-gray-600"
  let BannerIcon = Clock

  if (todayStatus === "PRESENT") {
    bannerBg = "bg-[#e6fcf1] border-[#a7f3d0]"
    bannerIconBg = "bg-[#a7f3d0]"
    bannerIconColor = "text-[#05b672]"
    bannerTitle = "Today — Present"
    bannerSubline = "Marked by class teacher"
    bannerBadgeBg = "bg-[#a7f3d0] text-[#05b672]"
    BannerIcon = CheckCircle2
  } else if (todayStatus === "ABSENT") {
    bannerBg = "bg-red-50 border-red-200"
    bannerIconBg = "bg-red-100"
    bannerIconColor = "text-red-600"
    bannerTitle = "Today — Absent"
    bannerSubline = "Marked by class teacher"
    bannerBadgeBg = "bg-red-100 text-red-600"
    BannerIcon = XCircle
  } else if (todayStatus === "LEAVE") {
    bannerBg = "bg-amber-50 border-amber-200"
    bannerIconBg = "bg-amber-100"
    bannerIconColor = "text-amber-600"
    bannerTitle = "Today — On Leave"
    bannerSubline = "Approved leave"
    bannerBadgeBg = "bg-amber-100 text-amber-600"
    BannerIcon = AlertCircle
  } else if (todayStatus === "HOLIDAY") {
    bannerBg = "bg-blue-50 border-blue-200"
    bannerIconBg = "bg-blue-100"
    bannerIconColor = "text-blue-600"
    bannerTitle = "Today — Holiday"
    bannerSubline = todayRecord?.title ? `School Holiday: ${todayRecord.title}` : "School Holiday"
    bannerBadgeBg = "bg-blue-100 text-blue-600"
    BannerIcon = CalendarIcon
  }

  return (
    <div className="space-y-4">
      {/* Today Banner */}
      <div className={cn("border rounded-2xl p-4 flex items-center justify-between transition-colors", bannerBg)}>
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", bannerIconBg)}>
            <BannerIcon className={cn("w-6 h-6", bannerIconColor)} />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-900 leading-snug">{bannerTitle}</h3>
            <p className={cn("text-sm font-semibold mt-0.5", todayStatus === "UNMARKED" ? "text-gray-500" : bannerIconColor)}>
              {bannerSubline} · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-xs font-bold transition-colors", bannerBadgeBg)}>
          Read-only
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-border py-6 text-center shadow-sm">
          <p className="text-3xl font-black text-gray-900">{attendancePct}%</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">Overall</p>
        </div>
        <div className="bg-white rounded-2xl border border-border py-6 text-center shadow-sm">
          <p className="text-3xl font-black text-[#05b672]">{presentDays}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">Present</p>
        </div>
        <div className="bg-white rounded-2xl border border-border py-6 text-center shadow-sm">
          <p className="text-3xl font-black text-amber-500">{leaveDays}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">Leave</p>
        </div>
        <div className="bg-white rounded-2xl border border-border py-6 text-center shadow-sm">
          <p className="text-3xl font-black text-red-600">{absentDays}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">Absent</p>
        </div>
      </div>

      {/* Timeframe & Month Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl border border-border p-4 shadow-sm gap-4">
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setTimeframe("month")} className={cn("px-4 py-1.5 text-sm font-bold rounded-lg transition-colors", timeframe === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}>Monthly</button>
          <button onClick={() => setTimeframe("year")} className={cn("px-4 py-1.5 text-sm font-bold rounded-lg transition-colors", timeframe === "year" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}>Yearly</button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (timeframe === "month") setSelectedDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              else setSelectedDate((prev: Date) => new Date(prev.getFullYear() - 1, 0, 1))
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 min-w-[140px] text-center">
            {timeframe === "month" ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : selectedDate.getFullYear().toString()}
          </h2>
          <button 
            onClick={() => {
              if (timeframe === "month") setSelectedDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              else setSelectedDate((prev: Date) => new Date(prev.getFullYear() + 1, 0, 1))
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[15px] text-gray-900">
            {timeframe === "month" ? selectedDate.toLocaleDateString('en-US', { month: 'long' }) : selectedDate.getFullYear()} trend
          </h2>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#6366f1]"></div> Days Present (per week)</div>
          </div>
        </div>
        <div className="h-48 w-full -ml-4">
          {!hasChartData ? (
            <div className="h-full flex flex-col items-center justify-center py-4 text-center ml-4">
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
              <AreaChart data={(() => {
                const year = selectedDate.getFullYear()
                const month = selectedDate.getMonth()
                const weeks = []
                
                let start = timeframe === "month" ? new Date(year, month, 1) : new Date(year, 0, 1)
                while (start.getDay() !== 1) start.setDate(start.getDate() - 1)
                
                let i = 1;
                while (true) {
                   const end = new Date(start)
                   end.setDate(start.getDate() + 6)
                   end.setHours(23,59,59,999)
                   
                   if (timeframe === "month" && (start.getMonth() > month || start.getFullYear() > year)) break;
                   if (timeframe === "year" && start.getFullYear() > year) break;
                   
                   const mData = filteredAttendance.filter((a: AttendanceItem) => {
                     const d = new Date(a.date)
                     return d >= start && d <= end
                   })
                   weeks.push({
                     date: `W${i}`,
                     status: mData.filter((a: any) => a.status === 'PRESENT').length
                   })
                   start.setDate(start.getDate() + 7)
                   i++
                }
                return weeks
              })()}>
                <defs>
                  <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" minTickGap={20} />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                  formatter={(value) => [`${value} Days Present`, "Total"]}
                />
                <ReferenceLine y={6} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />
                <Area type="monotone" dataKey="status" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStatus)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[15px] text-gray-900">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#05b672]"></div> Present</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Leave</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</div>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 mb-4">
           <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
        </div>
        
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 sm:gap-x-2 text-center text-sm font-bold">
           {(() => {
             const today = new Date()
             const currentMonth = selectedDate.getMonth()
             const currentYear = selectedDate.getFullYear()
             const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
             const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
             const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
             
             const cells = []
             for (let i = 0; i < startOffset; i++) {
               cells.push(<div key={`empty-${i}`} className="h-12 sm:h-14"></div>)
             }
             
             for (let i = 1; i <= daysInMonth; i++) {
               const d = new Date(currentYear, currentMonth, i)
               const record = attendance.find((a: AttendanceItem) => {
                 const ad = new Date(a.date);
                 return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
               })
               const isToday = d.toDateString() === today.toDateString()
               const isFuture = d > today
               
               let className = "h-12 sm:h-14 flex items-center justify-center rounded-2xl transition-colors "
               
               if (isToday) {
                 className += "ring-2 ring-indigo-500 ring-offset-2 "
                 if (record?.status === 'PRESENT') {
                   className += "bg-[#05b672] text-white"
                 } else if (record?.status === 'LEAVE') {
                   className += "bg-amber-500 text-white"
                 } else if (record?.status === 'ABSENT') {
                   className += "bg-red-500 text-white"
                 } else if (record?.status === 'HOLIDAY') {
                   className += "bg-blue-500 text-white"
                 } else {
                   className += "bg-gray-100 text-gray-700 border-2 border-dashed border-gray-300"
                 }
               } else if (isFuture) {
                 className += "text-gray-400"
               } else if (record) {
                 if (record.status === 'PRESENT') className += "bg-green-50 text-green-700"
                 else if (record.status === 'LEAVE') className += "bg-amber-50 text-amber-600"
                 else if (record.status === 'HOLIDAY') className += "bg-blue-50 text-blue-600"
                 else if (record.status === 'ABSENT') className += "bg-red-50 text-red-500"
                 else className += "text-gray-400" // UNMARKED
               } else {
                 className += "text-gray-400"
               }
               
               cells.push(<div key={i} className={className}>{i}</div>)
             }
             return cells
           })()}
        </div>
      </div>
    </div>
  )
}
