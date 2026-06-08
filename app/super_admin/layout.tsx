"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
