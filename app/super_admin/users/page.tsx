"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiUserAddLine,
  RiShieldUserLine,
  RiSearchLine,
  RiMailLine,
  RiLockLine,
  RiBuilding2Line,
  RiShieldStarLine,
  RiGroupLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine
} from "@remixicon/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const ROLES = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "MANAGEMENT"]

export default function UserGovernancePage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "ADMIN",
    School_id: ""
  })

  useEffect(() => {
    setMounted(true)
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await apiFetch("/users/global")
      setUsers(data)
    } catch (err) {
      console.error("Failed to load users", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = { ...formData }
      if (payload.role !== "PRINCIPAL" && payload.role !== "MANAGEMENT") {
        delete (payload as any).School_id
      }
      
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      setShowAddModal(false)
      loadUsers()
      setFormData({ email: "", password: "", name: "", role: "ADMIN", School_id: "" })
    } catch (err: any) {
      alert(err.message || "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-rose-500/10 text-rose-600 border-rose-500/20"
      case "ADMIN": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
      case "PRINCIPAL": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      default: return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-rose-500/10 via-primary/5 to-transparent -z-10" />

      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/super_admin')}
            className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">User Governance</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-rose-600">Administrative Identity Management</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
        >
          <RiUserAddLine className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-8">
        <div className="relative group">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-rose-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-background/60 backdrop-blur-md border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="px-6 space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <RiLoader4Line className="w-10 h-10 animate-spin text-rose-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Consulting Identity Vault...</p>
          </div>
        ) : (mounted && filteredUsers.length === 0) ? (
          <div className="py-20 text-center space-y-2 opacity-40">
            <RiShieldUserLine className="w-12 h-12 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest">No administrative users found</p>
          </div>
        ) : mounted ? (
          filteredUsers.map((user, idx) => (
            <Card key={user.id} className="p-5 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRoleStyle(user.role)}`}>
                    <RiShieldUserLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight">{user.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                      <RiMailLine className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getRoleStyle(user.role)}`}>
                  {user.role}
                </div>
              </div>
              {user.school && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40 text-[10px] font-bold text-muted-foreground">
                  <RiBuilding2Line className="w-3.5 h-3.5 text-rose-500" />
                  <span>Linked to:</span>
                  <span className="text-rose-600 uppercase tracking-tight">{user.school.name}</span>
                </div>
              )}
            </Card>
          ))
        ) : null}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-background border border-border/40 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
                  <RiUserAddLine className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Create Identity</h2>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Establish New Governance Node</p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <RiShieldStarLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Administrator"
                      className="w-full h-12 bg-muted/30 border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="admin@sikshatantar.com"
                      className="w-full h-12 bg-muted/30 border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                  <div className="relative">
                    <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      required
                      type="password" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full h-12 bg-muted/30 border border-border/40 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assign Role</label>
                    <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full h-12 bg-muted/30 border border-border/40 rounded-2xl px-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none text-rose-600"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {(formData.role === "PRINCIPAL" || formData.role === "MANAGEMENT") && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">School ID</label>
                      <input 
                        required
                        type="text" 
                        value={formData.School_id}
                        onChange={e => setFormData({...formData, School_id: e.target.value})}
                        placeholder="Node UUID"
                        className="w-full h-12 bg-muted/30 border border-border/40 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6 pb-8">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-12 rounded-2xl bg-muted border border-border/40 text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />}
                    Confirm Identity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
