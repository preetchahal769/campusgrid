"use client"

import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"

const GET_STUDENT_BROADCASTS = gql`
  query GetStudentBroadcasts {
    studentBroadcasts {
      id
      title
      message
      createdAt
    }
  }
`

export function NoticesTab() {
  const { data, loading: isLoading, error } = useQuery<any>(GET_STUDENT_BROADCASTS)
  const broadcasts = data?.studentBroadcasts || []

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border p-4 flex gap-3 border-border h-24 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1.5 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2 bg-gray-200 rounded w-16 mt-2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm font-semibold text-red-500">Failed to load notices.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2.5">
      {broadcasts.map((n: any, i: number) => (
        <div key={i} className="bg-white rounded-2xl border p-4 flex gap-3 border-border">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
          <div>
            <p className="text-sm leading-snug font-semibold text-gray-900">{n.title}</p>
            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
            {n.createdAt && (
              <p className="text-[10px] text-gray-500 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      ))}
      {broadcasts.length === 0 && (
        <p className="text-xs text-gray-500 py-8 text-center">No notices found</p>
      )}
    </div>
  )
}
