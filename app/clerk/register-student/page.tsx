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

export default function ClerkRegisterStudentPage() {
  const router = useRouter()
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const [step, setStep] = useState<1 | 2>(1)
  const [createdUser, setCreatedUser] = useState<{ id: string; role: string; name: string } | null>(null)
  const [mode, setMode] = useState<"CREATE" | "UNASSIGNED">("CREATE")
  const [unassignedUsers, setUnassignedUsers] = useState<any[]>([])
  const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false)

  // Step 2 Student Data
  const [sections, setSections] = useState<any[]>([])
  const [studentData, setStudentData] = useState({ section_id: "", admissionNumber: "", rollNumber: "" })

  const fetchSections = async () => {
    try {
      const data = await apiFetch("/academics/sections")
      setSections(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch sections", err)
    }
  }

  const fetchUnassigned = async () => {
    setIsLoadingUnassigned(true)
    setError(null)
    try {
      const data = await apiFetch(`/users/unassigned?role=STUDENT`)
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
      setSuccess(`Student base account "${data.name}" created! Now complete their profile.`)
      
      fetchSections()
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
    if (!studentData.section_id) return setError("Section is required for student profiles")

    setIsSubmitting(true)
    setError(null)
    try {
      await apiFetch("/students/profile", {
        method: "POST",
        body: JSON.stringify({
          users_id: createdUser.id,
          section_id: studentData.section_id,
          admissionNumber: studentData.admissionNumber || undefined,
          rollNumber: studentData.rollNumber ? parseInt(studentData.rollNumber) : undefined,
        }),
      })

      setSuccess(`Student profile for ${createdUser.name} fully linked!`)
      setTimeout(() => {
        setSuccess(null)
        setStep(1)
        setCreatedUser(null)
        setFormData({ name: "", email: "", password: "", role: "STUDENT" })
        setStudentData({ section_id: "", admissionNumber: "", rollNumber: "" })
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-12 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-violet-600 rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white font-outfit">Student Admission</h1>
          <p className="text-xs text-white/70 font-medium">Step {step} of 2: {step === 1 ? 'Credentials' : 'Academic Profile'}</p>
        </div>
      </div>

      <div className="px-5 space-y-5 max-w-2xl mx-auto">
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
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <span className="text-violet-600 text-sm font-black">🏫</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admission Context</p>
            <p className={cn("text-sm font-bold truncate", !schoolId && "text-destructive")}>
              {isLoadingSchool ? "Loading..." : schoolDisplay}
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="flex p-1 bg-zinc-100 border border-zinc-200/50 rounded-2xl">
            <button
              onClick={() => setMode("CREATE")}
              className={cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all", mode === "CREATE" ? "bg-white shadow-sm text-violet-600" : "text-muted-foreground hover:bg-white/50")}
            >
              Admit New Student
            </button>
            <button
              onClick={() => {
                setMode("UNASSIGNED")
                fetchUnassigned()
              }}
              className={cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all", mode === "UNASSIGNED" ? "bg-white shadow-sm text-violet-600" : "text-muted-foreground hover:bg-white/50")}
            >
              Unlinked Student Accounts
            </button>
          </div>
        )}

        {step === 1 ? (
          mode === "CREATE" ? (
            <form onSubmit={handleBaseSubmit} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-5 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiUserLine className="w-3.5 h-3.5 text-violet-600" /> Student Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiMailLine className="w-3.5 h-3.5 text-violet-600" /> Student Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. student@school.com"
                  className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <RiLockPasswordLine className="w-3.5 h-3.5 text-violet-600" /> Access Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 pl-4 pr-12 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-zinc-700"
                  >
                    {showPassword ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !schoolId}
                className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-sm tracking-wide shadow-lg shadow-violet-600/20"
              >
                {isSubmitting ? <RiLoader4Line className="w-5 h-5 animate-spin mx-auto" /> : "Create Student Account"}
              </Button>
            </form>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4 animate-in fade-in duration-500">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Select Student to Link Profile</h3>
              
              {isLoadingUnassigned ? (
                <div className="py-10 text-center text-muted-foreground flex items-center justify-center gap-2">
                  <RiLoader4Line className="w-5 h-5 animate-spin text-violet-600" /> Loading...
                </div>
              ) : unassignedUsers.length === 0 ? (
                <p className="py-8 text-center text-xs font-semibold text-zinc-400">No unlinked student accounts found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {unassignedUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCreatedUser({ id: u.id, role: "STUDENT", name: u.name })
                        fetchSections()
                        setStep(2)
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-zinc-100 hover:border-violet-600/30 hover:bg-violet-50/5 transition-all flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm">{u.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                      </div>
                      <RiUserAddLine className="w-5 h-5 text-violet-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-5 animate-in fade-in duration-500">
            <div className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Linking Profile For</p>
                <p className="text-sm font-black text-zinc-900">{createdUser?.name}</p>
              </div>
              <span className="bg-violet-100 text-violet-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">STUDENT</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assign Section *</label>
              <select
                value={studentData.section_id}
                onChange={(e) => setStudentData(prev => ({ ...prev, section_id: e.target.value }))}
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all appearance-none"
              >
                <option value="">Select Class Section...</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.grade?.name} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admission Number (Optional)</label>
              <input
                type="text"
                value={studentData.admissionNumber}
                onChange={(e) => setStudentData(prev => ({ ...prev, admissionNumber: e.target.value }))}
                placeholder="e.g. ADM-2026-102"
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Roll Number (Optional)</label>
              <input
                type="number"
                value={studentData.rollNumber}
                onChange={(e) => setStudentData(prev => ({ ...prev, rollNumber: e.target.value }))}
                placeholder="e.g. 15"
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-sm tracking-wide shadow-lg shadow-violet-600/20"
            >
              {isSubmitting ? <RiLoader4Line className="w-5 h-5 animate-spin mx-auto" /> : "Complete Student Profile"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
