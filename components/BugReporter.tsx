"use client"

import { useState, useEffect, useRef } from "react"
import { RiBugLine, RiCloseLine, RiLoader4Line, RiCheckLine, RiErrorWarningLine, RiHistoryLine, RiTimeLine, RiImageLine, RiSendPlaneLine } from "@remixicon/react"
import { useAppSelector } from "@/lib/store/hooks"
import html2canvas from "html2canvas"
import { apiFetch } from "@/lib/api"
import { format } from "date-fns"

export function BugReporter() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [activeTab, setActiveTab] = useState<'REPORT' | 'HISTORY'>('REPORT')
  const [myReports, setMyReports] = useState<any[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [reopenId, setReopenId] = useState<string | null>(null)
  const [reopenMessage, setReopenMessage] = useState("")
  const [isReopening, setIsReopening] = useState(false)
  const [isClosing, setIsClosing] = useState<string | null>(null) // Stores the ID of the report being closed

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number } | null>(null)

  const { user } = useAppSelector((state) => state.auth)

  // Only show on staging or development
  useEffect(() => {
    const hostname = window.location.hostname
    if (hostname.includes("staging") || hostname.includes("localhost") || process.env.NODE_ENV === "development") {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    if (isOpen && activeTab === 'HISTORY' && user) {
      fetchMyReports()
    }
  }, [isOpen, activeTab, user])

  const fetchMyReports = async () => {
    try {
      setIsLoadingReports(true)
      const data = await apiFetch('/bug-reports/my-reports')
      setMyReports(data)
    } catch (err) {
      console.error("Failed to fetch reports", err)
    } finally {
      setIsLoadingReports(false)
    }
  }

  if (!isVisible) return null

  const handleOpenReporter = async () => {
    try {
      setIsCapturing(true)
      
      // Wait a tiny bit for React to render the loading spinner
      await new Promise(resolve => setTimeout(resolve, 50))

      // Capture screenshot using html2canvas which is more reliable on Mobile WebViews
      const canvas = await html2canvas(document.body, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (node) => node.id === 'bug-reporter-btn'
      })

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.5)
      })

      if (blob) {
        setScreenshotBlob(blob)
      }
      
      setActiveTab('REPORT')
      setIsOpen(true)
    } catch (err) {
      console.error("Failed to capture screenshot", err)
      setActiveTab('REPORT')
      setIsOpen(true) // Open it anyway, just without screenshot
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError("Please describe the issue")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      if (screenshotBlob) {
        formData.append("screenshot", screenshotBlob, "screenshot.jpg")
      }
      formData.append("description", description)
      formData.append("url", window.location.href)
      
      if (user?.email) formData.append("userEmail", user.email)
      if (user?.role) formData.append("userRole", user.role)

      const token = localStorage.getItem("access_token")
      let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      if (!backendUrl.startsWith("http")) {
        backendUrl = `https://${backendUrl}`
      }
      
      const response = await fetch(`${backendUrl}/bug-reports`, {
        method: 'POST',
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit bug report")
      }

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setDescription("")
      }, 3000)

    } catch (err: any) {
      setError(err.message || "An error occurred")
      const btn = document.getElementById("bug-reporter-btn")
      if (btn) btn.style.display = "flex"
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReopen = async (e: React.FormEvent, reportId: string) => {
    e.preventDefault()
    if (!reopenMessage.trim()) return

    setIsReopening(true)
    try {
      await apiFetch(`/bug-reports/${reportId}/reopen`, {
        method: 'PATCH',
        body: JSON.stringify({ message: reopenMessage })
      })
      setReopenId(null)
      setReopenMessage("")
      fetchMyReports() // Refresh list
    } catch (err) {
      console.error("Failed to reopen", err)
      setError("Failed to reopen issue")
    } finally {
      setIsReopening(false)
    }
  }

  const handleClose = async (reportId: string) => {
    setIsClosing(reportId)
    try {
      await apiFetch(`/bug-reports/${reportId}/close`, {
        method: 'PATCH'
      })
      fetchMyReports() // Refresh list
    } catch (err) {
      console.error("Failed to close issue", err)
      setError("Failed to close issue")
    } finally {
      setIsClosing(null)
    }
  }

  const handlePointerDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    setHasMoved(false)
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y
    }
  }

  const handlePointerMove = (e: any) => {
    if (!isDragging || !dragRef.current) return
    
    const moveX = Math.abs(e.clientX - dragRef.current.startX - position.x)
    const moveY = Math.abs(e.clientY - dragRef.current.startY - position.y)
    
    if (moveX > 5 || moveY > 5) {
      setHasMoved(true)
    }

    setPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY
    })
  }

  const handlePointerUp = (e: any) => {
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (!hasMoved) {
      handleOpenReporter()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-rose-500/10 text-rose-600 border-rose-200"
      case "REOPENED": return "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200"
      case "WORKING": return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "SOLVED": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "CLOSED": return "bg-slate-500/10 text-slate-600 border-slate-200"
      default: return "bg-slate-100 text-slate-600"
    }
  }

  return (
    <>
      <button
        id="bug-reporter-btn"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        disabled={isCapturing}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 hover:bg-rose-700 hover:scale-105 disabled:opacity-50 transition-colors z-[9999] touch-none cursor-grab active:cursor-grabbing"
        title="Report a bug"
      >
        {isCapturing ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiBugLine className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-background w-full max-w-lg rounded-3xl shadow-2xl border border-border/50 flex flex-col max-h-[90vh]">
            {/* Header & Tabs */}
            <div className="border-b border-border/50 bg-muted/30 rounded-t-3xl overflow-hidden shrink-0">
              <div className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-rose-600">
                  <RiBugLine className="w-5 h-5" />
                  <h3 className="font-black tracking-tight text-foreground">Bug Reporter</h3>
                </div>
                <button 
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
              
              {user && (
                <div className="flex px-4 gap-2 pb-2">
                  <button
                    onClick={() => setActiveTab('REPORT')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'REPORT' ? 'bg-white shadow-sm text-rose-600' : 'text-muted-foreground hover:bg-black/5'}`}
                  >
                    Report Issue
                  </button>
                  <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'HISTORY' ? 'bg-white shadow-sm text-rose-600' : 'text-muted-foreground hover:bg-black/5'}`}
                  >
                    My Past Reports
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'REPORT' ? (
                success ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                      <RiCheckLine className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-lg mb-1">Got it!</h4>
                    <p className="text-sm text-muted-foreground">The screenshot and details have been sent to the developers.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
                    {error && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold">
                        <RiErrorWarningLine className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">What went wrong?</label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="e.g. I clicked the save button but nothing happened..."
                        className="w-full h-32 rounded-2xl bg-muted/40 border border-border/50 p-4 text-sm resize-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/30 outline-none transition-all"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <RiCheckLine className="w-3 h-3 text-emerald-500" /> Auto-Capturing
                      </p>
                      <p className="text-xs font-medium text-muted-foreground line-clamp-1 flex gap-2">
                        <span className="shrink-0">• Screenshot</span>
                        <span className="shrink-0">• URL</span>
                        <span className="shrink-0">• Email</span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-lg shadow-rose-600/20"
                    >
                      {isSubmitting ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : "Submit Report"}
                    </button>
                  </form>
                )
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {isLoadingReports ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <RiLoader4Line className="w-8 h-8 animate-spin mb-2" />
                      <p className="text-sm">Loading your reports...</p>
                    </div>
                  ) : myReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <RiHistoryLine className="w-12 h-12 mb-3 text-muted" />
                      <p className="font-bold text-slate-700">No reports found</p>
                      <p className="text-xs">You haven't reported any bugs yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myReports.map((report) => (
                        <div key={report.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                              <RiTimeLine className="w-3 h-3" />
                              {format(new Date(report.updatedAt || report.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-slate-700 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                            {report.description}
                          </p>

                          {report.screenshotUrl && (
                            <a href={report.screenshotUrl} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 w-fit px-3 py-1.5 rounded-lg transition-colors">
                              <RiImageLine className="w-3.5 h-3.5" />
                              View Screenshot
                            </a>
                          )}

                          {report.status === "SOLVED" && (
                            <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-2">
                              {reopenId === report.id ? (
                                <form onSubmit={(e) => handleReopen(e, report.id)} className="flex items-end gap-2 animate-in slide-in-from-top-2">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={reopenMessage}
                                      onChange={(e) => setReopenMessage(e.target.value)}
                                      placeholder="Why is it not solved?"
                                      className="w-full h-9 rounded-xl bg-muted/50 border border-border/50 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/50"
                                      disabled={isReopening || isClosing === report.id}
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={isReopening || !reopenMessage.trim() || isClosing === report.id}
                                    className="h-9 px-3 rounded-xl bg-fuchsia-600 text-white font-bold text-xs hover:bg-fuchsia-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                                  >
                                    {isReopening ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <><RiSendPlaneLine className="w-3.5 h-3.5" /> Send</>}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReopenId(null)}
                                    className="h-9 px-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors shrink-0"
                                    disabled={isReopening || isClosing === report.id}
                                  >
                                    Cancel
                                  </button>
                                </form>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setReopenId(report.id)}
                                    disabled={isClosing === report.id}
                                    className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1 disabled:opacity-50"
                                  >
                                    Not satisfied? Reopen issue
                                  </button>
                                  <span className="text-slate-300 text-xs">•</span>
                                  <button
                                    onClick={() => handleClose(report.id)}
                                    disabled={isClosing === report.id}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50 bg-emerald-50 px-2 py-1 rounded-md transition-colors"
                                  >
                                    {isClosing === report.id ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiCheckLine className="w-3.5 h-3.5" />}
                                    Mark as Satisfied (Close)
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
