"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setSchools, setLoading, setError } from "@/lib/store/slices/nexusSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiFilter3Line,
  RiSearchLine,
  RiFileList3Line,
  RiLoader4Line,
  RiSettings4Line,
  RiCalendarEventLine,
  RiBuilding2Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiArrowUpLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function DetailedLedgerPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { schools } = useAppSelector(state => state.nexus)
  
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setLocalError] = useState<string | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [schoolFilter, setSchoolFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadLedger()
    if (schools.length === 0) loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      const data = await apiFetch("/schools")
      dispatch(setSchools(data))
    } catch {}
  }

  const loadLedger = async () => {
    setIsLoading(true)
    setLocalError(null)
    try {
      const queryParams = new URLSearchParams()
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter)
      if (schoolFilter !== "ALL") queryParams.append("schoolId", schoolFilter)
      
      const data = await apiFetch(`/finance/subscriptions?${queryParams.toString()}`)
      setInvoices(data)
    } catch (err: any) {
      setLocalError(err.message || "Failed to load ledger records")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLedger()
  }, [statusFilter, schoolFilter])

  const filteredInvoices = invoices.filter(inv => 
    inv.schoolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      case "OVERDUE": return "text-rose-500 bg-rose-500/10 border-rose-500/20"
      default: return "text-amber-500 bg-amber-500/10 border-amber-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Billing Ledger</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-indigo-600">Complete Transaction History</p>
          </div>
        </div>
        <RiFileList3Line className="w-8 h-8 text-indigo-500/20" />
      </div>

      {/* Filters Bar */}
      <div className="px-6 mb-6 space-y-4">
        <div className="relative group">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by Node or Invoice ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-background/60 backdrop-blur-md border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 px-1">
            <RiFilter3Line className="w-3.5 h-3.5 text-muted-foreground" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-1">
            <RiBuilding2Line className="w-3.5 h-3.5 text-muted-foreground" />
            <select 
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-indigo-600 focus:outline-none cursor-pointer max-w-[150px]"
            >
              <option value="ALL">All Nodes</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger List */}
      <div className="px-6 space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <RiLoader4Line className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Scanning Transaction Vault...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-[2rem] bg-destructive/10 border border-destructive/20 text-center space-y-3">
            <RiErrorWarningLine className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-xs font-bold text-destructive uppercase tracking-widest">{error}</p>
            <button onClick={loadLedger} className="text-[10px] font-black text-indigo-600 underline">RETRY SCAN</button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-20 text-center space-y-2 opacity-40">
            <RiFileList3Line className="w-12 h-12 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          filteredInvoices.map((inv, idx) => (
            <Card key={inv.id} className="p-5 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <RiBuilding2Line className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight truncate max-w-[180px]">{inv.schoolName}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">#{inv.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", getStatusStyle(inv.status))}>
                  {inv.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Due Date</p>
                  <p className="text-xs font-black flex items-center gap-1.5">
                    <RiCalendarEventLine className="w-3 h-3 text-indigo-500" />
                    {inv.dueDate || inv.date || 'No Date'}
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-xs font-black text-indigo-600">₹{inv.amountDue || inv.amount || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => router.push(`/super_admin/finance/subscriptions/override/${inv.id}`)}
                  className="flex-1 h-10 rounded-xl bg-muted/50 border border-border/40 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-muted transition-colors active:scale-95"
                >
                  <RiSettings4Line className="w-3.5 h-3.5" />
                  Override Record
                </button>
                {inv.status !== 'PAID' && (
                  <button 
                    onClick={() => router.push(`/super_admin/finance/payments?id=${inv.id}`)}
                    className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                  >
                    <RiCheckLine className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
