"use client"

import { StatCard, SectionCard, Badge, INDIGO, ORANGE } from "@/components/layout/DashboardLayout"
import { CheckCircle2, TrendingUp, BookOpen, GraduationCap } from "lucide-react"

interface PerformanceTabProps {
  profile: any
}

export function PerformanceTab({ profile }: PerformanceTabProps) {
  // Use profile stats if available, otherwise fallback to the mock values from design
  const rating = profile?.users?.globalRating ? (profile.users.globalRating / 10).toFixed(1) : "8.7"
  const rank = profile?.rankingPoints ? `#${profile.rankingPoints}` : "#4"
  const sectionName = profile?.section?.name ? `${profile.section.name} (42 Students)` : "Out of 42"

  const subjects = [
    { name: "Mathematics", score: 88, color: "#6366f1" },
    { name: "Physics",     score: 76, color: "#06b6d4" },
    { name: "Chemistry",   score: 71, color: "#f59e0b" },
    { name: "English",     score: 82, color: "#10b981" },
    { name: "Computer Sc.", score: 90, color: "#c2410c" }
  ]

  const examResults = [
    { title: "Unit Test I — Maths",    date: "May 15", score: "44/50",  grade: "A+", variant: "green"  as const },
    { title: "Unit Test I — Physics",  date: "May 16", score: "38/50",  grade: "B+", variant: "blue"   as const },
    { title: "Mid-Term — English",     date: "Apr 20", score: "78/100", grade: "A",  variant: "green"  as const },
    { title: "Mid-Term — Chemistry",   date: "Apr 21", score: "71/100", grade: "B+", variant: "blue"   as const }
  ]

  return (
    <div className="space-y-4">
      {/* GPA & Rank Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          label="Overall GPA" 
          value={rating} 
          sub="Out of 10" 
          color={INDIGO} 
          bg="#eef0fd" 
          icon={TrendingUp} 
        />
        <StatCard 
          label="Class Rank" 
          value={rank} 
          sub={sectionName} 
          color={ORANGE} 
          bg="#fdf2ec" 
          icon={CheckCircle2} 
        />
      </div>

      {/* Subject-wise Scores */}
      <SectionCard title="Subject-wise Scores">
        <div className="space-y-4 py-2">
          {subjects.map((sub, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-900">{sub.name}</span>
                <span className="text-gray-900">
                  {sub.score}<span className="text-xs text-gray-400 font-medium">/100</span>
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${sub.score}%`, backgroundColor: sub.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recent Exam Results */}
      <SectionCard title="Recent Exam Results">
        <div className="space-y-1">
          {examResults.map((exam, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-bold text-gray-900">{exam.title}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{exam.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">{exam.score}</span>
                <Badge text={exam.grade} variant={exam.variant} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
