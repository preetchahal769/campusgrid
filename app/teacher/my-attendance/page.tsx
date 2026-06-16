"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiFetch } from "@/lib/api"
import { 
  RiArrowLeftLine, 
  RiCheckLine, 
  RiTimeLine, 
  RiMapPinLine, 
  RiLoader4Line,
  RiErrorWarningLine
} from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function MyAttendancePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [checkInTime, setCheckInTime] = useState("")
  const [error, setError] = useState<string | null>(null)

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const loadAttendance = async () => {
    setLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // 1. Fetch monthly history and today's status
      const data = await apiFetch(`/attendance/me?range=monthly`)
      setHistory(data.days || [])

      // Check if already checked in today
      const todayRecord = data.days?.find((d: any) => d.date === today)
      if (todayRecord && todayRecord.status === 'PRESENT') {
        setIsCheckedIn(true)
        setCheckInTime("08:00 AM") // Fallback display time
      }
    } catch (err: any) {
      setError(err.message || "Failed to load attendance logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [])

  const handleCheckIn = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch("/attendance/me", {
        method: "POST",
        body: JSON.stringify({ status: "PRESENT" })
      })
      setIsCheckedIn(true)
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      
      // Reload history
      const data = await apiFetch(`/attendance/me?range=monthly`)
      setHistory(data.days || [])
    } catch (err: any) {
      setError(err.message || "Failed to check in")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      case 'ABSENT':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      case 'LEAVE':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
      case 'HOLIDAY':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border/40'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0A4EA6]/5 via-background to-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teacher" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">My Attendance</h1>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A4EA6]" />
            <p className="text-sm font-semibold text-muted-foreground">Reading attendance registry...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <RiErrorWarningLine className="w-4 h-4" />
                {error}
              </div>
            )}

            <Card className="p-6 rounded-3xl border-border/50 shadow-sm bg-background/60 backdrop-blur-xl text-center">
              <h2 className="text-lg font-bold mb-2">Today's Status</h2>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6 border border-border/40 bg-muted/30 px-3 py-1.5 rounded-full inline-block">
                {todayStr}
              </div>

              {!isCheckedIn ? (
                <div className="space-y-4">
                  <Button 
                    onClick={handleCheckIn}
                    disabled={submitting}
                    className="w-full h-16 rounded-2xl text-lg font-bold bg-[#0A4EA6] hover:bg-[#0A4EA6]/90 shadow-xl shadow-[#0A4EA6]/30 transition-all active:scale-[0.98] flex gap-2 text-white border-none"
                  >
                    {submitting ? (
                      <RiLoader4Line className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <>
                        <RiMapPinLine className="w-6 h-6" />
                        Mark as Present
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <RiCheckLine className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Checked In!</h3>
                  <p className="text-sm font-semibold text-muted-foreground mt-2 flex items-center gap-1.5">
                    <RiTimeLine className="w-4 h-4" />
                    {checkInTime}
                  </p>
                </div>
              )}
            </Card>

            {/* History */}
            <div>
              <h3 className="font-bold text-lg mb-4">Recent History</h3>
              <div className="space-y-3">
                {history
                  .filter((d: any) => d.status !== 'UNMARKED')
                  .slice(0, 10)
                  .map((record, index) => (
                    <Card key={index} className="px-4 py-3 rounded-2xl border-border/40 shadow-sm bg-background/50 backdrop-blur-sm flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm text-foreground/90">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        {record.title && (
                          <div className="text-[10px] font-bold text-blue-500 mt-0.5">
                            {record.title}
                          </div>
                        )}
                      </div>
                      <div className={cn("text-xs font-bold px-3 py-1 rounded-md border", getStatusStyle(record.status))}>
                        {record.status}
                      </div>
                    </Card>
                  ))}
                {history.filter((d: any) => d.status !== 'UNMARKED').length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
                    No recent attendance records found.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </ScrollArea>
    </div>
  )
}
