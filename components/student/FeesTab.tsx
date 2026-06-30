"use client"

import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { Badge, ORANGE, INDIGO } from "@/components/layout/DashboardLayout"
import { DollarSign, CheckCircle2, AlertCircle, Calendar } from "lucide-react"

const GET_STUDENT_FEES = gql`
  query GetStudentFees {
    studentFees {
      id
      month
      amountDue
      amountPaid
      status
      dueDate
      paidAt
    }
  }
`

export function FeesTab() {
  const { data, loading: isLoading, error } = useQuery<any>(GET_STUDENT_FEES)
  const bills = data?.studentFees || []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-5 h-24 animate-pulse flex justify-between items-center">
            <div className="space-y-2 w-1/3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-8 bg-gray-200 rounded-full w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <p className="text-sm font-semibold text-red-500">Failed to load fee information.</p>
      </div>
    )
  }

  const unpaidBills = bills.filter((b: any) => b.status === "PENDING" || b.status === "UNPAID")
  const paidBills = bills.filter((b: any) => b.status === "PAID" || b.status === "SUCCESS")

  const totalOutstanding = unpaidBills.reduce((acc: number, curr: any) => acc + (curr.amountDue - curr.amountPaid), 0)

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-[#c84b1a] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Outstanding Balance</p>
            <p className="text-xl font-black text-gray-900">${totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
        {totalOutstanding === 0 && (
          <Badge text="Fully Paid" variant="green" />
        )}
      </div>

      {/* Unpaid / Pending Bills */}
      {unpaidBills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 tracking-wider">OUTSTANDING BILLS</h3>
          {unpaidBills.map((bill: any) => {
            const amountLeft = bill.amountDue - bill.amountPaid
            return (
              <div key={bill.id} className="bg-white rounded-2xl border border-red-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{bill.month}</p>
                    <p className="text-xs text-gray-500">
                      Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : "Immediate"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">${amountLeft.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">Total: ${bill.amountDue.toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paid Bills History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 tracking-wider">PAYMENT HISTORY</h3>
        {paidBills.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No payment history found</p>
        ) : (
          paidBills.map((bill: any) => (
            <div key={bill.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{bill.month}</p>
                  <p className="text-xs text-gray-500">
                    Paid on: {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">${bill.amountPaid.toLocaleString()}</p>
                <Badge text="Paid" variant="green" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
