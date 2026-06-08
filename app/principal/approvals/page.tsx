"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { 
  RiCheckLine, 
  RiCloseLine, 
  RiUserSmileLine, 
  RiTimeLine 
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await apiFetch("/approvals/profile")
      setRequests(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiFetch(`/approvals/profile/${id}/${action}`, { method: 'POST' })
      setRequests(prev => prev.filter(req => req.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to process request")
    }
  }

  if (loading) {
    return <div className="p-8 text-center"><RiTimeLine className="mx-auto animate-spin" /></div>
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Approvals</h1>
        <p className="text-zinc-500">Review pending profile change requests from students and teachers.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border shadow-sm">
          <RiCheckLine className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold">All caught up!</h2>
          <p className="text-zinc-500">There are no pending approval requests.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                  {req.user?.photoUrl ? (
                    <img src={req.user.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <RiUserSmileLine className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{req.user?.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="capitalize">{req.user?.role?.toLowerCase()}</span>
                    <span>•</span>
                    <span>{format(new Date(req.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    {req.requestedName && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Requested Name:</span> <span className="font-medium text-emerald-600">{req.requestedName}</span>
                      </div>
                    )}
                    {req.requestedPhoneNo && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Requested Phone:</span> <span className="font-medium text-emerald-600">{req.requestedPhoneNo}</span>
                      </div>
                    )}
                    {req.requestedQualification && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Requested Qualification:</span> <span className="font-medium text-emerald-600">{req.requestedQualification}</span>
                      </div>
                    )}
                    {req.requestedSpecilization && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Requested Specialization:</span> <span className="font-medium text-emerald-600">{req.requestedSpecilization}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={() => handleAction(req.id, 'reject')}
                >
                  <RiCloseLine className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleAction(req.id, 'approve')}
                >
                  <RiCheckLine className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
