"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { RiLoader4Line } from "@remixicon/react"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
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

    if (userRole !== 'teacher') {
      // Redirect to their correct portal
      router.replace(userRole ? `/${userRole}` : '/login')
    }
  }, [isMounted, isAuthenticated, userRole, router])

  // Show spinner while hydrating or if role is wrong
  if (!isMounted || !isAuthenticated || userRole !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RiLoader4Line className="w-10 h-10 text-primary animate-spin opacity-50" />
      </div>
    )
  }

  return <>{children}</>
}
