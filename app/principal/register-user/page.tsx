"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useSchoolInfo } from "@/hooks/useSchoolInfo"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiUserAddLine,
  RiMailLine,
  RiLockPasswordLine,
  RiUserLine,
  RiEyeLine,
  RiEyeOffLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ROLES = [
  { label: "Teacher", value: "TEACHER" },
  { label: "Student", value: "STUDENT" },
  { label: "Staff", value: "STAFF" },
  { label: "Principal", value: "PRINCIPAL" },
  { label: "Admin", value: "ADMIN" },
]

export default function RegisterUserPage() {
  const router = useRouter()
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEACHER",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const [step, setStep] = useState<1 | 2>(1)
  const [createdUser, setCreatedUser] = useState<{ id: string; role: string; name: string } | null>(null)
  const [mode, setMode] = useState<"CREATE" | "UNASSIGNED">("CREATE")
  const [unassignedUsers, setUnassignedUsers] = useState<any[]>([])
  const [unassignedRole, setUnassignedRole] = useState("STUDENT")
  const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false)

  // Step 2 Data
  const [sections, setSections] = useState<any[]>([])
  const [studentData, setStudentData] = useState({ section_id: "", admissionNumber: "", rollNumber: "" })
  const [teacherData, setTeacherData] = useState({ qualification: "", specilization: "" })

  const fetchSections = async () => {
    try {
      const data = await apiFetch("/academics/sections")
      setSections(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch sections", err)
    }
  }

  const fetchUnassigned = async (role: string) => {
    setIsLoadingUnassigned(true)
    setError(null)
    try {
      const data = await apiFetch(`/users/unassigned?role=${role}`)
      setUnassignedUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError("Failed to fetch unassigned users: " + err.message)
    } finally {
      setIsLoadingUnassigned(false)
    }
  }

  const handleBaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return setError("Name is required")
    if (!formData.email.trim()) return setError("Email is required")
    if (!formData.password.trim()) return setError("Password is required")
    if (formData.password.length < 6) return setError("Password must be at least 6 characters")

    setIsSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(formData),
      })
      
      setCreatedUser({ id: data.id, role: data.role, name: data.name })
      setSuccess(`Base User "${data.name}" created! Now complete their academic profile.`)
      
      if (data.role === "STUDENT") fetchSections()
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createdUser) return

    setIsSubmitting(true)
    setError(null)
    try {
      if (createdUser.role === "STUDENT") {
        if (!studentData.section_id) throw new Error("Section is required for students")
        await apiFetch("/students/profile", {
          method: "POST",
          body: JSON.stringify({
            users_id: createdUser.id,
            section_id: studentData.section_id,
            admissionNumber: studentData.admissionNumber || undefined,
            rollNumber: studentData.rollNumber ? parseInt(studentData.rollNumber) : undefined,
          }),
        })
      } else if (createdUser.role === "TEACHER") {
        await apiFetch("/teachers/profile", {
          method: "POST",
          body: JSON.stringify({
            users_id: createdUser.id,
            qualification: teacherData.qualification || undefined,
            specilization: teacherData.specilization || undefined,
          }),
        })
      } else if (createdUser.role === "PRINCIPAL") {
        await apiFetch("/principals/profile", { method: "POST", body: JSON.stringify({ users_id: createdUser.id }) })
      }

      setSuccess(`Academic profile for ${createdUser.name} fully linked!`)
      setTimeout(() => {
        setSuccess(null)
        setStep(1)
        setCreatedUser(null)
        setFormData({ name: "", email: "", password: "", role: "TEACHER" })
        setStudentData({ section_id: "", admissionNumber: "", rollNumber: "" })
        setTeacherData({ qualification: "", specilization: "" })
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-12 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Register User</h1>
          <p className="text-xs text-white/70 font-medium">Step {step} of {step === 1 ? '2' : '2'}: {step === 1 ? 'Base Credentials' : 'Academic Profile'}</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in slide-in-from-top-2 duration-300">
            <RiCheckLine className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">{success}</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-top-2 duration-300">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* School Context Pill */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <span className="text-emerald-500 text-sm font-black">🏫</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration Context</p>
            <p className={cn("text-sm font-bold truncate", !schoolId && "text-destructive")}>
              {isLoadingSchool ? "Loading..." : schoolDisplay}
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="flex p-1 bg-muted/30 border border-border/50 rounded-2xl">
            <button
              onClick={() => setMode("CREATE")}
              className={cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all", mode === "CREATE" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-white/50")}
            >
              Create New
            </button>
            <button
              onClick={() => {
                setMode("UNASSIGNED")
                fetchUnassigned(unassignedRole)
              }}
              className={cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all", mode === "UNASSIGNED" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-white/50")}
            >
              Unassigned Users
            </button>
          </div>
        )}

        {step === 1 ? (
          mode === "CREATE" ? (
            <form onSubmit={handleBaseSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <RiUserLine className="w-3.5 h-3.5 text-primary" /> Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <RiMailLine className="w-3.5 h-3.5 text-primary" /> Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john@school.com"
                className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <RiLockPasswordLine className="w-3.5 h-3.5 text-primary" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 pr-12 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <RiUserAddLine className="w-3.5 h-3.5 text-primary" /> User Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all appearance-none"
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 mt-2 bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? <RiLoader4Line className="w-6 h-6 animate-spin" /> : "Continue to Academic Profile →"}
            </Button>
          </form>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex gap-2">
                <select
                  value={unassignedRole}
                  onChange={(e) => {
                    setUnassignedRole(e.target.value)
                    fetchUnassigned(e.target.value)
                  }}
                  className="flex-1 h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all appearance-none"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <Button 
                  onClick={() => fetchUnassigned(unassignedRole)}
                  className="h-12 px-6 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white"
                >
                  Refresh
                </Button>
              </div>

              {isLoadingUnassigned ? (
                <div className="py-10 flex justify-center">
                  <RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" />
                </div>
              ) : unassignedUsers.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-border/60 rounded-3xl bg-muted/20">
                  <RiUserLine className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-bold text-muted-foreground">No unassigned {unassignedRole.toLowerCase()}s found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unassignedUsers.map(u => (
                    <div key={u.id} className="p-4 rounded-3xl border border-border/50 bg-white shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setCreatedUser({ id: u.id, role: u.role, name: u.name })
                          if (u.role === "STUDENT") fetchSections()
                          setStep(2)
                        }}
                        className="rounded-xl h-9 text-xs font-bold"
                      >
                        Assign Profile
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-6">
              <h3 className="font-black text-primary text-sm">Strict Academic Data</h3>
              <p className="text-xs text-muted-foreground mt-1">Assign {createdUser?.name} to their correct academic unit. They cannot change this themselves.</p>
            </div>

            {createdUser?.role === "STUDENT" && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assign Section *</label>
                  <select
                    value={studentData.section_id}
                    onChange={(e) => setStudentData({...studentData, section_id: e.target.value})}
                    className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Select a Section...</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.grade?.name} - {sec.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admission Number (Optional)</label>
                  <input
                    type="text"
                    value={studentData.admissionNumber}
                    onChange={(e) => setStudentData({...studentData, admissionNumber: e.target.value})}
                    placeholder="e.g. ADM-2025-001"
                    className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Roll Number (Optional)</label>
                  <input
                    type="number"
                    value={studentData.rollNumber}
                    onChange={(e) => setStudentData({...studentData, rollNumber: e.target.value})}
                    placeholder="e.g. 42"
                    className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold"
                  />
                </div>
              </>
            )}

            {createdUser?.role === "TEACHER" && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qualification (Optional)</label>
                  <input
                    type="text"
                    value={teacherData.qualification}
                    onChange={(e) => setTeacherData({...teacherData, qualification: e.target.value})}
                    placeholder="e.g. M.Sc. Mathematics"
                    className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-bold"
                  />
                </div>
              </>
            )}

            {["ADMIN", "STAFF", "PRINCIPAL"].includes(createdUser?.role || "") && (
              <p className="text-sm font-medium text-muted-foreground text-center py-4">
                No strict academic data required for {createdUser?.role}. You can just complete the registration.
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-emerald-500/20 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <RiLoader4Line className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <RiCheckLine className="w-5 h-5 mr-2" />
                  Link Academic Profile
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
