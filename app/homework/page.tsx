"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setAssignments, Assignment } from "@/lib/store/slices/studentSlice"
import { apiFetch, getImageUrl } from "@/lib/api"
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
  RiInformationLine,
  RiFilter2Line,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"

interface AssignmentDetail extends Assignment {
  attachments?: {
    id: string
    fileurl: string
    filetype: string
    filename: string
  }[]
}

export default function HomeworkPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { assignments } = useAppSelector((state) => state.student)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Submission dialog state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [viewDetailId, setViewDetailId] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<AssignmentDetail | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'OVERDUE'>('ALL')

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
      const formData = new FormData()
      formData.append('content', content)
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      await apiFetch(`/academics/assignments/${selectedId}/submit`, {
        method: 'POST',
        body: formData,
      })
      
      // Refresh assignments to get updated isSubmitted status
      const data = await apiFetch('/academics/assignments')
      dispatch(setAssignments(data))
      
      setSelectedId(null)
      setContent("")
      setSelectedFiles([])
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDetail = async (id: string) => {
    setIsOpening(true)
    try {
      const data = await apiFetch(`/academics/assignments/${id}`)
      setDetailData(data)
      setViewDetailId(id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsOpening(false)
    }
  }

  const filteredAssignments = assignments.filter(a => {
    if (activeFilter === 'ALL') return true
    if (activeFilter === 'SUBMITTED') return a.isSubmitted
    const isOverdue = isPast(new Date(a.dueDate))
    if (activeFilter === 'OVERDUE') return !a.isSubmitted && isOverdue
    if (activeFilter === 'PENDING') return !a.isSubmitted && !isOverdue
    return true
  })

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
      </div>

      {/* Filters */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {([
            { id: 'ALL', label: 'All', count: assignments.length },
            { id: 'PENDING', label: 'Pending', count: assignments.filter(a => !a.isSubmitted && !isPast(new Date(a.dueDate))).length },
            { id: 'SUBMITTED', label: 'Submitted', count: assignments.filter(a => a.isSubmitted).length },
            { id: 'OVERDUE', label: 'Overdue', count: assignments.filter(a => !a.isSubmitted && isPast(new Date(a.dueDate))).length },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                activeFilter === f.id 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/60"
              )}
            >
              {f.label} <span className="opacity-40 ml-1">{f.count}</span>
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
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiBookOpenLine className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-semibold">No assignments yet</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiFilter2Line className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-semibold">No {activeFilter.toLowerCase()} assignments</p>
            <Button variant="ghost" size="sm" onClick={() => setActiveFilter('ALL')} className="text-xs font-bold text-primary">Clear Filter</Button>
          </div>
        ) : (
          filteredAssignments.map((assignment, index) => {
            const due = getDueBadge(assignment.dueDate)
            return (
              <Card
                key={assignment.id}
                className={cn(
                  "rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden transition-all",
                  "animate-in fade-in slide-in-from-bottom-4 duration-500",
                  assignment.isSubmitted && "opacity-60 grayscale-[30%]"
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div 
                  className="absolute top-4 right-4 p-2 hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                  onClick={() => handleOpenDetail(assignment.id)}
                >
                  <RiInformationLine className="w-5 h-5 text-primary/60 hover:text-primary" />
                </div>
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
                    {assignment.isSubmitted ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-black uppercase tracking-wider">
                          <RiCheckLine className="w-4 h-4" />
                          {assignment.submission?.status || 'Submitted'}
                        </div>
                        {assignment.submission?.submittedAt && (
                          <p className="text-[9px] font-bold text-muted-foreground/60">
                            {format(new Date(assignment.submission.submittedAt), 'MMM d, h:mm a')}
                          </p>
                        )}
                        {assignment.submission?.attachments && assignment.submission.attachments.length > 0 && (
                          <div className="flex gap-1.5 mt-1">
                            {assignment.submission.attachments.map((att, i) => (
                              <a 
                                key={i} 
                                href={getImageUrl(att.fileurl)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                                title={att.filename}
                              >
                                <RiFileLine className="w-3.5 h-3.5" />
                              </a>
                            ))}
                          </div>
                        )}
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

               {/* File Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiUploadLine className="w-3.5 h-3.5" /> Work Documents <span className="font-normal opacity-60">(Multiple)</span>
                </label>
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/60 rounded-2xl bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <RiUploadLine className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-1 transition-colors" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Files</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      onChange={e => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files))
                        }
                      }}
                    />
                  </label>

                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-bold text-primary">
                          <RiFileLine className="w-3 h-3" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="hover:text-rose-500 transition-colors"
                          >
                            <RiCloseCircleLine className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* Detail Modal */}
      {viewDetailId && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setViewDetailId(null)} />
          <Card className="relative w-full max-w-lg rounded-3xl border-border/50 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <RiBookOpenLine className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-lg font-black leading-tight">{detailData.title}</h2>
                  <Badge className="mt-2 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                    {detailData.subject.name}
                  </Badge>
                </div>
                <button onClick={() => setViewDetailId(null)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                  <RiCloseCircleLine className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instructions</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                    {detailData.description}
                  </p>
                </div>

                {detailData.attachments && detailData.attachments.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resources ({detailData.attachments.length})</p>
                    <div className="grid grid-cols-1 gap-2">
                      {detailData.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={getImageUrl(att.fileurl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40 hover:border-primary/30 hover:bg-muted/60 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <RiFileLine className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black truncate group-hover:text-primary transition-colors">{att.filename}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">{att.filetype}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                    {detailData.maxMarks}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Max Marks</p>
                </div>
                {!detailData.isSubmitted && (
                  <Button 
                    size="sm" 
                    onClick={() => { setViewDetailId(null); setSelectedId(detailData.id) }}
                    className="rounded-xl font-bold text-xs h-9"
                  >
                    Start Submission
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Opening Overlay */}
      {isOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
          <RiLoader4Line className="w-10 h-10 animate-spin text-primary opacity-50" />
        </div>
      )}
    </div>
  )
}
