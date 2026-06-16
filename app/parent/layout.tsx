"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['PARENT']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
