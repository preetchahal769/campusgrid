/**
 * useSchoolInfo — Fetches and returns the principal's school name.
 *
 * Strategy:
 *  1. If School_name is already in auth state (from login or cached), return it.
 *  2. Otherwise, try GET /users/me to get the full user profile which may include
 *     the school name from the backend.
 *  3. If the backend doesn't return School_name, fall back to displaying School_id.
 */

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { updateUser } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"

export function useSchoolInfo() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Already have the school name — nothing to do
    if (user?.School_name) return
    // No school id means we can't fetch anything useful
    if (!user?.School_id) return

    const fetchSchoolName = async () => {
      setIsLoading(true)
      try {
        // Attempt to get enriched user profile from the backend
        const me = await apiFetch("/users/me")
        if (me?.School_name || me?.school?.name) {
          const name = me.School_name || me.school?.name
          dispatch(updateUser({ School_name: name }))
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to enrichment school information profile:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolName()
  }, [user?.School_id, user?.School_name, dispatch])

  return {
    schoolName: user?.School_name ?? null,
    schoolId: user?.School_id ?? null,
    // Display the name if available, otherwise a shortened ID
    schoolDisplay: user?.School_name ?? (user?.School_id ? `ID: ${user.School_id.slice(0, 8)}…` : "Not assigned"),
    isLoading,
  }
}
