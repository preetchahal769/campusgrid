"use client"

import { useState, useEffect, useRef } from "react"
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
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState({ access: 0, refresh: 0 })
  const [metrics, setMetrics] = useState<any[]>([])
  const [pageLoadTime, setPageLoadTime] = useState<number>(0)

  // Drag state (same pattern as BugReporter)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number } | null>(null)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Only show on staging, localhost, or development
  useEffect(() => {
    const hostname = window.location.hostname
    if (
      hostname.includes("staging") ||
      hostname.includes("localhost") ||
      process.env.NODE_ENV === "development"
    ) {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const calculateLoadTime = () => {
      const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (entry && entry.duration > 0) {
        setPageLoadTime(Math.round(entry.duration))
        return true
      }
      const timing = performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      if (loadTime > 0) {
        setPageLoadTime(loadTime)
        return true
      }
      return false
    }

    if (!calculateLoadTime()) {
      const handleLoad = () => {
        setTimeout(calculateLoadTime, 200)
      }
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const updateMetrics = () => {
      if (typeof window !== 'undefined') {
        setMetrics([...((window as any).apiMetrics || [])])
      }
    }
    updateMetrics()
    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [isOpen])

  // Drag handlers
  const handlePointerDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    setHasMoved(false)
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    }
  }

  const handlePointerMove = (e: any) => {
    if (!isDragging || !dragRef.current) return
    const moveX = Math.abs(e.clientX - dragRef.current.startX - position.x)
    const moveY = Math.abs(e.clientY - dragRef.current.startY - position.y)
    if (moveX > 5 || moveY > 5) {
      setHasMoved(true)
    }
    setPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    })
  }

  const handlePointerUp = (e: any) => {
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (!hasMoved) {
      setIsOpen(true)
    }
  }

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

  if (!isVisible) return null

  return (
    <>
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: isMobile ? '24px' : '260px',
          bottom: isMobile ? '80px' : '24px',
        }}
        className="fixed z-50 flex h-12 cursor-grab touch-none items-center gap-2 rounded-full bg-slate-800 px-4 text-slate-200 shadow-lg transition-transform hover:scale-105 hover:bg-slate-700 active:cursor-grabbing"
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
            style={{
              left: isMobile ? '24px' : '260px',
              bottom: isMobile ? '144px' : '88px',
            }}
            className="fixed z-50 w-96 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
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

                  <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <RiTimeLine /> Client Performance
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Initial Page Load</span>
                      <span className={`font-mono font-bold ${pageLoadTime > 1500 ? 'text-red-400' : pageLoadTime > 800 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {pageLoadTime > 0 ? `${pageLoadTime}ms` : 'Measuring...'}
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

              {/* API Latency Metrics */}
              <div className="rounded-xl bg-slate-800 p-3 border border-slate-700">
                <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <RiTimeLine /> API Load Latency
                </div>
                {metrics.length === 0 ? (
                  <p className="text-xs text-slate-500 py-1 italic">No API requests recorded yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {metrics.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-xs border-b border-slate-850 pb-1.5 last:border-0 last:pb-0">
                        <span className="font-mono text-slate-300 truncate max-w-[220px]" title={m.endpoint}>
                          <span className="text-[9px] font-black px-1 py-0.5 rounded bg-slate-700 text-slate-300 mr-1.5">{m.method}</span>
                          {m.endpoint}
                        </span>
                        <span className={`font-mono font-bold ${m.durationMs > 500 ? 'text-red-400' : m.durationMs > 250 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {m.durationMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
