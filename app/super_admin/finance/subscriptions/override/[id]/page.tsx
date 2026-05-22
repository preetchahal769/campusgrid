"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiSettings4Line,
  RiCheckLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiShieldFlashLine,
  RiBuilding2Line
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function SubscriptionOverridePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    studentCount: 0,
    ratePerStudent: 0,
    amountDue: 0,
    status: "PENDING",
    schoolName: ""
  })

  useEffect(() => {
    loadSubscription()
  }, [id])

  const loadSubscription = async () => {
    setIsLoading(true)
    try {
      const data = await apiFetch(`/finance/subscriptions/${id}`)
      setFormData({
        studentCount: data.studentCount || 0,
        ratePerStudent: data.ratePerStudent || 80,
        amountDue: data.amountDue || 0,
        status: data.status || "PENDING",
        schoolName: data.schoolName || "Unknown Node"
      })
    } catch (err: any) {
      setError(err.message || "Failed to load record")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      // Auto-calculate amountDue if count or rate changes
      if (field === 'studentCount' || field === 'ratePerStudent') {
        newData.amountDue = newData.studentCount * newData.ratePerStudent
      }
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    
    try {
      await apiFetch(`/finance/subscriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(formData)
      })
      setSuccess(true)
      setTimeout(() => router.back(), 2000)
    } catch (err: any) {
      setError(err.message || "Override execution failed")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RiLoader4Line className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-indigo-500/20 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">System Override</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-indigo-600">Manual Subscription Edit</p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <Card className="p-6 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
              <RiBuilding2Line className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{formData.schoolName}</h2>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Record: #{id.slice(0, 8)}</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Node Capacity (Students)</label>
              <div className="relative group">
                <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-indigo-500" />
                <input 
                  type="number" 
                  value={formData.studentCount}
                  onChange={(e) => handleInputChange('studentCount', parseInt(e.target.value))}
                  className="w-full h-14 bg-background/60 backdrop-blur-md border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Rate Per Student (₹)</label>
              <div className="relative group">
                <RiMoneyDollarCircleLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-indigo-500" />
                <input 
                  type="number" 
                  value={formData.ratePerStudent}
                  onChange={(e) => handleInputChange('ratePerStudent', parseInt(e.target.value))}
                  className="w-full h-14 bg-background/60 backdrop-blur-md border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Ledger Status</label>
              <div className="flex gap-2">
                {['PENDING', 'PAID', 'OVERDUE'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('status', status)}
                    className={cn(
                      "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                      formData.status === status 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                        : "bg-background/60 border-border/40 text-muted-foreground"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Calculated Liability</p>
                <p className="text-2xl font-black text-indigo-600">₹{formData.amountDue}</p>
              </div>
              <RiShieldFlashLine className="w-8 h-8 text-indigo-500/20" />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase text-center animate-in shake-1">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase text-center flex items-center justify-center gap-2">
                <RiCheckLine className="w-4 h-4" />
                Override Confirmed
              </div>
            )}

            <Button 
              type="submit"
              disabled={isSaving}
              className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/30 font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              {isSaving ? <RiLoader4Line className="w-6 h-6 animate-spin" /> : "Commit System Override"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
