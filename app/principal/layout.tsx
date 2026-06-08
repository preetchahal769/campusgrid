"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['PRINCIPAL']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
