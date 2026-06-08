"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { RiLoader4Line } from "@remixicon/react"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if we have auth state
    if (!isAuthenticated || !user) {
      // Check if we have a refresh token before aggressively redirecting
      const hasRefreshToken = typeof window !== 'undefined' && !!localStorage.getItem('cg_refresh_token')
      if (!hasRefreshToken) {
        router.replace('/login')
        return
      }
    }

    // Role-based protection
    if (user && allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Prevent infinite loops if they try to access a role page they aren't assigned to
        const expectedPrefix = `/${user.role.toLowerCase()}`
        if (!pathname.startsWith(expectedPrefix)) {
          router.replace(expectedPrefix)
          return
        }
      }
    }

    setIsReady(true)
  }, [user, isAuthenticated, router, allowedRoles, pathname])

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Authenticating session...</p>
      </div>
    )
  }

  return <>{children}</>
}
