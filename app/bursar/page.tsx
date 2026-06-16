"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { 
  RiMoneyDollarCircleLine, 
  RiCoinsLine, 
  RiUserSettingsLine, 
  RiFileDownloadLine, 
  RiCheckDoubleLine, 
  RiUserSharedLine, 
  RiCalendarCheckLine,
  RiAddCircleLine,
  RiLoader4Line
} from "@remixicon/react"

interface Grade {
  id: string
  name: string
}

interface FeeBill {
  id: string
  month: string
  amountDue: number
  status: string
  student: {
    rollNumber?: number
    users: {
      name: string
    }
  }
}

interface PayrollRecord {
  id: string
  month: string
  baseSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: string
  paidAt?: string
  user: {
    name: string
    role: string
  }
}

export default function BursarDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  
  const currentTab = searchParams.get("tab") || "overview"
  
  const toast = {
    error: (msg: string) => alert(`Error: ${msg}`),
    success: (msg: string) => alert(`Success: ${msg}`)
  }

  // Loaded states
  const [grades, setGrades] = useState<Grade[]>([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [bills, setBills] = useState<FeeBill[]>([])
  const [loadingBills, setLoadingBills] = useState(false)
  
  // Fee template form state
  const [selectedGradeId, setSelectedGradeId] = useState("")
  const [feeName, setFeeName] = useState("")
  const [feeAmount, setFeeAmount] = useState("")
  const [savingTemplate, setSavingTemplate] = useState(false)
  
  // Bill generation state
  const [genGradeId, setGenGradeId] = useState("")
  const [genMonth, setGenMonth] = useState("")
  const [generatingBills, setGeneratingBills] = useState(false)

  // Payroll state
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])
  const [payrollMonth, setPayrollMonth] = useState("2026-06")
  const [loadingPayroll, setLoadingPayroll] = useState(false)
  const [generatingPayroll, setGeneratingPayroll] = useState(false)

  // Configure salary state
  const [targetUserEmail, setTargetUserEmail] = useState("")
  const [baseSalary, setBaseSalary] = useState("")
  const [allowances, setAllowances] = useState("")
  const [deductions, setDeductions] = useState("")
  const [savingSalary, setSavingSalary] = useState(false)

  // 1. Initial Load
  useEffect(() => {
    async function loadData() {
      setLoadingGrades(true)
      try {
        const gradesData = await apiFetch("/academics/grades")
        setGrades(gradesData)
        if (gradesData.length > 0) {
          setSelectedGradeId(gradesData[0].id)
          setGenGradeId(gradesData[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingGrades(false)
      }
    }
    loadData()
  }, [])

  // 2. Load lists depending on active tab
  useEffect(() => {
    if (currentTab === "fees") {
      loadAllBills()
    } else if (currentTab === "payroll") {
      loadPayroll()
    }
  }, [currentTab, payrollMonth])

  const loadAllBills = async () => {
    setLoadingBills(true)
    try {
      // Query recent student bills
      // In this setup, we fallback to mock list if not loaded or empty
      const data = await apiFetch("/finance/fees/student/all").catch(() => [])
      setBills(data)
    } catch (err) {
      // Ignore
    } finally {
      setLoadingBills(false)
    }
  }

  const loadPayroll = async () => {
    setLoadingPayroll(true)
    try {
      const data = await apiFetch(`/finance/payroll?month=${payrollMonth}`)
      setPayrolls(data)
    } catch (err) {
      // Fallback to empty if not generated yet
      setPayrolls([])
    } finally {
      setLoadingPayroll(false)
    }
  }

  // Form actions
  const handleSaveFeeTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGradeId || !feeName || !feeAmount) {
      toast.error("All template fields are required")
      return
    }
    setSavingTemplate(true)
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
      toast.success("Fee template saved successfully!")
      setFeeName("")
      setFeeAmount("")
    } catch (err: any) {
      toast.error(err.message || "Failed to save template")
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleGenerateBills = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genGradeId || !genMonth) {
      toast.error("Please specify both a target class and month")
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
      toast.success(`Generated fee bills for ${data.length} students!`)
      setGenMonth("")
      loadAllBills()
    } catch (err: any) {
      toast.error(err.message || "Failed to generate monthly bills")
    } finally {
      setGeneratingBills(false)
    }
  }

  const handleConfigureSalary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUserEmail || !baseSalary) {
      toast.error("Employee email and base salary are required")
      return
    }
    setSavingSalary(true)
    try {
      // Find user by email
      const searchRes = await apiFetch(`/users/search?q=${targetUserEmail}&role=TEACHER`).catch(() => [])
      const matched = searchRes.find((u: any) => u.email === targetUserEmail) || searchRes[0]
      if (!matched) {
        toast.error("Could not find employee with that email")
        return
      }

      await apiFetch("/finance/payroll/structure", {
        method: "POST",
        body: JSON.stringify({
          userId: matched.id,
          baseSalary: parseFloat(baseSalary),
          allowances: parseFloat(allowances || "0"),
          deductions: parseFloat(deductions || "0")
        })
      })
      toast.success("Salary structure updated successfully!")
      setTargetUserEmail("")
      setBaseSalary("")
      setAllowances("")
      setDeductions("")
    } catch (err: any) {
      toast.error(err.message || "Failed to update salary configuration")
    } finally {
      setSavingSalary(false)
    }
  }

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneratingPayroll(true)
    try {
      await apiFetch("/finance/payroll/generate", {
        method: "POST",
        body: JSON.stringify({ month: payrollMonth })
      })
      toast.success(`Disbursed monthly payroll for ${payrollMonth}!`)
      loadPayroll()
    } catch (err: any) {
      toast.error(err.message || "Failed to generate monthly payroll")
    } finally {
      setGeneratingPayroll(false)
    }
  }

  const handlePaySalary = async (id: string) => {
    try {
      await apiFetch(`/finance/payroll/${id}/pay`, { method: "PATCH" })
      toast.success("Salary marked as paid successfully!")
      loadPayroll()
    } catch (err) {
      toast.error("Failed to pay salary")
    }
  }

  const handleDownloadPayslip = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/finance/payroll/${id}/slip`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cg_access_token')}`
        }
      })
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslip_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      toast.error("Failed to download salary slip PDF")
    }
  }

  const updateTab = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", tab)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner Profile Summary */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-teal-500/5 to-transparent border border-emerald-600/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <RiMoneyDollarCircleLine className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Financial Operations Ledger</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Bursar Account Portal — Managing Student Collections & Payroll
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-zinc-200 gap-6 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: RiCoinsLine },
          { id: "fees", label: "Fee Ledger & Billing", icon: RiUserSharedLine },
          { id: "payroll", label: "Staff & Teacher Payroll", icon: RiUserSettingsLine }
        ].map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => updateTab(tab.id)}
              className={`flex items-center gap-2 pb-4 font-bold text-sm tracking-tight border-b-2 transition-colors duration-300 ${
                isActive 
                  ? "border-emerald-600 text-emerald-600" 
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Fee Collections</span>
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><RiCoinsLine className="w-5 h-5" /></span>
                </div>
                <div>
                  <p className="text-3xl font-black text-zinc-900">$45,250.00</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">✓ Active Cycle 2026</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Student Dues</span>
                  <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><RiMoneyDollarCircleLine className="w-5 h-5" /></span>
                </div>
                <div>
                  <p className="text-3xl font-black text-zinc-900">$12,400.00</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">Due for generation month</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Salary Payout</span>
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><RiUserSettingsLine className="w-5 h-5" /></span>
                </div>
                <div>
                  <p className="text-3xl font-black text-zinc-900">$18,500.00</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">Total active structures</p>
                </div>
              </div>
            </div>

            {/* Custom Cashflow Trend Bar Chart */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Collection History Analytics (2026)</h3>
              <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 border-b border-zinc-100">
                {[
                  { month: "Jan", val: 80 },
                  { month: "Feb", val: 95 },
                  { month: "Mar", val: 70 },
                  { month: "Apr", val: 110 },
                  { month: "May", val: 120 },
                  { month: "Jun", val: 140 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      style={{ height: `${(item.val / 140) * 120}px` }} 
                      className="w-full bg-emerald-600/20 hover:bg-emerald-600 rounded-t-xl transition-all duration-300 relative group flex justify-center"
                    >
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-zinc-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-transform duration-200">
                        ${item.val * 350}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground mt-1">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEE LEDGER & INVOICING TAB */}
        {currentTab === "fees" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form 1: Save Fee Structure */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold tracking-tight">Configure Class Fee Templates</h3>
                <form onSubmit={handleSaveFeeTemplate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Class/Grade</label>
                    <select
                      value={selectedGradeId}
                      onChange={(e) => setSelectedGradeId(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      {grades.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Fee Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Tuition Fee"
                        value={feeName}
                        onChange={(e) => setFeeName(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Amount ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 450"
                        value={feeAmount}
                        onChange={(e) => setFeeAmount(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={savingTemplate}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                  >
                    {savingTemplate ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiAddCircleLine className="w-5 h-5" />}
                    Disburse Fee Rule
                  </button>
                </form>
              </div>

              {/* Form 2: Bulk Generate Invoices */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold tracking-tight">Bulk Generate Monthly Bills</h3>
                <form onSubmit={handleGenerateBills} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Target Class</label>
                      <select
                        value={genGradeId}
                        onChange={(e) => setGenGradeId(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                      >
                        {grades.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Billing Month</label>
                      <input
                        type="month"
                        value={genMonth}
                        onChange={(e) => setGenMonth(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={generatingBills}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition-colors"
                  >
                    {generatingBills ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiCoinsLine className="w-5 h-5" />}
                    Disburse Monthly Bills
                  </button>
                </form>
              </div>
            </div>

            {/* List of generated student invoices (recent view queue) */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold tracking-tight">Recent Disbursed Invoices</h3>
              
              {loadingBills ? (
                <div className="flex py-12 items-center justify-center">
                  <RiLoader4Line className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="ml-2 text-sm text-muted-foreground">Fetching records...</span>
                </div>
              ) : bills.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                  No fee bills generated yet for this period. Use the generator forms above to disburse tuition bills.
                </div>
              ) : (
                <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Billing Month</th>
                        <th className="px-6 py-4">Amount Due</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((b) => (
                        <tr key={b.id} className="border-b border-zinc-100 last:border-none text-sm font-semibold hover:bg-zinc-50/55 transition-colors">
                          <td className="px-6 py-4">{b.student.users.name}</td>
                          <td className="px-6 py-4">{b.month}</td>
                          <td className="px-6 py-4">${b.amountDue}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              b.status === "PAID" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                            }`}>{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAFF & TEACHER PAYROLL TAB */}
        {currentTab === "payroll" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form 1: Configure Employee Base Salary */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
                <h3 className="text-lg font-bold tracking-tight">Configure Salaries</h3>
                <form onSubmit={handleConfigureSalary} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Employee Email</label>
                    <input
                      type="email"
                      placeholder="teacher@school.edu"
                      value={targetUserEmail}
                      onChange={(e) => setTargetUserEmail(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Base Salary ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 3200"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Allowances ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 200"
                        value={allowances}
                        onChange={(e) => setAllowances(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Deductions ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={deductions}
                        onChange={(e) => setDeductions(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={savingSalary}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                  >
                    {savingSalary ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiAddCircleLine className="w-5 h-5" />}
                    Save Structure
                  </button>
                </form>
              </div>

              {/* Form 2: Bulk Generate Monthly Payroll */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
                <h3 className="text-lg font-bold tracking-tight">Payroll Disbursement & Search</h3>
                
                <form onSubmit={handleGeneratePayroll} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                  <div className="flex-1 space-y-1 w-full">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Target Billing Month</label>
                    <input
                      type="month"
                      value={payrollMonth}
                      onChange={(e) => setPayrollMonth(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={generatingPayroll}
                    className="h-11 px-6 bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition-colors shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center"
                  >
                    {generatingPayroll ? (
                      <RiLoader4Line className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <RiCoinsLine className="w-5 h-5" />
                        Disburse Monthly Payroll
                      </>
                    )}
                  </button>
                </form>

                {/* Payroll Table */}
                {loadingPayroll ? (
                  <div className="flex py-12 items-center justify-center">
                    <RiLoader4Line className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="ml-2 text-sm text-muted-foreground">Checking payroll directory...</span>
                  </div>
                ) : payrolls.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                    No payroll entries generated for {payrollMonth} yet. Use the disbursement button to run payroll.
                  </div>
                ) : (
                  <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Employee</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4 text-center">Net Payout</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrolls.map((p) => (
                          <tr key={p.id} className="border-b border-zinc-100 last:border-none text-sm font-semibold hover:bg-zinc-50/55 transition-colors">
                            <td className="px-6 py-4">{p.user.name}</td>
                            <td className="px-6 py-4 text-xs font-bold text-muted-foreground">{p.user.role}</td>
                            <td className="px-6 py-4 text-center">${p.netSalary}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                p.status === "PAID" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                              }`}>{p.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {p.status === "PAID" ? (
                                <button
                                  onClick={() => handleDownloadPayslip(p.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                                >
                                  <RiFileDownloadLine className="w-4 h-4" />
                                  Payslip
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePaySalary(p.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm transition-colors"
                                >
                                  Mark Paid
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
