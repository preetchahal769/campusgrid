"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"

const GET_STUDENT_TIMETABLE = gql`
  query GetStudentTimetable {
    studentTimetable(sectionId: "me") {
      id
      dayOfWeek
      startTime
      endTime
      lectureNo
      room
      studioRoom {
        roomName
      }
      teachersubjectsection {
        subject {
          name
        }
        teachers {
          users {
            name
          }
        }
      }
    }
  }
`

interface TimetableItem {
  dayOfWeek: string
  startTime: string
  endTime: string
  lectureNo: number
  room?: string
  teachersubjectsection?: {
    subject?: {
      name: string
    }
    teachers?: {
      users?: {
        name: string
      }
    }
  }
}

export function TimetableTab() {
  const { data, loading: isLoading, error } = useQuery<any>(GET_STUDENT_TIMETABLE)
  const timetable = data?.studentTimetable || []
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(today) ? today : 'Mon'
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-10 w-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border p-4 h-16 animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-10 bg-gray-200 rounded-full" />
                <div className="w-16 h-8 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm font-semibold text-red-500">Failed to load timetable.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
          const isSelected = selectedDay === day
          const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'short' })
          return (
            <button 
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold flex flex-col items-center justify-center min-w-[60px] transition-colors relative", 
                isSelected ? "bg-[#c84b1a] text-white" : "bg-white border border-border text-gray-900 hover:bg-gray-50"
              )}
            >
              {day}
              {isToday && !isSelected && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#c84b1a]" />}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {(() => {
          const daysSchedule = timetable
            .filter((t: any) => t.dayOfWeek.toUpperCase() === selectedDay.toUpperCase() || t.dayOfWeek === selectedDay)
            .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''))

          if (daysSchedule.length === 0) {
            return (
              <div className="bg-white rounded-2xl border border-border p-8 text-center">
                <p className="text-sm font-semibold text-gray-500">No classes scheduled for {selectedDay}</p>
              </div>
            )
          }

          return (
            <>
              <p className="text-xs text-gray-500 px-1">{daysSchedule.length} periods</p>
              {daysSchedule.map((cls: any, i: number) => {
                const nextCls = daysSchedule[i + 1]
                let breakDuration = null
                if (nextCls) {
                  const end = new Date(`1970/01/01 ${cls.endTime}`)
                  const start = new Date(`1970/01/01 ${nextCls.startTime}`)
                  if (start > end) {
                    breakDuration = `${cls.endTime.substring(0, 5)}-${nextCls.startTime.substring(0, 5)}`
                  }
                }

                const subject = cls.teachersubjectsection?.subject?.name || "Subject"
                let color = "#10b981"
                let badgeColor = "bg-green-50 text-green-600"
                if (subject.includes("Chem")) { color = "#f59e0b"; badgeColor = "bg-amber-50 text-amber-600" }
                else if (subject.includes("Phys")) { color = "#3b82f6"; badgeColor = "bg-blue-50 text-blue-600" }
                else if (subject.includes("Math")) { color = "#8b5cf6"; badgeColor = "bg-purple-50 text-purple-600" }

                return (
                  <div key={i} className="space-y-3">
                    <div className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="flex-shrink-0 text-center w-12">
                          <p className="text-[13px] font-black text-gray-900">{cls.startTime?.substring(0, 5)}</p>
                          <p className="text-[10px] font-bold text-gray-500 mt-0.5">{cls.endTime?.substring(0, 5)}</p>
                        </div>
                        <div className="ml-2">
                          <p className="text-[15px] font-bold text-gray-900 leading-tight">{subject}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{cls.teachersubjectsection?.teachers?.users?.name || "TBA"}</p>
                        </div>
                      </div>
                      {cls.room && (
                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold", badgeColor)}>
                          {cls.room}
                        </div>
                      )}
                    </div>
                    
                    {breakDuration && (
                      <div className="flex items-center gap-4 py-1 px-2">
                        <p className="text-xs font-mono font-semibold text-gray-400">{breakDuration}</p>
                        <div className="flex-1 h-px bg-border"></div>
                        <p className="text-xs font-bold text-gray-400">Break</p>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )
        })()}
      </div>
    </div>
  )
}
