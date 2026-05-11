"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setAuditLogs, setLoading, setError } from "@/lib/store/slices/nexusSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiHistoryLine,
  RiSearchLine,
  RiFilter3Line,
  RiLoader4Line,
  RiUserSettingsLine,
  RiBuilding2Line,
  RiShieldFlashLine,
  RiShieldKeyholeLine,
  RiLockPasswordLine,
  RiTimeLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AuditLog {
  id: string
  action: string
  actorName: string
  actorRole: string
  timestamp: string
  details: string
  status: "SUCCESS" | "FAILURE" | "WARNING"
}

export default function AuditLogsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { auditLogs: logs, isLoading, error } = useAppSelector(state => state.nexus)
  
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    dispatch(setLoading(true))
    try {
      const data = await apiFetch("/audit-logs")
      dispatch(setAuditLogs(data))
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to fetch logs"))
    }
  }

  const getStatusStyle = (status: any) => {
    const statusStr = typeof status === 'string' ? status : status?.status || ''
    switch (statusStr) {
      case "SUCCESS": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "FAILURE": return "bg-rose-500/10 text-rose-600 border-rose-500/20"
      case "WARNING": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default: return "bg-muted text-muted-foreground border-border/40"
    }
  }

  const getSeverityStyle = (severity?: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return "border-rose-500/30 bg-rose-500/5 shadow-[0_0_20px_-10px_rgba(244,63,94,0.3)]"
      case 'WARN': return "border-amber-500/30 bg-amber-500/5"
      default: return "border-border/40 bg-background/60"
    }
  }

  const getSeverityBadge = (severity?: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return "bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse"
      case 'WARN': return "bg-amber-500 text-white"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("SCHOOL")) return RiBuilding2Line
    if (action.includes("LOGIN")) return RiShieldKeyholeLine
    if (action.includes("PAYMENT")) return RiShieldFlashLine
    return RiUserSettingsLine
  }

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actorName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-cyan-600/20 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Security Audit</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-cyan-600">Global Event Ledger</p>
            </div>
          </div>
          <RiHistoryLine className="w-8 h-8 text-cyan-500/20" />
        </div>

        {/* Search */}
        <div className="relative animate-in slide-in-from-top-4 duration-500 delay-100">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by action, actor, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/40 outline-none transition-all placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest animate-in shake-1 mb-6">
          {typeof error === 'string' ? error : 'Ledger Synchronization Fault'}
        </div>
      )}

      {/* Logs List */}
      <div className="px-6 space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <RiLoader4Line className="w-10 h-10 animate-spin text-cyan-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Ledger...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[2.5rem] border border-dashed border-border/60">
            <RiShieldFlashLine className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">No matching events found in audit history</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const ActionIcon = getActionIcon(log.action)
              return (
                <div 
                  key={log.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className={cn(
                    "p-5 rounded-[2rem] backdrop-blur-xl border space-y-4 relative overflow-hidden group transition-all",
                    getSeverityStyle(log.severity)
                  )}>
                    <div className={cn(
                      "absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125",
                      log.severity === 'CRITICAL' ? "bg-rose-500/10" : "bg-cyan-500/5"
                    )} />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                        <ActionIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black tracking-widest uppercase">{typeof log.action === 'string' ? log.action.replace(/_/g, ' ') : 'Grid Event'}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium mt-0.5">
                          <RiTimeLine className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="opacity-30">|</span>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border", 
                        getStatusStyle(log.status)
                      )}>
                        {typeof log.status === 'string' ? log.status : log.status?.status || 'UNKNOWN'}
                      </div>
                      {log.severity && (
                        <div className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest", getSeverityBadge(log.severity))}>
                          {log.severity}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <p className="text-[11px] font-semibold text-foreground/80 leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/40">
                      {typeof log.details === 'string' ? log.details : 'Processing event details...'}
                    </p>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        {log.actorAvatar ? (
                          <img 
                            src={log.actorAvatar} 
                            alt={log.actorName} 
                            className="w-5 h-5 rounded-full object-cover border border-border/40"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                            {log.actorName?.charAt(0) || "?"}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground">{typeof log.actorName === 'string' ? log.actorName : 'Unknown Actor'}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600/60">{typeof log.actorRole === 'string' ? log.actorRole : 'USER'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
