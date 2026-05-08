"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setAssignments } from "@/lib/store/slices/studentSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiBookOpenLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiTimeLine,
  RiCheckLine,
  RiUploadLine,
  RiFileLine,
  RiLinksLine,
  RiCloseCircleLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"

export default function HomeworkPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { assignments } = useAppSelector((state) => state.student)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Submission dialog state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch('/academics/assignments')
        dispatch(setAssignments(data))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [dispatch])

  const getDueBadge = (dueDate: string) => {
    const date = new Date(dueDate)
    if (isPast(date)) return { label: "Overdue", style: "bg-red-500/10 text-red-600 border-red-500/20" }
    if (isToday(date)) return { label: "Due Today", style: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
    if (isTomorrow(date)) return { label: "Due Tomorrow", style: "bg-orange-500/10 text-orange-600 border-orange-500/20" }
    return { label: `Due ${formatDistanceToNow(date, { addSuffix: true })}`, style: "bg-muted text-muted-foreground border-border/50" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await apiFetch(`/academics/assignments/${selectedId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ content, fileUrl }),
      })
      setSubmitted(prev => new Set(prev).add(selectedId))
      setSelectedId(null)
      setContent("")
      setFileUrl("")
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedAssignment = assignments.find(a => a.id === selectedId)

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Decorative bg */}
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Homework</h1>
          <p className="text-xs text-muted-foreground font-medium">All assigned tasks for your section</p>
        </div>
        {assignments.length > 0 && (
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 font-bold text-sm px-3">
            {assignments.length}
          </Badge>
        )}
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
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiBookOpenLine className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-semibold">No assignments yet</p>
          </div>
        ) : (
          assignments.map((assignment, index) => {
            const due = getDueBadge(assignment.dueDate)
            const isDone = submitted.has(assignment.id)
            return (
              <Card
                key={assignment.id}
                className={cn(
                  "rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden transition-all",
                  "animate-in fade-in slide-in-from-bottom-4 duration-500",
                  isDone && "opacity-60 grayscale-[30%]"
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Subject + Due */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-wider">
                      {assignment.subject.name}
                    </Badge>
                    <Badge className={cn("font-bold text-[10px] border", due.style)}>
                      {due.label}
                    </Badge>
                  </div>

                  {/* Title + Desc */}
                  <div className="space-y-1.5">
                    <h3 className="font-black text-base leading-tight">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-2">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/30 gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <RiTimeLine className="w-3.5 h-3.5" />
                      {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                      <span className="opacity-40">·</span>
                      Max {assignment.maxMarks} marks
                    </div>
                    {isDone ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                        <RiCheckLine className="w-4 h-4" />
                        Submitted
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedId(assignment.id)}
                        className="h-8 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 shadow-md shadow-primary/20"
                      >
                        <RiUploadLine className="w-3.5 h-3.5 mr-1.5" />
                        Submit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Submit Modal */}
      {selectedId && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          />

          {/* Sheet */}
          <div className="relative w-full max-w-lg bg-background border border-border/50 rounded-3xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Submitting</p>
                <h3 className="font-black text-lg leading-tight">{selectedAssignment.title}</h3>
                <p className="text-xs text-muted-foreground font-medium">{selectedAssignment.subject.name}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              >
                <RiCloseCircleLine className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Answer Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiFileLine className="w-3.5 h-3.5" /> Your Answer
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your answer or notes here..."
                  rows={4}
                  className="w-full rounded-2xl bg-muted/40 border border-border/50 p-4 text-sm font-medium resize-none focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                />
              </div>

              {/* File URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiLinksLine className="w-3.5 h-3.5" /> File URL <span className="font-normal opacity-60">(optional)</span>
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
                />
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                  <RiErrorWarningLine className="w-4 h-4 shrink-0 mt-0.5" />
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full h-13 rounded-2xl font-bold text-base shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <RiLoader4Line className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <RiCheckLine className="w-5 h-5 mr-2" />
                    Submit Assignment
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
