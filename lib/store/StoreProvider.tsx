'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from './store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(null)
  
  if (!storeRef.current) {
    storeRef.current = makeStore()
    
    // Auto-clear local storage if the session cookie has expired, 
    // ensuring the app doesn't load with stale auth state.
    if (typeof window !== 'undefined') {
      const hasSession = document.cookie.includes('cg_session=true')
      
      if (!hasSession) {
        localStorage.removeItem('cg_user')
        localStorage.removeItem('cg_role')
        localStorage.removeItem('cg_profile')
        localStorage.removeItem('nexus_schools')
        localStorage.removeItem('nexus_finance')
      }
    }
  }
  
  return <Provider store={storeRef.current}>{children}</Provider>
}
