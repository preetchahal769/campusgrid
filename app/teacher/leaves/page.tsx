"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setLeaveRequests, updateLeaveStatus } from "@/lib/store/slices/teacherSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarEventLine,
  RiUserLine,
  RiTimeLine,
  RiArrowUpLine,
  RiFilterLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'

const statusConfig = {
  PENDING:   { label: 'Pending',   style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',       dot: 'bg-amber-500'  },
  APPROVED:  { label: 'Approved',  style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
  REJECTED:  { label: 'Rejected',  style: 'bg-red-500/10 text-red-600 border-red-500/20',             dot: 'bg-red-500'    },
  ESCALATED: { label: 'Escalated', style: 'bg-purple-500/10 text-purple-600 border-purple-500/20',    dot: 'bg-purple-500' },
}

export default function TeacherLeavesPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { leaveRequests } = useAppSelector((state) => state.teacher)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<{ [id: string]: string }>({})
  const [filter, setFilter] = useState<StatusFilter>('ALL')

  const fetchLeaves = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/leaves')
      dispatch(setLeaveRequests(data))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [dispatch])

  const handleAction = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    setActioningId(leaveId)
    setActionError(prev => ({ ...prev, [leaveId]: '' }))
    try {
      await apiFetch(`/academics/leaves/${leaveId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      dispatch(updateLeaveStatus({ id: leaveId, status }))
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [leaveId]: err.message }))
    } finally {
      setActioningId(null)
    }
  }

  const filtered = filter === 'ALL'
    ? leaveRequests
    : leaveRequests.filter(l => l.status === filter)

  const sorted = [...filtered].sort((a, b) => {
    // PENDING and ESCALATED first
    const priority: Record<string, number> = { PENDING: 0, ESCALATED: 1, REJECTED: 2, APPROVED: 3 }
    return (priority[a.status] ?? 4) - (priority[b.status] ?? 4)
  })

  const counts = {
    ALL: leaveRequests.length,
    PENDING: leaveRequests.filter(l => l.status === 'PENDING').length,
    ESCALATED: leaveRequests.filter(l => l.status === 'ESCALATED').length,
    APPROVED: leaveRequests.filter(l => l.status === 'APPROVED').length,
    REJECTED: leaveRequests.filter(l => l.status === 'REJECTED').length,
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight">Leave Requests</h1>
          <p className="text-xs text-muted-foreground font-medium">Review and action your section's leaves</p>
        </div>
        {counts.PENDING > 0 && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-sm px-3">
            {counts.PENDING} Pending
          </Badge>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['ALL', 'PENDING', 'ESCALATED', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border",
                filter === tab
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-background/40 border-border/50 text-muted-foreground hover:border-primary/30"
              )}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              {counts[tab] > 0 && (
                <span className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black",
                  filter === tab ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {counts[tab]}
                </span>
              )}
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
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiCalendarEventLine className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="font-bold text-muted-foreground">No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}requests</p>
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
                  isEscalated && "border-purple-500/30",
                  isPending && "border-amber-500/20",
                )}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header: student + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                        <RiUserLine className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-black text-base leading-tight">
                          {leave.student?.users?.name ?? 'Unknown Student'}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("text-[10px] font-bold border shrink-0", cfg.style)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", cfg.dot)} />
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <RiCalendarEventLine className="w-4 h-4 text-primary/60 shrink-0" />
                    {format(parseISO(leave.startDate), 'MMM d')}
                    {leave.startDate !== leave.endDate && (
                      <> → {format(parseISO(leave.endDate ?? leave.startDate), 'MMM d, yyyy')}</>
                    )}
                    {leave.startDate === leave.endDate && (
                      <span className="text-muted-foreground font-medium">, {format(parseISO(leave.startDate), 'yyyy')}</span>
                    )}
                  </div>

                  {/* Reason */}
                  {leave.reason && (
                    <div className="bg-muted/30 rounded-2xl p-3.5 border border-border/30">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Reason</p>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">{leave.reason}</p>
                    </div>
                  )}

                  {/* Escalated Warning */}
                  {isEscalated && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <RiArrowUpLine className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-purple-600">
                        This leave has been escalated to the Principal. You can no longer modify it.
                      </p>
                    </div>
                  )}

                  {/* Action Error */}
                  {actionError[leave.id] && (
                    <p className="text-xs text-destructive font-semibold">{actionError[leave.id]}</p>
                  )}

                  {/* Action Buttons — only for PENDING */}
                  {isPending && (
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => handleAction(leave.id, 'REJECTED')}
                        disabled={isActioning}
                        className="flex-1 h-11 rounded-2xl border border-red-500/30 text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-[0.97] disabled:opacity-50"
                      >
                        {isActioning ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiCloseLine className="w-4 h-4" /> Reject</>}
                      </button>
                      <button
                        onClick={() => handleAction(leave.id, 'APPROVED')}
                        disabled={isActioning}
                        className="flex-1 h-11 rounded-2xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.97] shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {isActioning ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiCheckLine className="w-4 h-4" /> Approve</>}
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
