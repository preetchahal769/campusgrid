"use client"

import { useState } from "react"
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { cn } from "@/lib/utils"

interface AttendanceItem {
  date: string
  status: "PRESENT" | "ABSENT" | "LEAVE"
}

interface AttendanceTabProps {
  attendance: AttendanceItem[]
}

export function AttendanceTab({ attendance }: AttendanceTabProps) {
  const [timeframe, setTimeframe] = useState<"month" | "year">("month")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Filter attendance records by the selected timeframe
  const filteredAttendance = attendance.filter(a => {
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

  const totalDays = filteredAttendance.length
  const presentDays = filteredAttendance.filter(a => a.status === "PRESENT").length
  const leaveDays = filteredAttendance.filter(a => a.status === "LEAVE").length
  const absentDays = totalDays - presentDays - leaveDays
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Today Banner */}
      <div className="bg-[#e6fcf1] border border-[#a7f3d0] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#a7f3d0] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[#05b672]" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-900 leading-snug">Today — Present</h3>
            <p className="text-sm text-[#05b672] font-semibold mt-0.5">Marked by class teacher · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="bg-[#a7f3d0] px-3 py-1 rounded-full text-xs font-bold text-[#05b672]">
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
              if (timeframe === "month") setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              else setSelectedDate(prev => new Date(prev.getFullYear() - 1, 0, 1))
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
              if (timeframe === "month") setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              else setSelectedDate(prev => new Date(prev.getFullYear() + 1, 0, 1))
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
                 
                 const mData = filteredAttendance.filter(a => {
                   const d = new Date(a.date)
                   return d >= start && d <= end
                 })
                 weeks.push({
                   date: `W${i}`,
                   status: mData.filter(a => a.status === 'PRESENT').length
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
               const record = attendance.find(a => {
                 const ad = new Date(a.date);
                 return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
               })
               const isToday = d.toDateString() === today.toDateString()
               const isFuture = d > today
               
               let className = "h-12 sm:h-14 flex items-center justify-center rounded-2xl transition-colors "
               if (isToday && record) {
                 className += "bg-[#05b672] text-white"
               } else if (isFuture) {
                 className += "text-gray-400"
               } else if (record) {
                 if (record.status === 'PRESENT') className += "bg-green-50 text-green-700"
                 else if (record.status === 'LEAVE') className += "bg-amber-50 text-amber-600"
                 else className += "bg-red-50 text-red-500"
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
