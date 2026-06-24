"use client"

import { useState } from "react"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { Assignment } from "@/lib/store/slices/studentSlice"
import { Badge } from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"
import { X, UploadCloud, CheckCircle2, AlertCircle, Download, FileText } from "lucide-react"

const GET_STUDENT_HOMEWORK = gql`
  query GetStudentHomework {
    studentHomework {
      id
      title
      description
      dueDate
      maxMarks
      subject {
        name
        code
      }
      teachers {
        users {
          name
        }
      }
      isSubmitted
      submission {
        id
        status
        submittedAt
        obtainedMarks
        fileUrl
      }
    }
  }
`

export function HomeworkTab() {
  const { data, loading: isLoading, error } = useQuery<any>(GET_STUDENT_HOMEWORK)
  const assignments = data?.studentHomework || []
  const [homeworkFilter, setHomeworkFilter] = useState<"All" | "Pending" | "Submitted" | "Overdue">("All")
  const [selectedHomework, setSelectedHomework] = useState<Assignment | null>(null)
  const [viewingAttachment, setViewingAttachment] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 w-24 bg-gray-200 rounded-full" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border p-4 h-24 animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-red-500">Failed to load homework assignments.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setHomeworkFilter('All')} className={cn("px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shrink-0 transition-colors", homeworkFilter === 'All' ? "bg-[#c84b1a] text-white" : "bg-white border border-border text-gray-900 hover:bg-gray-50")}>All <span className="bg-black/10 px-1.5 rounded-full text-xs">{assignments.length}</span></button>
        <button onClick={() => setHomeworkFilter('Pending')} className={cn("px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shrink-0 transition-colors", homeworkFilter === 'Pending' ? "bg-[#c84b1a] text-white" : "bg-white border border-border text-gray-900 hover:bg-gray-50")}>Pending <span className="bg-black/10 px-1.5 rounded-full text-xs">{assignments.filter((a: any) => !a.isSubmitted && new Date(a.dueDate) >= new Date()).length}</span></button>
        <button onClick={() => setHomeworkFilter('Submitted')} className={cn("px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shrink-0 transition-colors", homeworkFilter === 'Submitted' ? "bg-[#c84b1a] text-white" : "bg-white border border-border text-gray-900 hover:bg-gray-50")}>Submitted <span className="bg-black/10 px-1.5 rounded-full text-xs">{assignments.filter((a: any) => a.isSubmitted).length}</span></button>
        <button onClick={() => setHomeworkFilter('Overdue')} className={cn("px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shrink-0 transition-colors", homeworkFilter === 'Overdue' ? "bg-[#c84b1a] text-white" : "bg-white border border-border text-gray-900 hover:bg-gray-50")}>Overdue <span className="bg-black/10 px-1.5 rounded-full text-xs">{assignments.filter((a: any) => !a.isSubmitted && new Date(a.dueDate) < new Date()).length}</span></button>
      </div>

      <div className="space-y-3">
        {assignments.filter((hw: any) => {
          const isSubmitted = hw.isSubmitted
          const isOverdue = !isSubmitted && new Date(hw.dueDate) < new Date()
          if (homeworkFilter === 'Pending') return !isSubmitted && !isOverdue
          if (homeworkFilter === 'Submitted') return isSubmitted
          if (homeworkFilter === 'Overdue') return isOverdue
          return true
        }).map((hw: any, i: number) => {
          const isSubmitted = hw.isSubmitted
          const isOverdue = !isSubmitted && new Date(hw.dueDate) < new Date()
          const statusText = isSubmitted ? "Submitted" : isOverdue ? "Overdue" : "Pending"
          const statusVariant = isSubmitted ? "green" : isOverdue ? "red" : "amber"
          const borderBg = isSubmitted ? "#10b981" : isOverdue ? "#ef4444" : "#f59e0b"
          const dueStr = new Date(hw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

          return (
            <div key={i} onClick={() => setSelectedHomework(hw)} className="bg-white rounded-2xl border border-border p-4 flex items-stretch gap-3 text-left cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-1 rounded-full flex-shrink-0" style={{ background: borderBg }} />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 leading-tight">{hw.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{hw.subject?.name || "Subject"} {hw.teacher ? `· ${hw.teacher.name}` : ''}</p>
                  </div>
                  <Badge text={statusText} variant={statusVariant} />
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <p className="text-sm text-gray-500">
                    Due <span className={isOverdue ? "text-red-500 font-semibold" : "text-gray-900 font-semibold"}>{dueStr}</span> · {hw.maxMarks} marks
                  </p>
                  {hw.submission?.marksReceived !== undefined && (
                    <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                      {hw.submission.marksReceived}/{hw.maxMarks} graded
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {assignments.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-sm font-semibold text-gray-500">No homework assigned</p>
          </div>
        )}
      </div>

      {/* ── Homework Detail Modal / Bottom Sheet ── */}
      {selectedHomework && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            
            <div className="p-4 sm:p-6 pb-4 flex items-start justify-between border-b border-border/50 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge text={selectedHomework.isSubmitted ? "Submitted" : (new Date(selectedHomework.dueDate) < new Date() ? "Overdue" : "Pending")} variant={selectedHomework.isSubmitted ? "green" : (new Date(selectedHomework.dueDate) < new Date() ? "red" : "amber")} />
                  <span className="text-sm text-gray-500">{selectedHomework.maxMarks} marks</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedHomework.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedHomework.subject.name} {selectedHomework.teacher ? `· ${selectedHomework.teacher.name}` : ''}</p>
              </div>
              <button onClick={() => setSelectedHomework(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shrink-0"><X className="w-4 h-4 text-gray-600" /></button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-2">INSTRUCTIONS</h3>
                <p className="text-sm text-gray-900 leading-relaxed">{selectedHomework.description}</p>
              </div>

              <div className="bg-gray-50/50 rounded-xl p-4 flex gap-4 divide-x divide-border">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Assigned</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(selectedHomework.assignedDate || selectedHomework.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</p>
                </div>
                <div className="flex-1 pl-4">
                  <p className="text-xs text-gray-500 mb-1">Due date</p>
                  <p className={cn("text-sm font-bold", (!selectedHomework.isSubmitted && new Date(selectedHomework.dueDate) < new Date()) ? "text-red-500" : "text-gray-900")}>{new Date(selectedHomework.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</p>
                </div>
                <div className="flex-1 pl-4">
                  <p className="text-xs text-gray-500 mb-1">Max marks</p>
                  <p className="text-sm font-bold text-gray-900">{selectedHomework.maxMarks}</p>
                </div>
              </div>

              {selectedHomework.attachments && selectedHomework.attachments.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-2">ATTACHMENTS FROM TEACHER</h3>
                  <div className="space-y-2">
                    {selectedHomework.attachments.map((att: any, i: number) => (
                      <div key={i} className="border border-border rounded-xl bg-white overflow-hidden">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold">PDF</div>
                            <span className="text-sm font-semibold text-gray-900">{att.filename}</span>
                          </div>
                          <button 
                            onClick={() => setViewingAttachment(viewingAttachment === att.filename ? null : att.filename)}
                            className="px-3 py-1.5 border border-border rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            {viewingAttachment === att.filename ? <X className="w-3 h-3" /> : "View"}
                          </button>
                        </div>
                        {viewingAttachment === att.filename && (
                          <div className="border-t border-border p-4 bg-gray-50/50">
                            <div className="border border-border rounded-lg bg-white shadow-sm overflow-hidden">
                              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-gray-50/80">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                <span className="text-[10px] text-gray-500 ml-2">{att.filename}</span>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-8"></div>
                                <div className="h-12 bg-gray-100 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="px-4 py-2 border-t border-border bg-gray-50 flex items-center justify-between">
                                <span className="text-xs text-gray-500">Page 1 of 3</span>
                                <button className="text-xs font-bold text-[#c84b1a] hover:underline flex items-center gap-1">
                                  <Download className="w-3 h-3" /> Download
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedHomework.isSubmitted ? (
                <>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-2">YOUR SUBMISSION</h3>
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                      <input type="file" className="hidden" multiple />
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                        <UploadCloud className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Tap to attach file</p>
                      <p className="text-xs text-gray-500">PDF, Word, Image — max 25 MB</p>
                      <p className="text-xs font-semibold text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">or drag and drop here</p>
                    </label>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-2">NOTE TO TEACHER (optional)</h3>
                    <textarea className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c84b1a]/20 focus:border-[#c84b1a]" rows={3} placeholder="Add a message for your teacher..." />
                  </div>
                  <div className="pt-2">
                    <button className="w-full bg-[#e39f82] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 pointer-events-none transition-opacity hover:opacity-90">
                      <UploadCloud className="w-4 h-4" /> Submit homework
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">Attach at least one file to submit</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-800">Submitted</p>
                      <p className="text-xs text-green-600/80 mt-0.5">{new Date(selectedHomework.submission?.submittedAt || Date.now()).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</p>
                    </div>
                  </div>

                  {selectedHomework.submission?.status === "SUBMITTED" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-800">Awaiting grade</p>
                        <p className="text-xs text-amber-600/80 mt-0.5">Your teacher hasn't graded this yet</p>
                      </div>
                    </div>
                  )}

                  {selectedHomework.submission?.status === "GRADED" && (
                    <div className="border border-blue-200 rounded-xl overflow-hidden">
                      <div className="bg-blue-50/50 p-3 border-b border-blue-200 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-blue-700 tracking-wider">MARKS OBTAINED</h3>
                        <span className="text-xs text-blue-500">Graded by {selectedHomework.teacher?.name}</span>
                      </div>
                      <div className="p-4 bg-blue-50/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-blue-200">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-500" strokeDasharray={`${((selectedHomework.submission.marksReceived || 0) / selectedHomework.maxMarks) * 163} 163`} />
                            </svg>
                            <div className="text-center relative z-10">
                              <p className="text-sm font-bold text-gray-900 leading-none">{selectedHomework.submission.marksReceived}</p>
                              <p className="text-[10px] text-gray-500">/{selectedHomework.maxMarks}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(((selectedHomework.submission.marksReceived || 0) / selectedHomework.maxMarks) * 100)}%</p>
                            <p className="text-xs text-gray-500">Excellent work!</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-blue-700 mb-2">Teacher's feedback</h4>
                          <div className="bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm">
                            {selectedHomework.submission.feedback}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedHomework.submission?.studentNote && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-2">YOUR NOTE TO TEACHER</h3>
                      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-900 border border-border">
                        {selectedHomework.submission.studentNote}
                      </div>
                    </div>
                  )}

                  {selectedHomework.submission?.attachments && selectedHomework.submission.attachments.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-2">YOUR SUBMITTED FILES</h3>
                      <div className="space-y-2">
                        {selectedHomework.submission.attachments.map((att: any, i: number) => (
                          <div key={i} className="flex items-center justify-between border border-green-200 bg-green-50/50 rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] font-bold">IMG</div>
                              <span className="text-sm font-semibold text-gray-900">{att.filename}</span>
                            </div>
                            <button className="px-3 py-1.5 border border-green-200 bg-white rounded-full text-xs font-semibold text-green-700 hover:bg-green-50">View</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
