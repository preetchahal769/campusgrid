"use client"

import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { StatCard, SectionCard, Badge, INDIGO, ORANGE } from "@/components/layout/DashboardLayout"
import { CheckCircle2, TrendingUp } from "lucide-react"

const GET_STUDENT_PERFORMANCE = gql`
  query GetStudentPerformance {
    studentPerformance {
      gpa
      rank
      sectionName
      subjects {
        subjectName
        score
        color
      }
      examResults {
        title
        date
        score
        grade
        variant
      }
    }
  }
`

interface PerformanceTabProps {
  profile: any
}

export function PerformanceTab({ profile }: PerformanceTabProps) {
  const { data, loading: isLoading, error } = useQuery<any>(GET_STUDENT_PERFORMANCE)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm font-semibold text-red-500">Failed to load performance metrics.</p>
      </div>
    )
  }

  const performance = data?.studentPerformance || {
    gpa: 0,
    rank: "N/A",
    sectionName: "N/A",
    subjects: [],
    examResults: []
  }

  // Support local fallback if db has no ratings populated yet
  const displayGPA = performance.gpa > 0 ? performance.gpa.toFixed(1) : (profile?.users?.globalRating ? (profile.users.globalRating / 10).toFixed(1) : "0.0")
  const displayRank = performance.rank !== "0 / 0" && performance.rank !== "N/A / 0" ? performance.rank : (profile?.rankingPoints ? `#${profile.rankingPoints}` : "N/A")

  return (
    <div className="space-y-4">
      {/* GPA & Rank Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          label="Overall GPA" 
          value={displayGPA} 
          sub="Out of 10" 
          color={INDIGO} 
          bg="#eef0fd" 
          icon={TrendingUp} 
        />
        <StatCard 
          label="Class Rank" 
          value={displayRank} 
          sub={performance.sectionName !== "N/A" ? performance.sectionName : "Section Rank"} 
          color={ORANGE} 
          bg="#fdf2ec" 
          icon={CheckCircle2} 
        />
      </div>

      {/* Subject-wise Scores */}
      <SectionCard title="Subject-wise Scores">
        <div className="space-y-4 py-2">
          {performance.subjects.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No subject marks registered</p>
          ) : (
            performance.subjects.map((sub: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-900">{sub.subjectName}</span>
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
            ))
          )}
        </div>
      </SectionCard>

      {/* Recent Exam Results */}
      <SectionCard title="Recent Exam Results">
        <div className="space-y-1">
          {performance.examResults.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No graded exams recorded</p>
          ) : (
            performance.examResults.map((exam: any, i: number) => (
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
            ))
          )}
        </div>
      </SectionCard>
    </div>
  )
}
