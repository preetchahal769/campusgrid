"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import {
  RiUserAddLine,
  RiMailSendLine,
  RiDatabaseLine,
  RiLineChartLine,
  RiInboxArchiveLine,
  RiLoader4Line,
  RiGraduationCapLine
} from "@remixicon/react"

interface BatchStats {
  totalBatches: number
  totalRecords: number
}

export default function ClerkDashboard() {
  const [stats, setStats] = useState<BatchStats>({ totalBatches: 0, totalRecords: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const batches = await apiFetch("/onboarding/batches")
        const recordCount = batches.reduce((acc: number, b: any) => acc + b.recordCount, 0)
        setStats({
          totalBatches: batches.length,
          totalRecords: recordCount
        })
      } catch (err) {
        console.error("Failed to load clerk stats", err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-600/10 via-purple-500/5 to-transparent border border-violet-600/20 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
          <RiInboxArchiveLine className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Clerk Operations Center</h1>
          <p className="text-sm font-medium text-muted-foreground">
            SikshaTantar Administrative Workspace — DEC & Staged Data Operations
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <RiLoader4Line className="w-8 h-8 animate-spin text-violet-600" />
          Loading workspace indicators...
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <RiDatabaseLine className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Staged Batches</span>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">{stats.totalBatches}</h3>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <RiUserAddLine className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Staged Profiles</span>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">{stats.totalRecords}</h3>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <RiLineChartLine className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Queue Health</span>
                <h3 className="text-2xl font-black tracking-tight text-emerald-600 mt-0.5">Active</h3>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">Workspace Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/clerk/register-student"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-violet-600/30 hover:bg-violet-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center transition-all text-violet-600">
                  <RiUserAddLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">New Admission</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Admit new students individually and configure their profiles.</p>
                </div>
              </Link>

              <Link
                href="/clerk/create-grade"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-violet-600/30 hover:bg-violet-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center transition-all text-violet-600">
                  <RiGraduationCapLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Class & Sections setup</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Define new academic classes and auto-generate their sections.</p>
                </div>
              </Link>

              <Link
                href="/clerk/onboarding"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-violet-600/30 hover:bg-violet-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center transition-all text-violet-600">
                  <RiUserAddLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Batch Ingestion staging</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload JSON lists of students for principal check verification.</p>
                </div>
              </Link>

              <Link
                href="/clerk/onboarding/tracker"
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 hover:border-violet-600/30 hover:bg-violet-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center transition-all text-violet-600">
                  <RiMailSendLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">SMS dispatch tracker</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Monitor welcome credentials SMS queues and API delivery outcomes.</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
