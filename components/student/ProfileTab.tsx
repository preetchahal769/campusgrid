"use client"

import { SectionCard, Badge, ORANGE } from "@/components/layout/DashboardLayout"

interface ProfileTabProps {
  profile: any
  user: any
}

export function ProfileTab({ profile, user }: ProfileTabProps) {
  const fullName = profile?.users?.name || user?.name || "Student"
  const firstName = fullName.split(' ')[0]

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0" style={{ background: ORANGE }}>
          {firstName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-gray-900">{fullName}</h2>
          <p className="text-sm text-gray-500">Class {profile?.section?.grade?.name || "11"} — {profile?.section?.name || "Science (A)"}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge text="Active" variant="green" />
            {profile?.rollNumber && <span className="text-xs font-mono text-gray-500">Roll No: {profile.rollNumber}</span>}
          </div>
        </div>
      </div>

      <SectionCard title="Personal Details">
        <div className="space-y-0">
          {[
            { label: "Full Name",       value: fullName },
            { label: "Phone",           value: user?.phoneNo || "Not provided" },
            { label: "Email",           value: user?.email || "Not provided" },
          ].map(({ label, value }, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <span className="text-xs font-semibold text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
