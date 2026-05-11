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
  RiEarthLine
} from "@remixicon/react"
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

  useEffect(() => {
    loadSchools()
  }, [])

  const loadSchools = async () => {
    dispatch(setLoading(true))
    try {
      const data = await apiFetch("/schools")
      dispatch(setSchools(data))
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to fetch schools"))
    }
  }

  const toggleStatus = async (id: string, currentStatus: any) => {
    setStatusUpdating(id)
    const statusStr = typeof currentStatus === 'string' ? currentStatus : currentStatus?.status || ''
    
    let nextStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE" = "ACTIVE"
    if (statusStr === "ACTIVE") nextStatus = "SUSPENDED"
    else if (statusStr === "SUSPENDED") nextStatus = "INACTIVE"
    else nextStatus = "ACTIVE"

    try {
      const updated = await apiFetch(`/schools/${id}/status`, {
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

  const getStatusConfig = (status: any) => {
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
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600/15 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
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
        <div className="mx-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest animate-in shake-1 mb-6">
          {typeof error === 'string' ? error : 'Registry Connection Fault'}
        </div>
      )}

      {/* Schools List */}
      <div className="px-6 space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <RiLoader4Line className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-xs font-black uppercase tracking-widest">Scanning Grid...</p>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[2.5rem] border border-dashed border-border/60">
            <RiBuilding2Line className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground">No school nodes found matching your query</p>
          </div>
        ) : (
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
            )
          })
        )}
      </div>

      {/* Grid Stats Floating Bar */}
      {!isLoading && schools.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-20 animate-in slide-in-from-bottom-8 duration-500 delay-300">
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
  )
}
