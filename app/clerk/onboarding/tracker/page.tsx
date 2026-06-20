"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import {
  RiUserAddLine,
  RiArrowLeftLine,
  RiRefreshLine,
  RiCheckDoubleLine,
  RiMailSendLine,
  RiErrorWarningLine,
  RiTimeLine,
  RiLoader4Line
} from "@remixicon/react"

interface DispatchLog {
  id: string
  recipientPhone: string
  studentName: string
  username: string
  status: "QUEUED" | "SENT" | "FAILED"
  attempts: number
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export default function ClerkDispatchTracker() {
  const [logs, setLogs] = useState<DispatchLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLogs = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await apiFetch("/onboarding/dispatches")
      setLogs(data)
    } catch (err: any) {
      console.error("Failed to fetch dispatch logs", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // Poll every 10 seconds for real-time queue updates
    const interval = setInterval(() => {
      fetchLogs(true)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Calculate metrics
  const total = logs.length
  const sent = logs.filter((l) => l.status === "SENT").length
  const queued = logs.filter((l) => l.status === "QUEUED").length
  const failed = logs.filter((l) => l.status === "FAILED").length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Navigation and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clerk/onboarding"
            className="w-10 h-10 rounded-xl border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-colors text-zinc-600"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Credential Dispatch Tracker</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Monitor SMS credentials delivery queue status and API dispatches.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <RiRefreshLine className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Queue"}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
        <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Dispatched</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-zinc-900">{total}</span>
          </div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <RiCheckDoubleLine className="w-4 h-4 text-emerald-600" />
            Delivered
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-900">{sent}</span>
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <RiTimeLine className="w-4 h-4 text-amber-600" />
            Queued
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-900">{queued}</span>
          </div>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <RiErrorWarningLine className="w-4 h-4 text-rose-600" />
            Failed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-rose-900">{failed}</span>
          </div>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 flex items-center gap-2">
          <RiMailSendLine className="w-5 h-5 text-violet-600" />
          SMS Queue Dispatch Logs
        </h3>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm font-medium">
            <RiLoader4Line className="w-8 h-8 animate-spin text-violet-600" />
            Fetching dispatch queue state...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground text-sm font-medium">
            No notification dispatches found. Dispatches are queued when the Principal approves an onboarding batch.
          </div>
        ) : (
          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3.5">Student Name</th>
                    <th className="px-5 py-3.5">Recipient Phone</th>
                    <th className="px-5 py-3.5">Generated Username</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Attempts</th>
                    <th className="px-5 py-3.5">Last Status/Error</th>
                    <th className="px-5 py-3.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-zinc-100 last:border-none text-xs font-semibold hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-zinc-900">{l.studentName}</td>
                      <td className="px-5 py-4 text-zinc-600">{l.recipientPhone}</td>
                      <td className="px-5 py-4 font-mono text-violet-600 font-bold">{l.username}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            l.status === "SENT"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                              : l.status === "QUEUED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                              : "bg-rose-50 text-rose-700 border border-rose-200/50"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              l.status === "SENT"
                                ? "bg-emerald-500"
                                : l.status === "QUEUED"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-zinc-700">{l.attempts}</td>
                      <td className="px-5 py-4 max-w-[200px] truncate text-muted-foreground">
                        {l.status === "FAILED" ? (
                          <span className="text-rose-600 font-medium">{l.errorMessage || "Unknown dispatch failure"}</span>
                        ) : l.status === "SENT" ? (
                          <span className="text-emerald-700 font-medium">Delivered to Carrier Gateway</span>
                        ) : (
                          "Pending in Queue Worker"
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
