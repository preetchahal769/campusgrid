"use client"

import { useState, useEffect, use, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiBankCardLine,
  RiCheckLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiShieldCheckLine,
  RiMoneyDollarBoxLine,
  RiMoneyDollarCircleLine,
  RiHashtag,
  RiBuildingLine,
  RiInformationLine
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const PAYMENT_METHODS = [
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Credit Card", value: "CREDIT_CARD" },
  { label: "Wire Transfer", value: "WIRE" },
  { label: "Digital Wallet", value: "WALLET" },
]

function RecordPaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Try to get invoice details from query params if coming from overview
  const invoiceId = searchParams.get("id") || searchParams.get("invoiceId") || ""
  const schoolName = searchParams.get("school") || "Select School Node"
  const amount = searchParams.get("amount") || "0.00"

  const [formData, setFormData] = useState({
    invoiceId: invoiceId,
    paymentMethod: "BANK_TRANSFER",
    transactionId: "",
    amount: amount || "0"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (invoiceId) {
      checkInvoiceStatus()
    }
  }, [invoiceId])

  const checkInvoiceStatus = async () => {
    try {
      const data = await apiFetch(`/finance/subscriptions/${invoiceId}`)
      if (data.status === 'PAID') {
        setError("This invoice has already been settled.")
        setTimeout(() => router.push('/super_admin/finance/ledger'), 3000)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to verify status of invoice:', error)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.invoiceId.trim()) return setError("Invoice ID is required")
    if (!formData.transactionId.trim()) return setError("Transaction/Reference ID is required")
    if (parseFloat(formData.amount) <= 0) return setError("A valid payment amount is required")

    setIsSubmitting(true)
    setError(null)
    try {
      const endpoint = `/finance/subscriptions/${formData.invoiceId}/pay`
      const data = await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId
        }),
      })

      setSuccess(`Payment recorded successfully for invoice ${formData.invoiceId}!`)
      setTimeout(() => router.push("/super_admin/finance/subscriptions"), 2000)
    } catch (err: any) {
      console.error(err)
      // Fallback check for flatter route pattern
      if (err.message?.includes('404')) {
        try {
          await apiFetch(`/subscriptions/${formData.invoiceId}/pay`, {
            method: "PATCH",
            body: JSON.stringify({
              paymentMethod: formData.paymentMethod,
              transactionId: formData.transactionId
            }),
          })
          setSuccess(`Payment recorded via fallback route for invoice ${formData.invoiceId}!`)
          setTimeout(() => router.push("/super_admin/finance/subscriptions"), 2000)
          return
        } catch (innerErr: any) {
          setError(innerErr.message || "Failed to record payment")
        }
      } else {
        setError(err.message || "Failed to record school payment")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-br from-blue-600/20 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Record Payment</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-blue-600">Manual Reconciliation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        {/* Context Information */}
        {invoiceId && (
          <Card className="p-5 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiBuildingLine className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-black uppercase tracking-tight">{schoolName}</p>
              </div>
              <p className="text-sm font-black text-blue-600">₹{amount}</p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-blue-500/10">
              <RiInformationLine className="w-3.5 h-3.5 text-blue-500/60" />
              <p className="text-[10px] font-medium text-blue-600/70">Recording payment for generated invoice node.</p>
            </div>
          </Card>
        )}

        {/* Status Messages */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in zoom-in-95 duration-300">
            <RiCheckLine className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm leading-tight">{typeof success === 'string' ? success : 'Payment Recorded'}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in shake-1 duration-300">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{typeof error === 'string' ? error : 'Reconciliation Error'}</p>
          </div>
        )}

        {/* Invoice ID */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <RiHashtag className="w-3.5 h-3.5 text-blue-500" /> Invoice Identifier
          </label>
          <input
            type="text"
            name="invoiceId"
            value={formData.invoiceId}
            onChange={handleChange}
            placeholder="e.g. cmoth3zqg000..."
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-background outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Payment Amount */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <RiMoneyDollarCircleLine className="w-3.5 h-3.5 text-blue-500" /> Payment Amount (₹)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-background outline-none transition-all"
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <RiBankCardLine className="w-3.5 h-3.5 text-blue-500" /> Settlement Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-background outline-none transition-all appearance-none"
          >
            {PAYMENT_METHODS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Transaction ID */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <RiMoneyDollarBoxLine className="w-3.5 h-3.5 text-blue-500" /> Transaction Reference
          </label>
          <input
            type="text"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            placeholder="TXN-98234-AXZ"
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-background outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !!success}
            className="w-full h-16 rounded-[2rem] font-black text-base shadow-2xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? (
              <RiLoader4Line className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <RiShieldCheckLine className="w-6 h-6" />
                Commit Reconciliation
              </>
            )}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground font-bold mt-6 uppercase tracking-[0.2em] opacity-40">
            Nexus Global Settlement Protocol v1.0
          </p>
        </div>
      </form>
    </div>
  )
}

export default function RecordPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RiLoader4Line className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Payment Form...</p>
        </div>
      </div>
    }>
      <RecordPaymentPageContent />
    </Suspense>
  )
}
