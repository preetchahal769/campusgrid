"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RiArrowLeftLine, RiCheckLine, RiTimeLine, RiMapPinLine, RiCalendarCloseLine } from "@remixicon/react"
import Link from "next/link"

export default function MyAttendancePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isApplyingLeave, setIsApplyingLeave] = useState(false)

  const handleCheckIn = () => {
    setIsCheckedIn(true)
  }

  // Dummy recent history
  const history = [
    { date: "Mar 18, 2026", status: "Present", time: "07:55 AM" },
    { date: "Mar 17, 2026", status: "Present", time: "08:10 AM" },
    { date: "Mar 16, 2026", status: "Present", time: "07:50 AM" },
    { date: "Mar 13, 2026", status: "Leave", time: "Approved" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">My Attendance</h1>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-6">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <Card className="p-6 rounded-3xl border-border/50 shadow-sm bg-background/60 backdrop-blur-xl text-center">
            <h2 className="text-lg font-bold mb-2">Today's Status</h2>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6 border border-border/40 bg-muted/30 px-3 py-1.5 rounded-full inline-block">
              Mar 19, 2026
            </div>

            {!isCheckedIn ? (
              <div className="space-y-4">
                <Button 
                  onClick={handleCheckIn}
                  className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex gap-2"
                >
                  <RiMapPinLine className="w-6 h-6" />
                  Mark as Present
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsApplyingLeave(!isApplyingLeave)}
                  className="w-full h-14 rounded-2xl text-base font-semibold border-border/60 hover:bg-muted/50"
                >
                  <RiCalendarCloseLine className="w-5 h-5 mr-2" />
                  Request Day Off
                </Button>

                {isApplyingLeave && (
                  <div className="mt-4 p-4 border rounded-2xl bg-muted/20 text-left animate-in fade-in slide-in-from-top-2">
                     <p className="text-sm font-semibold mb-2">Send Request to Principal</p>
                     <textarea 
                        className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm min-h-[80px] mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        placeholder="State your reason for absence..."
                     />
                     <Button className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 text-white font-bold">
                       Submit Request
                     </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <RiCheckLine className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Checked In!</h3>
                <p className="text-sm font-semibold text-muted-foreground mt-2 flex items-center gap-1.5">
                  <RiTimeLine className="w-4 h-4" />
                  08:14 AM
                </p>
              </div>
            )}
          </Card>

          {/* History */}
          <div>
            <h3 className="font-bold text-lg mb-4">Recent History</h3>
            <div className="space-y-3">
              {history.map((record, index) => (
                <Card key={index} className="px-4 py-3 rounded-2xl border-border/40 shadow-sm bg-background/50 backdrop-blur-sm flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-foreground/90">{record.date}</div>
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-0.5">
                      <RiTimeLine className="w-3.5 h-3.5" />
                      {record.time}
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-md border ${
                    record.status === 'Present' 
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
                  }`}>
                    {record.status}
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  )
}
