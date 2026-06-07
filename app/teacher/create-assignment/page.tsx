"use client"

import { useState, useEffect } from "react"
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
  RiArrowDownSLine,
  RiSchoolLine,
  RiUploadLine,
  RiFileLine,
  RiCloseCircleLine,
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
  const [allowedContexts, setAllowedContexts] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoadingContexts, setIsLoadingContexts] = useState(true)
  const [selectedContextId, setSelectedContextId] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const data = await apiFetch('/academics/assignments/allowed-contexts')
        setAllowedContexts(data)
      } catch (err: any) {
        console.error("Failed to fetch contexts:", err)
        setError("Failed to load your assigned subjects and sections. Please try again.")
      } finally {
        setIsLoadingContexts(false)
      }
    }
    fetchContexts()
  }, [])

  const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contextId = e.target.value
    setSelectedContextId(contextId)
    setError(null)
    
    if (contextId) {
      const context = allowedContexts.find(c => c.id === contextId)
      if (context) {
        setSubjectId(context.subject.id)
        setSectionId(context.section.id)
      }
    } else {
      setSubjectId("")
      setSectionId("")
    }
  }

  const validate = () => {
    if (!title.trim()) return "Title is required"
    if (!description.trim()) return "Description is required"
    if (!dueDate) return "Due date is required"
    if (!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) <= 0) return "Enter a valid max marks"
    if (!selectedContextId) return "Please select a subject and section"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErr = validate()
    if (validationErr) { setError(validationErr); return }

    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('dueDate', dueDate)
      formData.append('maxMarks', maxMarks)
      formData.append('subject_id', subjectId.trim())
      formData.append('section_id', sectionId.trim())
      
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      const data = await apiFetch('/academics/assignments', {
        method: 'POST',
        body: formData,
      })
      setSuccess(true)
      // Reset form
      setTitle("")
      setDescription("")
      setDueDate("")
      setMaxMarks("")
      setSubjectId("")
      setSectionId("")
      setSelectedContextId("")
      setSelectedFiles([])
      setTimeout(() => router.push('/teacher/homework'), 2000)
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
          <h1 className="text-xl font-black tracking-tight text-white">New Assignment</h1>
          <p className="text-xs text-white/70 font-medium">Create homework for your section</p>
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

        {/* Subject & Section Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RiSchoolLine className="w-3.5 h-3.5 text-primary" /> Target Class & Subject *
          </label>
          <div className="relative group">
            <select
              value={selectedContextId}
              onChange={handleContextChange}
              disabled={isLoadingContexts || isSubmitting}
              className={cn(
                "w-full h-14 rounded-2xl bg-muted/40 border border-border/50 px-4 pr-10 text-sm font-bold appearance-none outline-none transition-all",
                "focus:ring-4 focus:ring-primary/10 focus:bg-background focus:border-primary/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !selectedContextId && "text-muted-foreground font-medium"
              )}
            >
              <option value="">{isLoadingContexts ? "Loading your classes..." : "Select Class & Subject"}</option>
              {allowedContexts.map((ctx) => (
                <option key={ctx.id} value={ctx.id}>
                  {ctx.subject.name} — {ctx.section.grade.name} {ctx.section.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              {isLoadingContexts ? (
                <RiLoader4Line className="w-5 h-5 animate-spin" />
              ) : (
                <RiArrowDownSLine className="w-5 h-5" />
              )}
            </div>
          </div>
          {allowedContexts.length === 0 && !isLoadingContexts && (
            <p className="text-[10px] font-bold text-destructive/80 pl-1">
              No subjects or sections assigned to you. Contact administration.
            </p>
          )}
        </div>

        {/* Resource Upload */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
            <RiUploadLine className="w-3.5 h-3.5 text-primary" /> Resource Documents <span className="font-normal opacity-60">(optional)</span>
          </label>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border/60 rounded-3xl bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <RiUploadLine className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Add Resources / PDFs</p>
                <p className="text-[8px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tighter">Multiple files supported</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                onChange={e => {
                  if (e.target.files) {
                    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])
                  }
                }}
              />
            </label>

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-border/50 rounded-2xl text-[10px] font-bold shadow-sm animate-in zoom-in-95 duration-200">
                    <RiFileLine className="w-3.5 h-3.5 text-primary" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button 
                      type="button"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-rose-500 transition-colors ml-1"
                    >
                      <RiCloseCircleLine className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
