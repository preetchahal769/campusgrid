"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RiCoinsLine, 
  RiArrowLeftLine, 
  RiFileList3Line, 
  RiAddLine, 
  RiLoader4Line,
  RiCheckLine,
  RiInformationLine,
  RiFileTextLine
} from "@remixicon/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PrincipalFeesPage() {
  const { user } = useAppSelector((state) => state.auth)
  const [grades, setGrades] = useState<any[]>([])
  const [myBills, setMyBills] = useState<any[]>([])
  
  // Fee template form state
  const [selectedGradeId, setSelectedGradeId] = useState("")
  const [feeName, setFeeName] = useState("")
  const [feeAmount, setFeeAmount] = useState("")
  
  // Bill generation state
  const [genGradeId, setGenGradeId] = useState("")
  const [genMonth, setGenMonth] = useState("")

  const [loading, setLoading] = useState(true)
  const [submittingTemplate, setSubmittingTemplate] = useState(false)
  const [generatingBills, setGeneratingBills] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gradesList, bills] = await Promise.all([
          apiFetch("/academics/grades"),
          apiFetch("/finance/subscriptions/my-bills")
        ])
        setGrades(gradesList)
        setMyBills(bills)
        if (gradesList.length > 0) {
          setSelectedGradeId(gradesList[0].id)
          setGenGradeId(gradesList[0].id)
        }
      } catch (err) {
        console.error("Failed to load school finances:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSaveStructure = async () => {
    if (!selectedGradeId || !feeName || !feeAmount) {
      alert("Please fill in all template fields")
      return
    }
    setSubmittingTemplate(true)
    try {
      await apiFetch("/finance/fees/structure", {
        method: "POST",
        body: JSON.stringify({
          gradeId: selectedGradeId,
          name: feeName,
          amount: parseFloat(feeAmount),
          frequency: "MONTHLY",
          School_id: user?.School_id || ""
        })
      })
      alert("Fee template saved successfully!")
      setFeeName("")
      setFeeAmount("")
    } catch (err: any) {
      alert(err.message || "Failed to save fee template")
    } finally {
      setSubmittingTemplate(false)
    }
  }

  const handleGenerateBills = async () => {
    if (!genGradeId || !genMonth) {
      alert("Please select both a class and month")
      return
    }
    setGeneratingBills(true)
    try {
      const data = await apiFetch("/finance/fees/generate-bills", {
        method: "POST",
        body: JSON.stringify({
          gradeId: genGradeId,
          month: genMonth
        })
      })
      alert(`Successfully generated fee bills for ${data.length} students!`)
      setGenMonth("")
    } catch (err: any) {
      alert(err.message || "Failed to generate bills")
    } finally {
      setGeneratingBills(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
        <RiLoader4Line className="w-12 h-12 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 relative z-0 text-foreground">
      {/* Sweeping Header Background */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Header */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <Link href="/principal" className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white">
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">SaaS & Fee Collections</h1>
          <p className="text-xs text-white/70 font-medium">Subscription Invoices & Templates</p>
        </div>
      </div>

      <div className="px-5 space-y-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* School Subscription Invoices Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Your Monthly SaaS Bills</h2>
          {myBills.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 rounded-3xl border border-dashed border-border/60">
              <RiFileList3Line className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs font-medium text-muted-foreground">No subscription invoices generated yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBills.map((bill) => (
                <Card key={bill.id} className="p-4 rounded-2xl border-border/40 shadow-sm bg-background/60 backdrop-blur-md flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold font-mono text-primary">{bill.invoiceId || bill.id}</p>
                    <p className="text-xs text-muted-foreground font-semibold">Month: {bill.month} • {bill.studentCount} students</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">₹{bill.amountDue}</p>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-wider",
                      bill.status === "PAID" ? "text-emerald-600" : "text-amber-600 animate-pulse"
                    )}>
                      {bill.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Configure Fee Structures */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Class Fee Structures</h2>
          <Card className="p-5 rounded-[2rem] bg-background/60 backdrop-blur-md border-border/40 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Class/Grade</label>
              <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border/50 text-xs font-semibold">
                  <SelectValue placeholder="Choose Class" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                  {grades.map(g => (
                    <SelectItem key={g.id} value={g.id} className="text-xs font-semibold cursor-pointer">
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Template Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Tuition Fee"
                  value={feeName}
                  onChange={(e) => setFeeName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Monthly Cost (INR)</label>
                <input 
                  type="number"
                  placeholder="e.g. 2500"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveStructure}
              disabled={submittingTemplate}
              className="w-full rounded-xl h-11 font-bold bg-primary text-white gap-2"
            >
              {submittingTemplate ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiAddLine className="w-4 h-4" />}
              Save Template
            </Button>
          </Card>
        </section>

        {/* Generate Student Bills */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Generate Monthly Student Bills</h2>
          <Card className="p-5 rounded-[2rem] bg-background/60 backdrop-blur-md border-border/40 space-y-4">
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-2">
              <RiInformationLine className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700/80 leading-relaxed font-semibold">
                Generating bills automatically aggregates all monthly template charges defined for the selected grade and creates invoice entries for each student.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Target Class</label>
                <Select value={genGradeId} onValueChange={setGenGradeId}>
                  <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border/50 text-xs font-semibold">
                    <SelectValue placeholder="Choose Class" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                    {grades.map(g => (
                      <SelectItem key={g.id} value={g.id} className="text-xs font-semibold cursor-pointer">
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">Billing Month</label>
                <input 
                  type="month"
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-background border border-border/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateBills}
              disabled={generatingBills}
              className="w-full rounded-xl h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {generatingBills ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCoinsLine className="w-4 h-4" />}
              Generate & Disburse Bills
            </Button>
          </Card>
        </section>

      </div>
    </div>
  )
}
