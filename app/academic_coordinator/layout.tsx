"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function AcademicCoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ACADEMIC_COORDINATOR', 'ADMIN']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
