"use client"

import { Broadcast } from "@/lib/store/slices/studentSlice"

interface NoticesTabProps {
  broadcasts: Broadcast[]
}

export function NoticesTab({ broadcasts }: NoticesTabProps) {
  return (
    <div className="space-y-2.5">
      {broadcasts.map((n, i) => (
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
