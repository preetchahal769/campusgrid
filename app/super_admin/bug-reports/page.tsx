"use client"

import { useState, useEffect } from "react"
import { RiBugLine, RiExternalLinkLine, RiTimeLine, RiImageLine, RiArrowRightSLine, RiRefreshLine, RiDownload2Line } from "@remixicon/react"
import { apiFetch } from "@/lib/api"
import { format } from "date-fns"
import jsPDF from "jspdf"

interface BugReport {
  id: string
  userEmail: string | null
  userRole: string | null
  url: string | null
  description: string | null
  screenshotUrl: string | null
  status: string
  createdAt: string
}

export default function BugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await apiFetch("/bug-reports")
      setReports(data)
    } catch (error) {
      console.error("Failed to fetch bug reports", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/bug-reports/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })
      setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r))
      if (selectedReport?.id === id) {
        setSelectedReport({ ...selectedReport, status: newStatus })
      }
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-rose-500/10 text-rose-600 border-rose-200"
      case "WORKING": return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "SOLVED": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      default: return "bg-slate-100 text-slate-600"
    }
  }

  const handleExportPDF = async (report: BugReport) => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(22)
    doc.setTextColor(225, 29, 72) // rose-600
    doc.text("Bug Report", 20, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Report ID: ${report.id}`, 20, 28)
    doc.text(`Date: ${format(new Date(report.createdAt), 'PPpp')}`, 20, 34)
    doc.text(`Status: ${report.status}`, 20, 40)
    
    // Details
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text("Reporter Info", 20, 55)
    doc.setFontSize(11)
    doc.setTextColor(80)
    doc.text(`Email: ${report.userEmail || "Anonymous"}`, 20, 63)
    doc.text(`Role: ${report.userRole || "Unknown"}`, 20, 70)
    
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text("Context", 20, 85)
    doc.setFontSize(11)
    doc.setTextColor(80)
    doc.text(`URL: ${report.url || "Unknown"}`, 20, 93)
    
    // Description
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text("Description", 20, 108)
    doc.setFontSize(11)
    doc.setTextColor(80)
    
    const splitDesc = doc.splitTextToSize(report.description || "No description provided.", 170)
    doc.text(splitDesc, 20, 116)
    
    let currentY = 116 + (splitDesc.length * 5) + 15
    
    // Try to attach image if present
    if (report.screenshotUrl) {
      try {
        if (currentY > 250) {
          doc.addPage()
          currentY = 20
        }
        
        doc.setFontSize(14)
        doc.setTextColor(15, 23, 42)
        doc.text("Screenshot Evidence", 20, currentY)
        
        const img = new Image()
        img.crossOrigin = "Anonymous"
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        img.src = `${backendUrl}/bug-reports/proxy-image?url=${encodeURIComponent(report.screenshotUrl)}`
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })
        
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0)
        const imgData = canvas.toDataURL("image/jpeg")
        
        // Calculate aspect ratio to fit width
        const maxWidth = 170
        const scale = maxWidth / img.width
        const height = img.height * scale
        
        doc.addImage(imgData, "JPEG", 20, currentY + 10, maxWidth, height)
      } catch (err) {
        console.error("Failed to add image to PDF", err)
        doc.setFontSize(10)
        doc.setTextColor(225, 29, 72)
        doc.text("Failed to attach screenshot to PDF due to CORS or image load error.", 20, currentY + 10)
      }
    }
    
    doc.save(`bug-report-${report.id}.pdf`)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <RiBugLine className="w-8 h-8 text-rose-500" />
            Bug Reports
          </h1>
          <p className="text-slate-500 mt-1">Manage and resolve automated error reports from the staging environment.</p>
        </div>
        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <RiRefreshLine className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List View */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[800px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Recent Reports</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading && reports.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No bugs reported yet! 🎉</div>
            ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedReport?.id === report.id ? 'bg-rose-50 border-rose-200 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <RiTimeLine className="w-3 h-3" />
                      {format(new Date(report.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">
                    {report.description || "No description provided"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {report.userEmail || "Anonymous user"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[800px] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    Report Details
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">#{selectedReport.id}</span>
                  </h2>
                  <p className="text-sm text-slate-500">{format(new Date(selectedReport.createdAt), 'MMMM d, yyyy • HH:mm:ss')}</p>
                </div>

                {/* Status Switcher & Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleExportPDF(selectedReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <RiDownload2Line className="w-4 h-4" />
                    Export PDF
                  </button>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  {["OPEN", "WORKING", "SOLVED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedReport.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedReport.status === status
                          ? status === "OPEN" ? "bg-rose-100 text-rose-700"
                            : status === "WORKING" ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                {/* Context Context */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reporter</p>
                    <p className="text-sm font-medium text-slate-900">{selectedReport.userEmail || "Anonymous"}</p>
                    {selectedReport.userRole && (
                      <span className="inline-block mt-1 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {selectedReport.userRole}
                      </span>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Page URL</p>
                    <a href={selectedReport.url || "#"} target="_blank" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 break-all">
                      {selectedReport.url || "Unknown URL"}
                      {selectedReport.url && <RiExternalLinkLine className="w-3 h-3 shrink-0" />}
                    </a>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Description</h3>
                  <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-900 text-sm whitespace-pre-wrap">
                    {selectedReport.description || "No description provided."}
                  </div>
                </div>

                {/* Screenshot */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <RiImageLine className="w-4 h-4 text-slate-400" />
                    Screenshot Evidence
                  </h3>
                  {selectedReport.screenshotUrl ? (
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <img 
                        src={selectedReport.screenshotUrl} 
                        alt="Bug screenshot" 
                        className="w-full h-auto object-contain cursor-zoom-in"
                        onClick={() => window.open(selectedReport.screenshotUrl!, '_blank')}
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-sm">
                      No screenshot was captured for this report.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[800px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
              <RiBugLine className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Select a bug report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
