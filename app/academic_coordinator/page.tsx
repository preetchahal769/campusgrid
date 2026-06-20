"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import {
  RiBookOpenLine,
  RiTimeLine,
  RiCalendarEventLine,
  RiUserSettingsLine,
  RiSlideshowLine,
  RiLoader4Line
} from "@remixicon/react"

interface CoordStats {
  grades: number
  sections: number
  subjects: number
}

export default function AcademicCoordinatorDashboard() {
  const [stats, setStats] = useState<CoordStats>({ grades: 0, sections: 0, subjects: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [gradesData, sectionsData, subjectsData] = await Promise.all([
          apiFetch("/academics/grades").catch(() => []),
          apiFetch("/academics/sections").catch(() => []),
          apiFetch("/academics/subjects").catch(() => [])
        ])
        setStats({
          grades: Array.isArray(gradesData) ? gradesData.length : 0,
          sections: Array.isArray(sectionsData) ? sectionsData.length : 0,
          subjects: Array.isArray(subjectsData) ? subjectsData.length : 0
        })
      } catch (err) {
        console.error("Failed to fetch coordinator stats", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 via-indigo-500/5 to-transparent border border-blue-600/20 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
          <RiBookOpenLine className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Academic Coordinator Workspace</h1>
          <p className="text-sm font-medium text-muted-foreground">
            SikshaTantar Academics & Scheduling — Track Timetables, Subjects, and Exams
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <RiLoader4Line className="w-8 h-8 animate-spin text-blue-600" />
          Loading workspace indicators...
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <RiSlideshowLine className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Grades</span>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">{stats.grades}</h3>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <RiUserSettingsLine className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sections</span>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">{stats.sections}</h3>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <RiBookOpenLine className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Curricular Subjects</span>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">{stats.subjects}</h3>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">Workspace Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/principal/create-grade"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-blue-600/30 hover:bg-blue-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all text-blue-600">
                  <RiSlideshowLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Class & Grade settings</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Define academic grades and coordinate student groups.</p>
                </div>
              </Link>

              <Link
                href="/principal/create-section"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-blue-600/30 hover:bg-blue-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all text-blue-600">
                  <RiUserSettingsLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Section management</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage section segments and link student operational units.</p>
                </div>
              </Link>

              <Link
                href="/principal/timetable"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-blue-600/30 hover:bg-blue-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all text-blue-600">
                  <RiTimeLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Timetable matrix builder</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Configure schedule slots, assign lectures, and resolve overlaps.</p>
                </div>
              </Link>

              <Link
                href="/principal/exams"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-blue-600/30 hover:bg-blue-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all text-blue-600">
                  <RiCalendarEventLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Exams & schedules</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Organize school examinations, grading rules, and release calendars.</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
