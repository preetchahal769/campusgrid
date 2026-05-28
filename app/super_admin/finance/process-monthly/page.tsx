"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiFileList3Line,
  RiFlashlightLine,
  RiCheckLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCalendarCheckLine,
  RiInformationLine,
  RiShieldFlashLine
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function GenerateInvoicesPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState("")

  useEffect(() => {
    setCurrentMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))
  }, [])

  const handleProcess = async () => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    const monthKey = new Date().toISOString().slice(0, 7) // Returns YYYY-MM

    try {
      // Trying the documented endpoint first
      const data = await apiFetch("/finance/subscriptions/process-monthly", {
        method: "POST",
        body: JSON.stringify({ month: monthKey })
      })
      setResult(data)
    } catch (err: any) {
      console.error(err)
      // If 404, we'll try the flatter pattern since that's what worked for schools
      if (err.message?.includes('404')) {
        try {
          const fallbackData = await apiFetch("/finance/subscriptions/process-monthly", {
            method: "POST",
            body: JSON.stringify({ month: monthKey })
          })
          setResult(fallbackData)
          return
        } catch (innerErr: any) {
          setError(innerErr.message || "Failed to process invoices")
        }
      } else {
        setError(err.message || "Failed to process monthly invoices")
      }
    } finally {
      setIsProcessing(false)
    }
  }



  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      {/* Background with higher intensity for 'Process' actions */}
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-amber-500/20 via-primary/5 to-transparent -z-10" />
      <div className="fixed -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Billing Engine</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-amber-600">Monthly Node Processing</p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Context Card */}
        <Card className="p-6 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <RiCalendarCheckLine className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Billing Cycle</p>
              <p className="text-lg font-black">{currentMonth || "Loading Cycle..."}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
            <RiInformationLine className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
              This action will scan all active school nodes, calculate usage-based infrastructure costs, and generate invoices for the current period.
            </p>
          </div>
        </Card>

        {/* Process Section */}
        <div className="space-y-4 pt-4">
          {!result && (
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full h-20 rounded-[2.5rem] bg-amber-600 hover:bg-amber-700 text-white shadow-2xl shadow-amber-600/30 flex items-center justify-between px-8 transition-all active:scale-[0.98] group"
            >
              <div className="text-left">
                <p className="text-base font-black tracking-tight uppercase tracking-widest">Execute Batch</p>
                <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Generate All Node Invoices</p>
              </div>
              {isProcessing ? (
                <RiLoader4Line className="w-8 h-8 animate-spin" />
              ) : (
                <RiShieldFlashLine className="w-8 h-8 text-amber-200 group-hover:scale-110 transition-transform" />
              )}
            </Button>
          )}

          {/* Success Result Card */}
          {result && (
            <div className="animate-in zoom-in-95 duration-500 space-y-4">
              <div className="p-6 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <RiCheckLine className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Processing Complete</h3>
                  <p className="text-sm font-medium opacity-80 mt-1">{result.message || `Successfully generated invoices for ${result.count || 'all'} schools.`}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl font-bold"
                onClick={() => router.push('/super_admin/finance/subscriptions')}
              >
                Go to Overview
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-5 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive animate-in shake-1 duration-300">
              <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm uppercase tracking-wider">Engine Fault</p>
                <p className="text-xs font-semibold mt-1 opacity-90">{typeof error === 'string' ? error : "Billing Engine Fault"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Security Warning */}
        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40 py-4">
          <RiFlashlightLine className="w-3 h-3" />
          Nexus Secure Execution Protocol
        </div>
      </div>
    </div>
  )
}
