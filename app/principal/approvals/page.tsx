"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { 
  RiCheckLine, 
  RiCloseLine, 
  RiUserSmileLine, 
  RiTimeLine,
  RiInboxArchiveLine,
  RiUserSettingsLine,
  RiFoldersLine,
  RiArrowRightLine,
  RiLoader4Line
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface ProfileRequest {
  id: string
  userId: string
  requestedName?: string
  requestedPhoneNo?: string
  requestedQualification?: string
  requestedSpecilization?: string
  status: string
  createdAt: string
  user?: {
    name: string
    role: string
    photoUrl?: string
  }
}

interface ApprovalTask {
  id: string
  module: string
  action: string
  payload: any
  status: string
  createdAt: string
  creator?: {
    name: string
    email: string
    role: string
  }
}

interface StagedRecord {
  id: string
  studentName: string
  parentPhone: string
  className: string
  rollNo?: number | null
}

interface StagedBatch {
  id: string
  fileName: string
  recordCount: number
  createdAt: string
  records: StagedRecord[]
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "tasks">("profile")
  const [profileRequests, setProfileRequests] = useState<ProfileRequest[]>([])
  const [approvalTasks, setApprovalTasks] = useState<ApprovalTask[]>([])
  const [loading, setLoading] = useState(true)

  // Inspector state
  const [inspectingTask, setInspectingTask] = useState<ApprovalTask | null>(null)
  const [inspectingBatch, setInspectingBatch] = useState<StagedBatch | null>(null)
  const [batchLoading, setBatchLoading] = useState(false)
  const [submittingAction, setSubmittingAction] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [profileData, tasksData] = await Promise.all([
        apiFetch("/approvals/profile").catch(() => []),
        apiFetch("/approvals/profile/tasks").catch(() => [])
      ])
      setProfileRequests(profileData)
      setApprovalTasks(tasksData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChangeAction = async (id: string, action: "approve" | "reject") => {
    try {
      await apiFetch(`/approvals/profile/${id}/${action}`, { method: "POST" })
      setProfileRequests(prev => prev.filter(req => req.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to process request")
    }
  }

  const inspectTaskDetails = async (task: ApprovalTask) => {
    setInspectingTask(task)
    if (task.module === "ONBOARDING" && task.payload?.batchId) {
      setBatchLoading(true)
      try {
        const batchData = await apiFetch(`/onboarding/batches/${task.payload.batchId}`)
        setInspectingBatch(batchData)
      } catch (err) {
        console.error("Failed to load batch details", err)
        alert("Failed to fetch batch onboarding details")
      } finally {
        setBatchLoading(false)
      }
    } else {
      setInspectingBatch(null)
    }
  }

  const handleTaskAction = async (taskId: string, status: "APPROVED" | "REJECTED") => {
    setSubmittingAction(true)
    try {
      await apiFetch(`/approvals/profile/tasks/${taskId}`, {
        method: "POST",
        body: JSON.stringify({ status })
      })
      setApprovalTasks(prev => prev.filter(t => t.id !== taskId))
      setInspectingTask(null)
      setInspectingBatch(null)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to process task action")
    } finally {
      setSubmittingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[400px] flex items-center justify-center">
        <RiTimeLine className="mx-auto animate-spin text-violet-600 w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-violet-600/10 via-purple-500/5 to-transparent border border-violet-600/10 rounded-3xl p-6">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
          <RiInboxArchiveLine className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Approvals Command Center</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Review and authorization desk for administrative batches and profile changes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-100 pb-px">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <RiUserSettingsLine className="w-4 h-4" />
          Profile Changes
          {profileRequests.length > 0 && (
            <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {profileRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "tasks"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <RiFoldersLine className="w-4 h-4" />
          Administrative Batches
          {approvalTasks.length > 0 && (
            <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {approvalTasks.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Inbox List */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "profile" ? (
            profileRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-100 shadow-sm">
                <RiCheckLine className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-zinc-900">All caught up!</h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">There are no pending profile change requests.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {profileRequests.map(req => (
                  <div key={req.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                        {req.user?.photoUrl ? (
                          <img src={req.user.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <RiUserSmileLine className="w-6 h-6 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-zinc-900">{req.user?.name}</h3>
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-0.5">
                          <span className="capitalize">{req.user?.role?.toLowerCase()}</span>
                          <span>•</span>
                          <span>{format(new Date(req.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        
                        <div className="mt-3 space-y-1">
                          {req.requestedName && (
                            <div className="text-xs font-semibold">
                              <span className="text-zinc-400">Name:</span> <span className="font-bold text-zinc-900">{req.requestedName}</span>
                            </div>
                          )}
                          {req.requestedPhoneNo && (
                            <div className="text-xs font-semibold">
                              <span className="text-zinc-400">Phone:</span> <span className="font-bold text-zinc-900">{req.requestedPhoneNo}</span>
                            </div>
                          )}
                          {req.requestedQualification && (
                            <div className="text-xs font-semibold">
                              <span className="text-zinc-400">Qualification:</span> <span className="font-bold text-zinc-900">{req.requestedQualification}</span>
                            </div>
                          )}
                          {req.requestedSpecilization && (
                            <div className="text-xs font-semibold">
                              <span className="text-zinc-400">Specialization:</span> <span className="font-bold text-zinc-900">{req.requestedSpecilization}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button 
                        variant="outline" 
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-zinc-200"
                        onClick={() => handleProfileChangeAction(req.id, 'reject')}
                      >
                        <RiCloseLine className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleProfileChangeAction(req.id, 'approve')}
                      >
                        <RiCheckLine className="w-4 h-4 mr-1.5" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            approvalTasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-100 shadow-sm">
                <RiCheckLine className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-zinc-900">No batch actions!</h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">All onboarding batches and approvals are clean.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {approvalTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => inspectTaskDetails(task)}
                    className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm ${
                      inspectingTask?.id === task.id
                        ? "border-violet-600 ring-2 ring-violet-600/10"
                        : "border-zinc-100 hover:border-zinc-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-violet-50 text-violet-700 border border-violet-100">
                          {task.module}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          {task.action.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-zinc-900 mt-2">
                        {task.module === "ONBOARDING" ? "Student Upload Batch" : "Approval Task"}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-1">
                        <span>By {task.creator?.name} ({task.creator?.role?.toLowerCase()})</span>
                        <span>•</span>
                        <span>{format(new Date(task.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>

                    <RiArrowRightLine className={`w-5 h-5 text-zinc-400 transition-transform ${inspectingTask?.id === task.id ? "translate-x-1 text-violet-600" : ""}`} />
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Right side: Inspector Panel */}
        <div className="bg-zinc-50/50 border border-zinc-100 rounded-3xl p-6 h-fit min-h-[300px] flex flex-col justify-between">
          {inspectingTask ? (
            <div className="flex flex-col justify-between h-full space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inspector Desk</span>
                  <button onClick={() => { setInspectingTask(null); setInspectingBatch(null); }} className="text-zinc-400 hover:text-zinc-600">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>

                <div className="border-b border-zinc-100 pb-3">
                  <h4 className="font-bold text-zinc-900 text-lg">Onboarding Batch Audit</h4>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Uploaded file: <span className="font-bold text-zinc-700">{inspectingBatch?.fileName || "Loading..."}</span>
                  </p>
                </div>

                {batchLoading ? (
                  <div className="py-12 text-center text-xs font-semibold text-muted-foreground flex flex-col items-center gap-2">
                    <RiLoader4Line className="w-6 h-6 animate-spin text-violet-600" />
                    Fetching batch details...
                  </div>
                ) : inspectingBatch ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-zinc-400">Total Student Profiles:</span>
                      <span className="font-bold text-zinc-900">{inspectingBatch.recordCount}</span>
                    </div>

                    <div className="border border-zinc-100 rounded-xl overflow-hidden text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-100 font-bold text-muted-foreground">
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">Class</th>
                            <th className="px-3 py-2">Parent Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inspectingBatch.records.map((rec) => (
                            <tr key={rec.id} className="border-b border-zinc-100 last:border-none font-medium text-zinc-950">
                              <td className="px-3 py-2 font-bold">{rec.studentName}</td>
                              <td className="px-3 py-2">{rec.className}</td>
                              <td className="px-3 py-2 text-zinc-500">{rec.parentPhone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  disabled={submittingAction}
                  variant="outline"
                  onClick={() => handleTaskAction(inspectingTask.id, "REJECTED")}
                  className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-zinc-200"
                >
                  <RiCloseLine className="w-4 h-4 mr-1.5" />
                  Reject
                </Button>
                <Button
                  disabled={submittingAction}
                  onClick={() => handleTaskAction(inspectingTask.id, "APPROVED")}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {submittingAction ? (
                    <RiLoader4Line className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <RiCheckLine className="w-4 h-4 mr-1.5" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground text-xs font-semibold">
              <RiUserSmileLine className="w-8 h-8 text-zinc-300 mb-2" />
              Select an administrative batch to view audit details and issue approvals.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
