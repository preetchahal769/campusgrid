"use client"

import { AuthGuard } from "@/components/layout/AuthGuard"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['STUDENT']}>
      {children}
    </AuthGuard>
  )
}
