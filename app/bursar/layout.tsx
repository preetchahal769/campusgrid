"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function BursarLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['BURSAR']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
