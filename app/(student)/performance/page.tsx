"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch, getApiUrl } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RiLineChartLine, 
  RiArrowLeftLine, 
  RiStarFill, 
  RiDownload2Line, 
  RiFileTextLine, 
  RiLoader4Line,
  RiTrophyLine
} from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PerformancePage() {
  const { user } = useAppSelector((state) => state.auth)
  const [profile, setProfile] = useState<any>(null)
  const [exams, setExams] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>("")
  const [reportCard, setReportCard] = useState<any>(null)
  
  const [loading, setLoading] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)

  // 1. Fetch Student Profile and Exams List
  useEffect(() => {
    const initPage = async () => {
      try {
        const studentProfile = await apiFetch('/students/me')
        setProfile(studentProfile)

        const examsList = await apiFetch(`/academics/exams?schoolId=${studentProfile.School_id}`)
        setExams(examsList)

        if (examsList.length > 0) {
          setSelectedExamId(examsList[0].id)
        }
      } catch (err) {
        console.error("Failed to initialize performance dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    initPage()
  }, [])

  // 2. Fetch Report Card for selected exam
  useEffect(() => {
    if (!profile || !selectedExamId) return

    const fetchReport = async () => {
      setLoadingReport(true)
      setReportCard(null)
      try {
        const data = await apiFetch(`/academics/exams/${selectedExamId}/report-card/${profile.id}`)
        setReportCard(data)
      } catch (err) {
        console.error("Failed to fetch report card:", err)
      } finally {
        setLoadingReport(false)
      }
    }
    fetchReport()
  }, [profile, selectedExamId])

  const handleDownloadPdf = () => {
    if (!profile || !selectedExamId) return
    
    // We open the backend PDF route to trigger direct download
    const token = localStorage.getItem('token') || ''
    const url = `${getApiUrl()}/academics/exams/${selectedExamId}/report-card/${profile.id}/pdf?token=${encodeURIComponent(token)}`
    
    // Open in a new tab which handles the streaming response
    window.open(url, '_blank')
  }

  const rating = profile?.users?.globalRating || 0
  const rank = profile?.users?.globalRank || 0

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
        <RiLoader4Line className="w-12 h-12 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10 relative z-0">
      {/* Top Banner backer */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <Link href="/student" className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white">
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Performance Dashboard</h1>
          <p className="text-xs text-white/70 font-medium">Grades & Signed Report Cards</p>
        </div>
      </div>

      <div className="px-5 space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Profile Card & Global metrics */}
        <Card className="p-6 rounded-3xl border-blue-500/20 bg-background/60 backdrop-blur-md shadow-lg shadow-blue-500/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4 mt-2">
            <RiLineChartLine className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Global Academic Rating</h2>
          <div className="text-6xl font-black text-foreground tracking-tighter mb-2">
            {rating.toFixed(1)}<span className="text-3xl text-muted-foreground">/100</span>
          </div>
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <RiStarFill key={i} className={cn("w-5 h-5", i < Math.floor(rating / 20) ? "text-amber-500" : "text-amber-500/30")} />
            ))}
          </div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 inline-block px-3 py-1 rounded-full mt-2">
            Global Rank: #{rank}
          </p>
        </Card>

        {/* Report Cards / Exams selector */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-lg">Exam Grades & Transcript</h3>
            {exams.length > 0 && (
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger className="w-full sm:w-[220px] h-11 rounded-xl bg-background/90 border-border/50 text-xs font-semibold shadow-sm">
                  <SelectValue placeholder="Choose Exam" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                  {exams.map(e => (
                    <SelectItem key={e.id} value={e.id} className="text-xs font-semibold cursor-pointer">
                      {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {loadingReport ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Compiling report card details...</p>
            </div>
          ) : reportCard ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              {/* Report Summary Board */}
              <Card className="p-5 rounded-2xl border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-400">Term Average Percentage</h4>
                  <p className="text-[10px] font-semibold text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-widest mt-0.5">
                    Calculated across all graded exams
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                    {reportCard.summary.percentage}%
                  </span>
                  <span className="block text-[10px] text-emerald-600/70 font-semibold uppercase tracking-wider">
                    Total: {reportCard.summary.totalObtained}/{reportCard.summary.totalMax}
                  </span>
                </div>
              </Card>

              {/* Action Button: Download Signed PDF */}
              <Button 
                onClick={handleDownloadPdf}
                className="w-full rounded-2xl h-12 gap-2 font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white border-none"
              >
                <RiDownload2Line className="w-4 h-4" />
                Download Official PDF Transcript
              </Button>

              {/* Detailed Grades Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Subject Breakdown</h4>
                {reportCard.results.map((res: any, idx: number) => (
                  <Card key={idx} className="p-4 rounded-2xl border-border/40 bg-background/60 shadow-sm flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-sm">{res.subject}</h5>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                        {res.remarks || "No feedback comments"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-base font-bold">{res.obtainedMarks}</span>
                        <span className="text-xs text-muted-foreground font-medium">/{res.maxMarks}</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0 border border-primary/20">
                        {res.grade || "N/A"}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/60">
              <RiFileTextLine className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <h4 className="font-bold text-base">Transcript Not Released</h4>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mt-1">
                Grades for this exam have not been compiled or released yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
