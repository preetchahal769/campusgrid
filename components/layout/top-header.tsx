"use client"

import { useAppSelector } from "@/lib/store/hooks"
import { RiNotification3Line } from "@remixicon/react"
import { cn } from "@/lib/utils"

export function TopHeader() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return null

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 md:px-10 md:py-6 sticky top-0 bg-background/80 backdrop-blur-xl z-30">
      <div className="flex items-center gap-4">
        {/* Profile Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 flex-shrink-0">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        {/* Greeting */}
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground leading-tight">
            Hello, {user.name?.split(' ')[0] || 'User'}!
          </p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
            {user.role === 'SUPER_ADMIN' ? 'Nexus Console' : 'Welcome Back'}
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors relative">
          <RiNotification3Line className="w-5 h-5" />
          {/* Notification Badge */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-background rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
