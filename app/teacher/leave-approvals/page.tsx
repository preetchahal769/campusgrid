"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RiArrowLeftLine, RiCheckLine, RiCloseLine, RiCalendarEventLine } from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { resolveLeaveRequest, type LeaveRequest } from "@/lib/store/slices/leaveSlice"
import { updateLeaveStatusByName } from "@/lib/store/slices/attendanceSlice"

export default function LeaveApprovalsPage() {
  const dispatch = useAppDispatch()
  const requests = useAppSelector((state) => state.leaves.pendingRequests)

  const handleAction = (id: string, name: string, action: "approve" | "decline") => {
    // 1. Remove from local queue
    dispatch(resolveLeaveRequest(id))
    // 2. Cross-dispatch: Update the student's status in the roll-call roster!
    dispatch(updateLeaveStatusByName({ name, leaveAction: action, isMaster: true }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-500/5 via-background to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Leave Approvals</h1>
        </div>
        <div className="bg-amber-500/10 text-amber-600 font-bold px-3 py-1 rounded-full text-xs border border-amber-500/20 shadow-sm">
          {requests.length} Pending
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-in fade-in duration-700">
            <RiCalendarEventLine className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-semibold text-lg">You're all caught up!</p>
            <p className="text-sm">No pending leave requests.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {requests.map((request: LeaveRequest) => (
              <Card key={request.id} className="p-4 rounded-3xl border-border/50 shadow-sm bg-background/60 backdrop-blur-xl hover:shadow-md transition-shadow hover:border-amber-500/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-base leading-none mb-1 text-foreground/90">{request.studentName}</h3>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{request.class}</div>
                  </div>
                  <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-md text-xs border border-purple-500/20">
                    {request.duration}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 bg-muted/40 p-2.5 rounded-xl border border-border/30">
                  <RiCalendarEventLine className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{request.dates}</span>
                </div>

                <div className="text-sm text-foreground/80 mb-5 leading-relaxed pl-3 border-l-2 border-border/50 italic py-1">
                  "{request.reason}"
                </div>

                {/* Direct Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleAction(request.id, request.studentName, "decline")}
                    variant="outline" 
                    className="flex-1 h-12 rounded-2xl border-2 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 font-bold transition-colors"
                  >
                    <RiCloseLine className="w-5 h-5 mr-1" />
                    Decline
                  </Button>
                  <Button 
                    onClick={() => handleAction(request.id, request.studentName, "approve")}
                    className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <RiCheckLine className="w-5 h-5 mr-1" />
                    Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
