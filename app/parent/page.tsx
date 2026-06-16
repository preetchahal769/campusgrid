"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { 
  RiUserStarLine, 
  RiCalendarCheckLine, 
  RiMoneyDollarCircleLine, 
  RiBookmarkLine, 
  RiFileTextLine, 
  RiFileDownloadLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiAddCircleLine,
  RiLoader4Line
} from "@remixicon/react"

interface ChildInfo {
  id: string
  rollNumber?: number
  section: {
    id: string
    name: string
    grade: {
      id: string
      name: string
    }
  }
  users: {
    name: string
    photoUrl?: string
  }
}

interface UserProfile {
  id: string
  name: string
  email: string
  parent?: {
    id: string
    students?: ChildInfo
  }[]
}

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED"
}

interface FeeBill {
  id: string
  month: string
  amountDue: number
  amountPaid: number
  status: "PENDING" | "PAID" | "OVERDUE"
  paidAt?: string
}

interface Exam {
  id: string
  title: string
  term: string
}

interface ExamResult {
  id: string
  obtainedMarks: number
  remarks?: string
  grade?: string
  examSchedule: {
    maxMarks: number
    passMarks?: number
    subject: {
      name: string
      code?: string
    }
  }
}

export default function ParentDashboard() {
  const toast = {
    error: (msg: string) => alert(`Error: ${msg}`),
    success: (msg: string) => alert(`Success: ${msg}`)
  }
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  
  const currentTab = searchParams.get("tab") || "overview"
  
  // States
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(false)
  const [bills, setBills] = useState<FeeBill[]>([])
  const [loadingBills, setLoadingBills] = useState(false)
  
  // Academics state
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>("")
  const [results, setResults] = useState<ExamResult[]>([])
  const [loadingResults, setLoadingResults] = useState(false)
  
  // Payment dialog state
  const [payingBill, setPayingBill] = useState<FeeBill | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
  // New leave form state
  const [leaveStart, setLeaveStart] = useState("")
  const [leaveEnd, setLeaveEnd] = useState("")
  const [leaveReason, setLeaveReason] = useState("")
  const [submittingLeave, setSubmittingLeave] = useState(false)

  const child = profile?.parent?.[0]?.students
  const childName = child?.users?.name || "Your Child"
  const childId = child?.id

  // 1. Load Profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiFetch("/users/me")
        setProfile(data)
      } catch (err: any) {
        toast.error("Failed to load parent profile information")
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [])

  // 2. Load Leaves & Bills when relevant tabs are focused
  useEffect(() => {
    if (!childId) return

    if (currentTab === "leaves") {
      loadLeaves()
    } else if (currentTab === "fees") {
      loadBills()
    } else if (currentTab === "academics") {
      loadExams()
    }
  }, [currentTab, childId])

  const loadLeaves = async () => {
    setLoadingLeaves(true)
    try {
      const data = await apiFetch("/academics/leaves")
      setLeaves(data)
    } catch (err) {
      toast.error("Failed to load leave history")
    } finally {
      setLoadingLeaves(false)
    }
  }

  const loadBills = async () => {
    setLoadingBills(true)
    try {
      const data = await apiFetch(`/finance/fees/student/${childId}`)
      setBills(data)
    } catch (err) {
      toast.error("Failed to load student bills")
    } finally {
      setLoadingBills(false)
    }
  }

  const loadExams = async () => {
    try {
      const examData = await apiFetch(`/academics/exams?schoolId=${profile?.parent?.[0]?.students?.section?.grade?.id || ""}`)
      setExams(examData)
      if (examData.length > 0) {
        setSelectedExamId(examData[0].id)
      }
    } catch (err) {
      toast.error("Failed to load school exams")
    }
  }

  // Load results when exam changes
  useEffect(() => {
    if (!selectedExamId || !childId) return
    async function fetchResults() {
      setLoadingResults(true)
      try {
        const data = await apiFetch(`/academics/exams/${selectedExamId}/report-card/${childId}`)
        setResults(data?.results || [])
      } catch (err) {
        toast.error("Failed to load grading details")
      } finally {
        setLoadingResults(false)
      }
    }
    fetchResults()
  }, [selectedExamId, childId])

  // Actions
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaveStart || !leaveEnd || !leaveReason) {
      toast.error("All leave fields are required")
      return
    }

    setSubmittingLeave(true)
    try {
      await apiFetch("/academics/leaves", {
        method: "POST",
        body: JSON.stringify({
          startDate: leaveStart,
          endDate: leaveEnd,
          reason: leaveReason
        })
      })
      toast.success("Leave request submitted successfully")
      setLeaveStart("")
      setLeaveEnd("")
      setLeaveReason("")
      loadLeaves()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request")
    } finally {
      setSubmittingLeave(false)
    }
  }

  const handlePayInvoice = async () => {
    if (!payingBill) return
    setIsProcessingPayment(true)
    try {
      await apiFetch(`/finance/fees/bills/${payingBill.id}/pay`, {
        method: "PATCH",
        body: JSON.stringify({ amount: payingBill.amountDue })
      })
      toast.success(`Fee bill for ${payingBill.month} paid successfully!`)
      setPayingBill(null)
      loadBills()
    } catch (err) {
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleDownloadReceipt = async (billId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/finance/fees/bills/${billId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cg_access_token')}`
        }
      })
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt_${billId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      toast.error("Failed to download PDF receipt")
    }
  }

  const handleDownloadReportCard = async () => {
    if (!selectedExamId || !childId) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/academics/exams/${selectedExamId}/report-card/${childId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cg_access_token')}`
        }
      })
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_card_${selectedExamId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      toast.error("Failed to download report card PDF")
    }
  }

  const updateTab = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", tab)
    router.push(`?${params.toString()}`)
  }

  if (loadingProfile) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 font-medium text-muted-foreground">Syncing parent dashboard...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner Profile Summary */}
      <div className="bg-gradient-to-r from-primary/10 via-[#0A4EA6]/5 to-transparent border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0A4EA6] text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <RiUserStarLine className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Parent Portal</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Monitoring <strong className="text-zinc-900 font-bold">{childName}</strong> — {child?.section?.grade?.name} {child?.section?.name} (Roll #{child?.rollNumber || "N/A"})
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-zinc-200 gap-6 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: RiBookmarkLine },
          { id: "academics", label: "Academics & Grades", icon: RiFileTextLine },
          { id: "fees", label: "Fees & Billing", icon: RiMoneyDollarCircleLine },
          { id: "leaves", label: "Apply Leave", icon: RiCalendarCheckLine }
        ].map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => updateTab(tab.id)}
              className={`flex items-center gap-2 pb-4 font-bold text-sm tracking-tight border-b-2 transition-colors duration-300 ${
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-zinc-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content Render */}
      <div className="min-h-[350px]">
        {/* OVERVIEW TAB */}
        {currentTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Card 1: Attendance Summary */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attendance</span>
                <span className="p-2 rounded-xl bg-green-50 text-green-600"><RiCalendarCheckLine className="w-5 h-5" /></span>
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-900">94.5%</p>
                <p className="text-xs font-semibold text-green-600 mt-1">✓ Good standing</p>
              </div>
            </div>

            {/* Quick Card 2: GPA */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Performance Score</span>
                <span className="p-2 rounded-xl bg-blue-50 text-[#0A4EA6]"><RiUserStarLine className="w-5 h-5" /></span>
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-900">A (3.84 GPA)</p>
                <p className="text-xs font-semibold text-muted-foreground mt-1">Class rank: Top 10%</p>
              </div>
            </div>

            {/* Quick Card 3: Notifications */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fee Status</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><RiMoneyDollarCircleLine className="w-5 h-5" /></span>
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-900">Up to date</p>
                <p className="text-xs font-semibold text-muted-foreground mt-1">All invoices paid</p>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMICS & GRADES TAB */}
        {currentTab === "academics" && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Exam Report Cards</h3>
                <p className="text-xs text-muted-foreground">Select an exam term to view detailed grade reports and grades.</p>
              </div>
              {exams.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="border border-zinc-200 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-primary bg-white"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title} ({ex.term})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleDownloadReportCard}
                    className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2 text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/95 transition-colors"
                  >
                    <RiFileDownloadLine className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            {loadingResults ? (
              <div className="flex py-12 items-center justify-center">
                <RiLoader4Line className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Compiling grade sheet...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                No grading results uploaded yet for this exam term.
              </div>
            ) : (
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4 text-center">Marks Obtained</th>
                      <th className="px-6 py-4 text-center">Grade</th>
                      <th className="px-6 py-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res) => (
                      <tr key={res.id} className="border-b border-zinc-100 last:border-none text-sm font-semibold hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">{res.examSchedule.subject.name}</td>
                        <td className="px-6 py-4 text-center">{res.obtainedMarks} / {res.examSchedule.maxMarks}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                            {res.grade || "A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-normal">{res.remarks || "Satisfactory progress"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FEES & BILLING TAB */}
        {currentTab === "fees" && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Tuition & Operations Invoices</h3>
              <p className="text-xs text-muted-foreground">Audit, verify, and complete monthly payments for school services.</p>
            </div>

            {loadingBills ? (
              <div className="flex py-12 items-center justify-center">
                <RiLoader4Line className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Fetching ledger...</span>
              </div>
            ) : bills.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                No fee invoices generated yet for this student.
              </div>
            ) : (
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-4">Billing Month</th>
                      <th className="px-6 py-4">Amount Due</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-zinc-100 last:border-none text-sm font-semibold hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">{bill.month}</td>
                        <td className="px-6 py-4">${bill.amountDue}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            bill.status === "PAID" 
                              ? "bg-green-50 text-green-600" 
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {bill.status === "PAID" ? (
                            <button
                              onClick={() => handleDownloadReceipt(bill.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                            >
                              <RiFileDownloadLine className="w-4 h-4" />
                              Receipt
                            </button>
                          ) : (
                            <button
                              onClick={() => setPayingBill(bill)}
                              className="bg-[#0A4EA6] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#083E84] transition-colors shadow-sm"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* APPLY LEAVE TAB */}
        {currentTab === "leaves" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Application Form */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
              <h3 className="text-lg font-bold tracking-tight">Apply Leave</h3>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter reason for leave..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="w-full flex items-center justify-center gap-2 bg-[#0A4EA6] text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-primary/20 hover:bg-[#083E84] transition-colors"
                >
                  {submittingLeave ? (
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <RiAddCircleLine className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* History logs */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="text-lg font-bold tracking-tight">Leave Log History</h3>
              
              {loadingLeaves ? (
                <div className="flex py-12 items-center justify-center">
                  <RiLoader4Line className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading request registry...</span>
                </div>
              ) : leaves.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                  No leave requests submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {leaves.map((lv) => (
                    <div key={lv.id} className="border border-zinc-100 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-bold">
                          {new Date(lv.startDate).toLocaleDateString()} – {new Date(lv.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">{lv.reason}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        lv.status === "APPROVED" 
                          ? "bg-green-50 text-green-600"
                          : lv.status === "PENDING"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {lv.status === "APPROVED" && <RiCheckDoubleLine className="w-3.5 h-3.5" />}
                        {lv.status === "PENDING" && <RiTimeLine className="w-3.5 h-3.5" />}
                        {lv.status === "REJECTED" && <RiCloseCircleLine className="w-3.5 h-3.5" />}
                        {lv.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MOCK PAYMENT OVERLAY DIALOG */}
      {payingBill && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-100 w-full max-w-[420px] rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <RiMoneyDollarCircleLine className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black tracking-tight">Complete Payment</h4>
              <p className="text-xs text-muted-foreground font-medium">Fee Bill for {payingBill.month} — Total Amount: ${payingBill.amountDue}</p>
            </div>

            <div className="space-y-4">
              <div className="border border-zinc-100 bg-zinc-50 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Payment Method</p>
                <p className="text-lg font-black text-primary mt-1">Mock Credit/Debit Card</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Card Details</label>
                <div className="border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-sm font-semibold text-muted-foreground text-center">
                  •••• •••• •••• 4242 (Demo Mode)
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPayingBill(null)}
                disabled={isProcessingPayment}
                className="flex-1 border border-zinc-200 rounded-xl py-3 text-sm font-bold text-muted-foreground hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayInvoice}
                disabled={isProcessingPayment}
                className="flex-1 bg-[#0A4EA6] text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-primary/20 hover:bg-[#083E84] transition-colors flex items-center justify-center gap-1.5"
              >
                {isProcessingPayment ? (
                  <RiLoader4Line className="w-5 h-5 animate-spin" />
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
