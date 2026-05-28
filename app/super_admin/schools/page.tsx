"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setSchools, setLoading, setError, updateSchoolInStore } from "@/lib/store/slices/nexusSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiIndeterminateCircleLine,
  RiLoader4Line,
  RiMapPinLine,
  RiMailLine,
  RiSettings4Line,
  RiSearchLine,
  RiFilter3Line,
  RiEarthLine,
  RiShieldUserLine,
  RiUserStarLine,
  RiCheckLine,
  RiEyeLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface School {
  id: string
  name: string
  address: string
  contactEmail: string
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE"
  createdAt: string
}

export default function SchoolsListPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { schools, isLoading, error } = useAppSelector(state => state.nexus)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [assigningPrincipal, setAssigningPrincipal] = useState<string | null>(null)
  const [principalForm, setPrincipalForm] = useState({
    userId: "",
    qualification: "M.Ed",
    experienceYears: 5
  })

  useEffect(() => {
    setMounted(true)
    loadSchools()
  }, [])

  const handleAssignPrincipal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningPrincipal) return
    
    try {
      await apiFetch(`/schools/${assigningPrincipal}/assign-principal`, {
        method: "POST",
        body: JSON.stringify(principalForm)
      })
      alert("Principal assigned successfully!")
      setAssigningPrincipal(null)
      setPrincipalForm({ userId: "", qualification: "M.Ed", experienceYears: 5 })
      loadSchools()
    } catch (err: any) {
      alert(err.message || "Failed to assign principal")
    }
  }

  const loadSchools = async () => {
    dispatch(setLoading(true))
    try {
      const data = await apiFetch("/schools")
      dispatch(setSchools(data))
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to fetch schools"))
    }
  }

  const toggleStatus = async (id: string, currentStatus: string | { status: string }) => {
    setStatusUpdating(id)
    const statusStr = typeof currentStatus === 'string' ? currentStatus : currentStatus?.status || ''
    
    let nextStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE" = "ACTIVE"
    if (statusStr === "ACTIVE") nextStatus = "SUSPENDED"
    else if (statusStr === "SUSPENDED") nextStatus = "INACTIVE"
    else nextStatus = "ACTIVE"

    try {
      const updated = await apiFetch(`/schools/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })
      dispatch(updateSchoolInStore(updated))
    } catch (err: any) {
      alert(err.message || "Failed to update status")
    } finally {
      setStatusUpdating(null)
    }
  }

  const getStatusConfig = (status: string | { status: string }) => {
    const statusStr = typeof status === 'string' ? status : status?.status || ''
    switch (statusStr) {
      case "ACTIVE":
        return { color: "text-emerald-500 bg-emerald-500/10", icon: RiCheckboxCircleLine, label: "Active" }
      case "SUSPENDED":
        return { color: "text-amber-500 bg-amber-500/10", icon: RiIndeterminateCircleLine, label: "Suspended" }
      case "INACTIVE":
        return { color: "text-rose-500 bg-rose-500/10", icon: RiCloseCircleLine, label: "Inactive" }
      default:
        return { color: "text-muted-foreground bg-muted/10", icon: RiCheckboxCircleLine, label: statusStr || "Unknown" }
    }
  }

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600/15 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 xl:px-40 pt-12 pb-6 space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/super_admin')}
              className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">School Nodes</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Orchestration Registry</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <RiFilter3Line className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative animate-in slide-in-from-top-4 duration-500 delay-100">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 md:mx-12 lg:mx-24 xl:mx-40 max-w-[1200px] xl:mx-auto p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest animate-in shake-1 mb-6">
          {typeof error === 'string' ? error : 'Registry Connection Fault'}
        </div>
      )}

      {/* Schools List */}
      <div className="px-6 md:px-12 lg:px-24 xl:px-40 max-w-[1200px] mx-auto space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:space-y-0">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <RiLoader4Line className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-xs font-black uppercase tracking-widest">Scanning Grid...</p>
          </div>
        ) : (mounted && filteredSchools.length === 0) ? (
          <div className="py-20 lg:col-span-2 text-center space-y-4 bg-muted/20 rounded-[2.5rem] border border-dashed border-border/60">
            <RiBuilding2Line className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">No school nodes found matching your query</p>
          </div>
        ) : mounted ? (
          filteredSchools.map((school, idx) => {
            const config = getStatusConfig(school.status)
            return (
              <div 
                key={school.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="group relative p-5 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-border/40 hover:border-indigo-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                        <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", config.color)}>
                          <config.icon className="w-3 h-3" />
                          {config.label}
                        </div>
                        {school.region && (
                          <div className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 flex items-center gap-1.5">
                            <RiEarthLine className="w-3 h-3" />
                            {school.region}
                          </div>
                        )}
                      </div>
                        <span className="text-[10px] text-muted-foreground/60 font-mono">ID: {school.id.slice(0, 8)}</span>
                      </div>
                      
                      <h3 className="text-base font-black tracking-tight truncate">{typeof school.name === 'string' ? school.name : 'Unknown Node'}</h3>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          <RiMapPinLine className="w-3.5 h-3.5 text-indigo-500/60" />
                          <span className="truncate">{typeof school.address === 'string' ? school.address : 'Location Unspecified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          <RiMailLine className="w-3.5 h-3.5 text-indigo-500/60" />
                          <span className="truncate">{typeof school.contactEmail === 'string' ? school.contactEmail : 'Contact Unavailable'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/super_admin/schools/${school.id}`)}
                        className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 hover:bg-blue-500 hover:text-white transition-all active:scale-90 shadow-sm"
                        title="View Node Details"
                      >
                        <RiEyeLine className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setAssigningPrincipal(school.id)}
                        className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 hover:bg-indigo-500 hover:text-white transition-all active:scale-90 shadow-sm"
                        title="Assign Principal"
                      >
                        <RiUserStarLine className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => toggleStatus(school.id, school.status)}
                        disabled={statusUpdating === school.id}
                        className={cn(
                          "w-12 h-12 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center transition-all active:scale-90 hover:bg-background hover:shadow-lg hover:shadow-indigo-500/5",
                          statusUpdating === school.id && "animate-pulse grayscale"
                        )}
                      >
                        {statusUpdating === school.id ? (
                          <RiLoader4Line className="w-5 h-5 animate-spin" />
                        ) : (
                          <RiSettings4Line className="w-5 h-5 text-indigo-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : null}
      </div>

      {/* Grid Stats Floating Bar */}
      {mounted && !isLoading && schools.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-20 animate-in slide-in-from-bottom-8 duration-500 delay-300">
          <div className="bg-background/90 backdrop-blur-2xl border border-border/40 shadow-2xl rounded-[2.5rem] px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total</p>
                <p className="text-lg font-black">{schools.length}</p>
              </div>
              <div className="w-px h-6 bg-border/40" />
              <div>
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</p>
                <p className="text-lg font-black text-emerald-600">{schools.filter(s => s.status === 'ACTIVE').length}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-5 py-2 shadow-lg shadow-indigo-600/20 transition-all"
              onClick={() => router.push('/super_admin/create-school')}
            >
              Add Node
            </Button>
          </div>
        </div>
      )}
    </div>

      {/* Assign Principal Modal */}
      {assigningPrincipal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 rounded-[3rem] border-border/40 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <RiUserStarLine className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Assign Principal</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-indigo-600">Administrative Appointment</p>
              </div>
            </div>

            <form onSubmit={handleAssignPrincipal} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Existing User UUID</label>
                <div className="relative">
                  <RiShieldUserLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    required
                    type="text" 
                    placeholder="cmoth3zqg000..."
                    value={principalForm.userId}
                    onChange={e => setPrincipalForm({...principalForm, userId: e.target.value})}
                    className="w-full h-14 bg-muted/30 border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Qualification</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. M.Ed"
                    value={principalForm.qualification}
                    onChange={e => setPrincipalForm({...principalForm, qualification: e.target.value})}
                    className="w-full h-14 bg-muted/30 border border-border/40 rounded-2xl px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Exp. (Years)</label>
                  <input 
                    required
                    type="number" 
                    value={principalForm.experienceYears}
                    onChange={e => setPrincipalForm({...principalForm, experienceYears: parseInt(e.target.value)})}
                    className="w-full h-14 bg-muted/30 border border-border/40 rounded-2xl px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setAssigningPrincipal(null)}
                  className="flex-1 h-14 rounded-2xl bg-muted border border-border/40 text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <RiCheckLine className="w-4 h-4" />
                  Appoint
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  )
}
