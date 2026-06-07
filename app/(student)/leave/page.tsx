"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setLeaves } from "@/lib/store/slices/studentSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiAddLine,
  RiCalendarEventLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCloseCircleLine,
  RiCheckLine,
  RiAlertLine,
  RiTimeLine,
  RiArrowUpLine,
  RiFileTextLine,
  RiLinksLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

const statusConfig = {
  PENDING:   { label: 'Pending',   style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',     icon: RiTimeLine },
  APPROVED:  { label: 'Approved',  style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: RiCheckLine },
  REJECTED:  { label: 'Rejected',  style: 'bg-red-500/10 text-red-600 border-red-500/20',           icon: RiCloseCircleLine },
  ESCALATED: { label: 'Escalated', style: 'bg-purple-500/10 text-purple-600 border-purple-500/20',  icon: RiArrowUpLine },
}

export default function LeavePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { leaves } = useAppSelector((state) => state.student)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [escalatingId, setEscalatingId] = useState<string | null>(null)

  // Form state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchLeaves = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/leaves')
      dispatch(setLeaves(data))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [dispatch])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) {
      setSubmitError("Please fill in all required fields")
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await apiFetch('/academics/leaves', {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
          attachmentUrl: attachmentUrl || undefined,
        }),
      })
      setShowForm(false)
      setStartDate("")
      setEndDate("")
      setReason("")
      setAttachmentUrl("")
      await fetchLeaves()
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEscalate = async (leaveId: string) => {
    setEscalatingId(leaveId)
    try {
      await apiFetch(`/academics/leaves/${leaveId}/escalate`, { method: 'POST' })
      await fetchLeaves()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEscalatingId(null)
    }
  }

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length

  return (
    <div className="min-h-screen pb-10 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight text-white">Leave Management</h1>
          <p className="text-xs text-white/70 font-medium">Apply and track your leave requests</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSubmitError(null) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#0A4EA6] font-bold text-sm shadow-lg shadow-black/10 hover:bg-white/90 active:scale-95 transition-all"
        >
          <RiAddLine className="w-4 h-4" />
          Apply
        </button>
      </div>

      {/* Stats Row */}
      <div className="px-5 mb-6 relative z-10">
        <div className="grid grid-cols-4 gap-3 bg-background/80 backdrop-blur-md p-3 rounded-3xl border border-border/50 shadow-sm">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED'] as const).map((status) => {
            const count = leaves.filter(l => l.status === status).length
            const cfg = statusConfig[status]
            return (
              <div key={status} className={cn("rounded-2xl p-3 border text-center space-y-1", cfg.style)}>
                <p className="text-lg font-black">{count}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{cfg.label}</p>
              </div>
            )
          })}
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
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiCalendarEventLine className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-bold text-muted-foreground">No leave requests yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Tap Apply to submit your first request</p>
            </div>
          </div>
        ) : (
          leaves
            .slice()
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((leave, index) => {
              const cfg = statusConfig[leave.status] ?? statusConfig.PENDING
              const StatusIcon = cfg.icon
              return (
                <Card
                  key={leave.id}
                  className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn("text-[10px] font-bold border flex items-center gap-1", cfg.style)}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold mt-2">
                          <RiCalendarEventLine className="w-4 h-4 text-primary/60" />
                          {format(parseISO(leave.startDate), 'MMM d')}
                          {leave.startDate !== leave.endDate && (
                            <> → {format(parseISO(leave.endDate), 'MMM d, yyyy')}</>
                          )}
                          {leave.startDate === leave.endDate && (
                            <span className="text-muted-foreground font-medium">, {format(parseISO(leave.startDate), 'yyyy')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reason</p>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">{leave.reason}</p>
                    </div>

                    {/* Attachment */}
                    {leave.attachmentUrl && (
                      <a
                        href={leave.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                      >
                        <RiLinksLine className="w-3.5 h-3.5" />
                        View Attachment
                      </a>
                    )}

                    {/* Escalate Button for REJECTED */}
                    {leave.status === 'REJECTED' && (
                      <div className="pt-1 border-t border-border/30">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-3">
                          <RiAlertLine className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-xs font-semibold text-red-600">Leave rejected by teacher. You can appeal to the Principal.</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEscalate(leave.id)}
                          disabled={escalatingId === leave.id}
                          className="w-full h-10 rounded-xl border-purple-500/30 text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-500 font-bold text-xs transition-all"
                        >
                          {escalatingId === leave.id ? (
                            <RiLoader4Line className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <RiArrowUpLine className="w-3.5 h-3.5 mr-1.5" />
                              Escalate to Principal
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
        )}
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-background border border-border/50 rounded-3xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">Apply for Leave</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Fill in your leave details below</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <RiCloseCircleLine className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate}
                    required
                    className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiFileTextLine className="w-3.5 h-3.5" /> Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Medical appointment, family emergency..."
                  rows={3}
                  required
                  className="w-full rounded-2xl bg-muted/40 border border-border/50 p-4 text-sm font-medium resize-none focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                />
              </div>

              {/* Attachment URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiLinksLine className="w-3.5 h-3.5" /> Attachment URL <span className="font-normal opacity-50">(optional)</span>
                </label>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={e => setAttachmentUrl(e.target.value)}
                  placeholder="https://example.com/doctor-note.jpg"
                  className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                />
              </div>

              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                  <RiErrorWarningLine className="w-4 h-4 shrink-0 mt-0.5" />
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <RiLoader4Line className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <RiCheckLine className="w-5 h-5 mr-2" />
                    Submit Leave Request
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
