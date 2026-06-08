"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiLineChartLine, RiArrowLeftLine, RiStarFill, RiDownload2Line, RiTrophyLine, RiLoader4Line } from "@remixicon/react"
import Link from "next/link"
import { useAppSelector } from "@/lib/store/hooks"

export default function PerformancePage() {
  const { profile, isLoading } = useAppSelector((state) => state.student)
  
  const tests = [
    { name: "Physics Quiz 4", score: 18, total: 20, rating: 4.5, date: "Mar 15, 2026" },
    { name: "Math Midterm", score: 85, total: 100, rating: 4.0, date: "Mar 02, 2026" },
    { name: "CS Assignment", score: 45, total: 50, rating: 4.8, date: "Feb 28, 2026" },
  ]

  const rating = profile?.users?.globalRating || 0
  const rank = profile?.users?.globalRank || "N/A"

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
        <RiLoader4Line className="w-12 h-12 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <Link href="/" className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white">
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Performance Rating</h1>
          <p className="text-xs text-white/70 font-medium">Your academic metrics</p>
        </div>
      </div>

      <div className="px-5 space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <Card className="p-6 rounded-3xl border-blue-500/20 bg-background/60 backdrop-blur-md shadow-lg shadow-blue-500/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4 mt-2">
            <RiLineChartLine className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Global Rating</h2>
          <div className="text-6xl font-black text-foreground tracking-tighter mb-2">{rating.toFixed(1)}<span className="text-3xl text-muted-foreground">/100</span></div>
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <RiStarFill key={i} className={cn("w-5 h-5", i < Math.floor(rating / 20) ? "text-amber-500" : "text-amber-500/30")} />
            ))}
          </div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 inline-block px-3 py-1 rounded-full mt-2">Global Rank: #{rank}</p>
        </Card>

        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <h3 className="font-bold text-lg">Recent Test Marks</h3>
          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.name} className="p-4 rounded-2xl border-border/40 bg-muted/20 hover:border-blue-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-base">{test.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{test.date}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <RiStarFill className="w-3 h-3" />
                    {test.rating}
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-4 mb-4">
                  <div className="text-sm text-muted-foreground font-medium">Test Score</div>
                  <div className="text-xl font-bold">{test.score} <span className="text-base text-muted-foreground font-medium">/ {test.total}</span></div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <Button variant="outline" className="flex-1 h-10 text-xs font-semibold rounded-xl bg-background border-border/60 hover:bg-muted text-foreground">
                    <RiDownload2Line className="w-4 h-4 mr-2 text-blue-500" />
                    My Sheet
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-xs font-semibold rounded-xl bg-background border-border/60 hover:bg-muted text-foreground">
                    <RiTrophyLine className="w-4 h-4 mr-2 text-amber-500" />
                    Best Sheet
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
