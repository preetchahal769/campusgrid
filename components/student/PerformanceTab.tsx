"use client"

import { StatCard, INDIGO, ORANGE } from "@/components/layout/DashboardLayout"
import { CheckCircle2, TrendingUp } from "lucide-react"

interface PerformanceTabProps {
  profile: any
}

export function PerformanceTab({ profile }: PerformanceTabProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          label="Overall GPA" 
          value={profile?.users?.globalRating ? (profile.users.globalRating / 10).toFixed(1) : "0.0"} 
          sub="Out of 10" 
          color={INDIGO} 
          bg="#eef0fd" 
          icon={TrendingUp} 
        />
        <StatCard 
          label="Class Rank" 
          value={profile?.rankingPoints ? `#${profile.rankingPoints}` : "0"} 
          sub={profile?.section?.name || ""} 
          color={ORANGE} 
          bg="#fdf2ec" 
          icon={CheckCircle2} 
        />
      </div>
    </div>
  )
}
