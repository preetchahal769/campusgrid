"use client"

import { useEffect } from "react"
import { initFirebase, requestForToken, syncTokenWithBackend } from "@/lib/firebase"
import { useAppSelector } from "@/lib/store/hooks"

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const setup = async () => {
      try {
        const { analytics } = await initFirebase()
        if (analytics) {
          console.log("Firebase Analytics initialized")
        }

        // Handle FCM token for logged in users
        if (user) {
          const token = await requestForToken()
          if (token) {
            await syncTokenWithBackend(token)
          }
        }
      } catch (error) {
        console.error("Firebase initialization failed:", error)
      }
    }
    setup()
  }, [user])

  return <>{children}</>
}
