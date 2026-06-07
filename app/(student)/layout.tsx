"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { RiLoader4Line } from "@remixicon/react"

import { AppShell } from "@/components/layout/app-shell"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, userRole } = useAppSelector((state) => state.auth)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (userRole !== 'student') {
      router.replace(userRole ? `/${userRole}` : '/login')
    }
  }, [isMounted, isAuthenticated, userRole, router])

  if (!isMounted || !isAuthenticated || userRole !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RiLoader4Line className="w-10 h-10 text-primary animate-spin opacity-50" />
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
