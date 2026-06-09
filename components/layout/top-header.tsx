"use client"

import { useState, useRef, useEffect } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { RiNotification3Line, RiCheckDoubleLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

export function TopHeader() {
  const { user } = useAppSelector((state) => state.auth)
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 md:px-10 md:py-6 absolute top-0 left-0 z-30 bg-transparent text-white">
      <div className="flex items-center gap-4">
        {/* Profile Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 border border-white/30 flex-shrink-0 backdrop-blur-md">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        {/* Greeting */}
        <div className="flex flex-col justify-center drop-shadow-md">
          <p className="text-sm font-medium text-white/80 leading-tight">
            Hello, {user.name?.split(' ')[0] || 'User'}!
          </p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight text-white">
            {user.role === 'SUPER_ADMIN' ? 'Nexus Console' : 'Welcome Back'}
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "w-10 h-10 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors relative shadow-sm",
            showNotifications ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
          )}
        >
          <RiNotification3Line className="w-5 h-5" />
          {/* Notification Badge */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-[#0A4EA6] rounded-full shadow-sm"></span>
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              <button className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-wider">Mark all read</button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <RiCheckDoubleLine className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">You're all caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No new notifications to show right now.</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
