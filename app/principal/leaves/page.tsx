"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useSchoolInfo } from "@/hooks/useSchoolInfo"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckLine,
  RiCloseLine,
  RiCalendarEventLine,
  RiUserLine,
  RiErrorWarningLine,
  RiArrowUpLine,
  RiFilterLine,
  RiShieldCheckLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  student?: {
    users: {
      name: string
    }
    section: {
      name: string
      grade: {
        name: string
      }
    }
  }
  teacher?: {
    users: {
      name: string
    }
  }
}

const statusConfig = {
  PENDING:   { label: 'Pending',   style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',       dot: 'bg-amber-500'  },
  APPROVED:  { label: 'Approved',  style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
  REJECTED:  { label: 'Rejected',  style: 'bg-red-500/10 text-red-600 border-red-500/20',             dot: 'bg-red-500'    },
  ESCALATED: { label: 'Escalated', style: 'bg-purple-500/10 text-purple-600 border-purple-500/20',    dot: 'bg-purple-500' },
}

export default function PrincipalLeavesPage() {
  const router = useRouter()
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [filter, setFilter] = useState<LeaveStatus | 'ALL'>('ALL')

  const fetchLeaves = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/leaves')
      setLeaves(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleAction = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    setActioningId(leaveId)
    try {
      await apiFetch(`/academics/leaves/${leaveId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActioningId(null)
    }
  }

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter)
  
  // Sort: ESCALATED first, then PENDING
  const sorted = [...filtered].sort((a, b) => {
    const priority: Record<string, number> = { ESCALATED: 0, PENDING: 1, REJECTED: 2, APPROVED: 3 }
    return (priority[a.status] ?? 4) - (priority[b.status] ?? 4)
  })

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-orange-500/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight">Leave Appeals</h1>
          <p className="text-xs text-muted-foreground font-medium">Review and resolve student leave requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['ALL', 'ESCALATED', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border",
                filter === s
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                  : "bg-background/40 border-border/50 text-muted-foreground hover:border-orange-500/30"
              )}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
            {error}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
            <RiCalendarEventLine className="w-12 h-12 mb-4" />
            <p className="font-bold">No leave requests found</p>
          </div>
        ) : (
          sorted.map((leave, index) => {
            const cfg = statusConfig[leave.status]
            const isEscalated = leave.status === 'ESCALATED'
            const isPending = leave.status === 'PENDING'
            const isActioning = actioningId === leave.id

            return (
              <Card
                key={leave.id}
                className={cn(
                  "rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400",
                  isEscalated && "border-purple-500/30"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 font-bold text-primary">
                        {(leave.student?.users?.name || leave.teacher?.users?.name || "?")[0]}
                      </div>
                      <div>
                        <p className="font-black text-base leading-tight">
                          {leave.student?.users?.name || leave.teacher?.users?.name || "Unknown User"}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">
                          {leave.student?.section?.grade?.name ? `${leave.student.section.grade.name} - ${leave.student.section.name}` : "Staff/Other"}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("text-[10px] font-bold border shrink-0", cfg.style)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", cfg.dot)} />
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground/80 bg-muted/30 p-3 rounded-xl">
                    <RiCalendarEventLine className="w-4 h-4 text-primary" />
                    {format(parseISO(leave.startDate), 'MMM d')}
                    {leave.startDate !== leave.endDate && (
                      <> → {format(parseISO(leave.endDate), 'MMM d, yyyy')}</>
                    )}
                    {leave.startDate === leave.endDate && (
                      <span className="text-muted-foreground font-medium">, {format(parseISO(leave.startDate), 'yyyy')}</span>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Reason</p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed px-1">
                      {leave.reason || "No reason provided"}
                    </p>
                  </div>

                  {/* Escalated Label */}
                  {isEscalated && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-purple-600">
                      <RiArrowUpLine className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-bold uppercase tracking-wider">High Priority Appeal</p>
                    </div>
                  )}

                  {/* Actions (Only for PENDING or ESCALATED) */}
                  {(isPending || isEscalated) && (
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => handleAction(leave.id, 'REJECTED')}
                        disabled={isActioning}
                        className="flex-1 h-11 rounded-2xl border border-red-500/30 text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isActioning ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiCloseLine className="w-4 h-4" /> Reject</>}
                      </button>
                      <button
                        onClick={() => handleAction(leave.id, 'APPROVED')}
                        disabled={isActioning}
                        className="flex-1 h-11 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isActioning ? <RiLoader4Line className="w-6 h-6 animate-spin" /> : <><RiCheckLine className="w-4 h-4" /> Approve</>}
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
