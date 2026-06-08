"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { 
  RiBugLine, 
  RiCloseLine, 
  RiTimeLine, 
  RiRefreshLine, 
  RiDeleteBinLine,
  RiDatabase2Line,
  RiServerLine,
  RiKey2Line
} from "@remixicon/react"
import { motion, AnimatePresence } from "framer-motion"

interface DebugInfo {
  environment: string
  accessTokenTtl: number
  refreshTokenTtl: number
  rawJwt: any
  backendHealth: {
    db: string
    dbLatencyMs: number
  }
}

export function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState({ access: 0, refresh: 0 })

  const isProduction = process.env.NODE_ENV === "production"

  const fetchDebugInfo = async () => {
    try {
      const data = await apiFetch("/auth/debug")
      setDebugInfo(data)
      setCountdown({
        access: data.accessTokenTtl,
        refresh: data.refreshTokenTtl
      })
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to fetch debug info")
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchDebugInfo()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !debugInfo) return

    const interval = setInterval(() => {
      setCountdown(prev => ({
        access: Math.max(0, prev.access - 1),
        refresh: Math.max(0, prev.refresh - 1)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, debugInfo])

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "Unknown"
    if (seconds === 0) return "Expired"
    
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m ${s}s`
    return `${m}m ${s}s`
  }

  const handleForceRefresh = async () => {
    try {
      await apiFetch("/auth/refresh", { method: "POST" })
      fetchDebugInfo()
    } catch (err) {
      setError("Failed to force refresh")
    }
  }

  const handleHardReset = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (isProduction) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex h-12 items-center gap-2 rounded-full bg-slate-800 px-4 text-slate-200 shadow-lg transition-transform hover:scale-105 hover:bg-slate-700"
      >
        <RiBugLine className="text-xl text-yellow-400" />
        <span className="font-semibold text-sm">Debug Info</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 z-50 w-96 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/50 p-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <RiServerLine className="text-blue-400" />
                System Debugger
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                  {error}
                </div>
              )}

              {debugInfo ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <RiTimeLine /> Access Token
                      </div>
                      <div className={`font-mono text-sm ${countdown.access < 60 ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                        {formatTime(countdown.access)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <RiTimeLine /> Refresh Token
                      </div>
                      <div className="font-mono text-sm text-slate-200">
                        {formatTime(countdown.refresh)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <RiDatabase2Line /> Backend Health
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Environment</span>
                      <span className="font-mono text-emerald-400">{debugInfo.environment}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-slate-300">Database</span>
                      <span className={`font-mono ${debugInfo.backendHealth.db === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {debugInfo.backendHealth.db} ({debugInfo.backendHealth.dbLatencyMs}ms)
                      </span>
                    </div>
                  </div>

                  {debugInfo.rawJwt && (
                    <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
                      <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        <RiKey2Line /> JWT Payload
                      </div>
                      <pre className="text-xs text-emerald-300 overflow-x-auto bg-slate-900 p-2 rounded">
                        {JSON.stringify(debugInfo.rawJwt, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                !error && <div className="text-center text-sm text-slate-400 py-4">Loading debug data...</div>
              )}

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={handleForceRefresh}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                >
                  <RiRefreshLine /> Force Refresh
                </button>
                <button
                  onClick={handleHardReset}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                >
                  <RiDeleteBinLine /> Hard Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
