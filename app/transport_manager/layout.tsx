"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function TransportManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['TRANSPORT_MANAGER', 'ADMIN']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
