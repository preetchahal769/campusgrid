"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function LibrarianLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['LIBRARIAN']}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
