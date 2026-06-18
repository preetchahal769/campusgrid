"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function ClerkLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['STAFF', 'ADMIN']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
