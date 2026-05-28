"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiBuilding2Line,
  RiMapPinLine,
  RiMailSendLine,
  RiInformationLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CreateSchoolPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactEmail: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) return setError("School name is required")
    if (!formData.address.trim()) return setError("Address is required")
    if (!formData.contactEmail.trim()) return setError("Contact email is required")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail))
      return setError("Please enter a valid email address")

    setIsSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch("/schools", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      setSuccess(`School "${data.name}" has been successfully orchestrated!`)
      setFormData({
        name: "",
        address: "",
        contactEmail: "",
      })
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.push("/super_admin")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to create school node")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-600/20 via-primary/5 to-transparent -z-10" />
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Top Bar */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Orchestrate Node</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">New School Instance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        {/* Status Messages */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in zoom-in-95 duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <RiCheckLine className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-sm leading-tight">{typeof success === 'string' ? success : 'Node Provisioned'}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in shake-1 duration-300">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{typeof error === 'string' ? error : 'Orchestration Error'}</p>
          </div>
        )}

        {/* Info Card */}
        <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
          <RiInformationLine className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
            Creating a new school node will initialize a dedicated academic environment, financial structures, and administrative controls.
          </p>
        </div>

        {/* School Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <RiBuilding2Line className="w-3.5 h-3.5 text-blue-500" /> Institution Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Nexus International Academy"
              className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-background focus:border-blue-500/50 outline-none transition-all placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <RiMailSendLine className="w-3.5 h-3.5 text-blue-500" /> Administrative Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="admin@school-domain.com"
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-background focus:border-blue-500/50 outline-none transition-all placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <RiMapPinLine className="w-3.5 h-3.5 text-blue-500" /> Physical Location
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            placeholder="Enter the complete address..."
            className="w-full rounded-2xl bg-muted/40 border border-border/50 p-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-background focus:border-blue-500/50 outline-none transition-all placeholder:text-muted-foreground/40 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 pb-8">
          <Button
            type="submit"
            disabled={isSubmitting || !!success}
            className="w-full h-16 rounded-[2rem] font-black text-base shadow-2xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 disabled:grayscale-[0.5]"
          >
            {isSubmitting ? (
              <RiLoader4Line className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <RiCheckLine className="w-6 h-6" />
                Initialize School Node
              </>
            )}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground font-medium mt-4 uppercase tracking-widest">
            Nodes are provisioned instantly upon submission
          </p>
        </div>
      </form>
    </div>
  )
}
