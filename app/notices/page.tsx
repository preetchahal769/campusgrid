"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setBroadcasts } from "@/lib/store/slices/studentSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiMegaphoneLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiImageLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export default function NoticesPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { broadcasts } = useAppSelector((state) => state.student)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch('/broadcast')
        dispatch(setBroadcasts(data))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [dispatch])

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'ALL') return 'bg-primary/10 text-primary border-primary/20'
    if (role.includes('TEACHER')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    if (role.includes('STUDENT')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    return 'bg-muted text-muted-foreground'
  }

  const getTargetLabel = (targetrole: string) => {
    if (targetrole === 'ALL') return 'Everyone'
    if (targetrole === 'ROLE:TEACHER') return 'Teachers'
    if (targetrole === 'ROLE:STUDENT') return 'Students'
    return targetrole
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Decorative bg */}
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Broadcasts</h1>
          <p className="text-xs text-muted-foreground font-medium">School announcements & notices</p>
        </div>
        {broadcasts.length > 0 && (
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 font-bold">
            {broadcasts.length}
          </Badge>
        )}
      </div>

      <div className="px-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiMegaphoneLine className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-semibold">No broadcasts yet</p>
          </div>
        ) : (
          broadcasts.map((broadcast, index) => (
            <Card
              key={broadcast.id}
              className={cn(
                "rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden",
                "animate-in fade-in slide-in-from-bottom-4 duration-500",
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <RiMegaphoneLine className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base leading-tight">{broadcast.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge className={cn("text-[10px] font-bold uppercase tracking-wider border", getRoleBadgeStyle(broadcast.targetrole))}>
                        {getTargetLabel(broadcast.targetrole)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {broadcast.message}
                </p>

                {/* Attachments */}
                {broadcast.attachments && broadcast.attachments.length > 0 && (
                  <div className="space-y-2">
                    {broadcast.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.fileurl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40 hover:border-primary/30 hover:bg-muted/60 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <RiImageLine className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{att.filename}</p>
                          <p className="text-[10px] text-muted-foreground">{att.filetype}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <RiUserLine className="w-3.5 h-3.5" />
                    {broadcast.author.name}
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-60">{broadcast.author.role.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
