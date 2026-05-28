"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch, getImageUrl } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiBookOpenLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckLine,
  RiTimeLine,
  RiGroupLine,
  RiFileLine,
  RiCloseCircleLine,
  RiExternalLinkLine,
  RiInformationLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Attachment {
  id?: string
  fileurl: string
  filename: string
  filetype?: string
}

interface Section {
  name: string
  grade: {
    name: string
  }
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxMarks: number
  subject: {
    name: string
  }
  section?: Section
  _count?: {
    submissions: number
  }
  attachments?: Attachment[]
}

interface Submission {
  id: string
  status: string
  content?: string
  submittedAt?: string
  attachments?: Attachment[]
  student?: {
    users?: { name: string }
    user?: { name: string }
    name?: string
  }
  user?: { name: string }
  name?: string
  studentProfile?: {
    users?: { name: string }
    name?: string
  }
  studentId?: string
}

export default function TeacherHomeworkPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detail / Submissions Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)
  const [viewMode, setViewMode] = useState<'DETAILS' | 'SUBMISSIONS'>('DETAILS')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would be a teacher-specific endpoint or filtered
      const data = await apiFetch('/academics/assignments')
      setAssignments(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAssignment = async (id: string) => {
    setIsLoadingSubmissions(true)
    setViewMode('DETAILS')
    try {
      const [details, subs] = await Promise.all([
        apiFetch(`/academics/assignments/${id}`),
        apiFetch(`/academics/assignments/${id}/submissions`)
      ])
      setSelectedAssignment(details)
      setSubmissions(subs)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoadingSubmissions(false)
    }
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
        <div>
          <h1 className="text-xl font-black tracking-tight">Manage Homework</h1>
          <p className="text-xs text-muted-foreground font-medium">Track submissions and resources</p>
        </div>
        <Button 
          size="sm"
          onClick={() => router.push('/teacher/create-assignment')}
          className="ml-auto rounded-xl font-bold text-xs h-9 bg-primary shadow-lg shadow-primary/20"
        >
          New
        </Button>
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
            <p className="text-muted-foreground font-semibold">No assignments created yet</p>
            <Button variant="outline" onClick={() => router.push('/teacher/create-assignment')}>
              Create your first one
            </Button>
          </div>
        ) : (
          assignments.map((assignment, index) => (
            <Card
              key={assignment.id}
              onClick={() => handleViewAssignment(assignment.id)}
              className={cn(
                "rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]",
                "animate-in fade-in slide-in-from-bottom-4 duration-500",
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-wider">
                    {assignment.subject.name}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                    <RiTimeLine className="w-3.5 h-3.5" />
                    Due {format(new Date(assignment.dueDate), 'MMM d')}
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-base leading-tight">{assignment.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Section: {assignment.section?.grade?.name} {assignment.section?.name}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <RiGroupLine className="w-3.5 h-3.5 text-primary/60" />
                      <span className="text-[10px] font-black">{assignment._count?.submissions || 0} Submissions</span>
                    </div>
                  </div>
                  <RiExternalLinkLine className="w-4 h-4 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assignment Detail & Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setSelectedAssignment(null)} />
          <Card className="relative w-full max-w-2xl rounded-[2.5rem] border-border/50 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em]">
                    Assignment Portal
                  </Badge>
                  <h2 className="text-2xl font-black tracking-tight">{selectedAssignment.title}</h2>
                  <p className="text-sm text-muted-foreground font-medium">
                    {selectedAssignment.subject.name} • {selectedAssignment.section?.grade?.name} {selectedAssignment.section?.name}
                  </p>
                </div>
                <button onClick={() => setSelectedAssignment(null)} className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                  <RiCloseCircleLine className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-muted/40 rounded-2xl">
                <button
                  onClick={() => setViewMode('DETAILS')}
                  className={cn(
                    "flex-1 h-10 rounded-xl text-xs font-black transition-all",
                    viewMode === 'DETAILS' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setViewMode('SUBMISSIONS')}
                  className={cn(
                    "flex-1 h-10 rounded-xl text-xs font-black transition-all relative",
                    viewMode === 'SUBMISSIONS' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Submissions
                  {submissions.length > 0 && (
                    <span className="absolute top-1 right-2 w-4 h-4 bg-primary text-white text-[8px] rounded-full flex items-center justify-center">
                      {submissions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
                {viewMode === 'DETAILS' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <RiInformationLine className="w-3.5 h-3.5" /> Description
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedAssignment.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Due Date</p>
                        <p className="text-sm font-black">{format(new Date(selectedAssignment.dueDate), 'PPP')}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Max Marks</p>
                        <p className="text-sm font-black">{selectedAssignment.maxMarks} Points</p>
                      </div>
                    </div>

                    {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resources ({selectedAssignment.attachments.length})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedAssignment.attachments.map((att: Attachment) => (
                            <a
                              key={att.id}
                              href={getImageUrl(att.fileurl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-2xl bg-background border border-border/40 hover:border-primary/30 transition-all group shadow-sm"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <RiFileLine className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black truncate group-hover:text-primary transition-colors">{att.filename}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Resource</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                        <RiGroupLine className="w-12 h-12 mb-2" />
                        <p className="font-bold">No submissions yet</p>
                      </div>
                    ) : (
                      submissions.map((sub) => (
                        <Card key={sub.id} className="rounded-2xl border-border/40 bg-muted/20 overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {(() => {
                                  const name = sub.student?.users?.name || 
                                               sub.student?.user?.name || 
                                               sub.student?.name || 
                                               sub.user?.name || 
                                               sub.name || 
                                               sub.studentProfile?.users?.name || 
                                               sub.studentProfile?.name;
                                  const displayName = name || (sub.studentId ? `Student #${sub.studentId}` : 'Unknown Student');
                                  
                                  return (
                                    <>
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                                        {displayName[0]}
                                      </div>
                                      <div>
                                        <h4 className="font-black text-sm">{displayName}</h4>
                                        <p className="text-[10px] font-bold text-muted-foreground">
                                          {sub.submittedAt ? format(new Date(sub.submittedAt), 'MMM d, h:mm a') : 'Unknown Date'}
                                        </p>
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black uppercase">
                                {sub.status}
                              </Badge>
                            </div>

                            {sub.content && (
                              <div className="mt-3 p-3 rounded-xl bg-background/50 text-[11px] font-medium text-muted-foreground border border-border/30">
                                {sub.content}
                              </div>
                            )}

                            {sub.attachments && sub.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {sub.attachments.map((att: Attachment, i: number) => (
                                  <a
                                    key={i}
                                    href={getImageUrl(att.fileurl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-background border border-border/40 hover:border-primary/40 text-[9px] font-bold transition-all"
                                  >
                                    <RiFileLine className="w-3 h-3 text-primary" />
                                    <span className="max-w-[100px] truncate">{att.filename}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Opening Overlay */}
      {isLoadingSubmissions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
          <RiLoader4Line className="w-10 h-10 animate-spin text-primary opacity-50" />
        </div>
      )}
    </div>
  )
}
