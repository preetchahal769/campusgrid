"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiBookOpenLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiCalendarEventLine,
  RiFileTextLine,
  RiBarChartLine,
  RiPriceTagLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CreateAssignmentPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxMarks, setMaxMarks] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [sectionId, setSectionId] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    if (!title.trim()) return "Title is required"
    if (!description.trim()) return "Description is required"
    if (!dueDate) return "Due date is required"
    if (!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) <= 0) return "Enter a valid max marks"
    if (!subjectId.trim()) return "Subject ID is required"
    if (!sectionId.trim()) return "Section ID is required"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErr = validate()
    if (validationErr) { setError(validationErr); return }

    setIsSubmitting(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dueDate,
          maxMarks: Number(maxMarks),
          subject_id: subjectId.trim(),
          section_id: sectionId.trim(),
        }),
      })
      setSuccess(true)
      // Reset form
      setTitle("")
      setDescription("")
      setDueDate("")
      setMaxMarks("")
      setSubjectId("")
      setSectionId("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">New Assignment</h1>
          <p className="text-xs text-muted-foreground font-medium">Create homework for your section</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-5">
        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in slide-in-from-top-2 duration-300">
            <RiCheckLine className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Assignment created successfully!</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-top-2 duration-300">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiBookOpenLine className="w-3.5 h-3.5 text-primary" /> Assignment Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(null) }}
            placeholder="e.g. Algebra Homework — Chapter 5"
            className="w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiFileTextLine className="w-3.5 h-3.5 text-primary" /> Description / Instructions *
          </label>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setError(null) }}
            placeholder="Describe what students need to do..."
            rows={4}
            className="w-full rounded-2xl bg-muted/40 border border-border/50 p-4 text-sm font-medium resize-none focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
          />
        </div>

        {/* Due Date + Max Marks */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RiCalendarEventLine className="w-3.5 h-3.5 text-primary" /> Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); setError(null) }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RiBarChartLine className="w-3.5 h-3.5 text-primary" /> Max Marks *
            </label>
            <input
              type="number"
              value={maxMarks}
              onChange={e => { setMaxMarks(e.target.value); setError(null) }}
              placeholder="100"
              min="1"
              className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
            />
          </div>
        </div>

        {/* Subject ID + Section ID */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RiPriceTagLine className="w-3.5 h-3.5 text-primary" /> Subject ID *
            </label>
            <input
              type="text"
              value={subjectId}
              onChange={e => { setSubjectId(e.target.value); setError(null) }}
              placeholder="cuid_of_subject"
              className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium font-mono focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RiPriceTagLine className="w-3.5 h-3.5 text-primary" /> Section ID *
            </label>
            <input
              type="text"
              value={sectionId}
              onChange={e => { setSectionId(e.target.value); setError(null) }}
              placeholder="cuid_of_section"
              className="w-full h-12 rounded-2xl bg-muted/40 border border-border/50 px-4 text-sm font-medium font-mono focus:ring-4 focus:ring-primary/10 focus:bg-background outline-none transition-all"
            />
          </div>
        </div>

        {/* Preview Card */}
        {title && (
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 space-y-2 animate-in fade-in duration-300">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Preview</p>
            <p className="font-black text-base">{title}</p>
            {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
            <div className="flex gap-3 flex-wrap pt-1">
              {dueDate && <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">Due: {dueDate}</span>}
              {maxMarks && <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">Max: {maxMarks} marks</span>}
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 mt-2"
        >
          {isSubmitting ? (
            <RiLoader4Line className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <RiCheckLine className="w-5 h-5 mr-2" />
              Publish Assignment
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
