"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import {
  RiUserAddLine,
  RiFileUploadLine,
  RiFileList3Line,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiMailSendLine
} from "@remixicon/react"

interface StagedRecord {
  studentName: string
  parentPhone: string
  className: string
  rollNo?: number
}

export default function ClerkOnboardingStaging() {
  const router = useRouter()
  const [fileName, setFileName] = useState("batch_upload.json")
  const [jsonText, setJsonText] = useState("")
  const [parsedRecords, setParsedRecords] = useState<StagedRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const toast = {
    error: (msg: string) => alert(`Error: ${msg}`),
    success: (msg: string) => alert(`Success: ${msg}`)
  }

  // Handle validating raw JSON input
  const handleValidateJson = () => {
    try {
      if (!jsonText.trim()) {
        toast.error("Please input JSON data first")
        return
      }
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) {
        toast.error("JSON payload must be a list (Array) of records")
        return
      }
      // Basic validations
      const validated: StagedRecord[] = parsed.map((item: any, idx: number) => {
        if (!item.studentName || !item.parentPhone || !item.className) {
          throw new Error(`Record at index ${idx} is missing studentName, parentPhone, or className`)
        }
        return {
          studentName: item.studentName,
          parentPhone: item.parentPhone,
          className: item.className,
          rollNo: item.rollNo ? parseInt(item.rollNo) : undefined
        }
      })

      setParsedRecords(validated)
      toast.success(`Validated ${validated.length} onboarding profiles!`)
    } catch (err: any) {
      toast.error(err.message || "Invalid JSON syntax. Please verify structure.")
    }
  }

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setJsonText(text)
    }
    reader.readAsText(file)
  }

  const handleSubmitBatch = async () => {
    if (parsedRecords.length === 0) {
      toast.error("Please validate some records before submitting")
      return
    }

    setSubmitting(true)
    try {
      await apiFetch("/onboarding/batch", {
        method: "POST",
        body: JSON.stringify({
          fileName,
          records: parsedRecords
        })
      })

      toast.success("Batch onboarding records staged successfully and submitted to Principal!")
      setJsonText("")
      setParsedRecords([])
    } catch (err: any) {
      toast.error(err.message || "Failed to submit onboarding batch")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-600/10 via-purple-500/5 to-transparent border border-violet-600/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0">
            <RiUserAddLine className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Student Ingestion Staging</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Clerk Operations — Batch Upload Profiles for Principal Verification
            </p>
          </div>
        </div>

        <Link
          href="/clerk/onboarding/tracker"
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/10 self-start sm:self-auto"
        >
          <RiMailSendLine className="w-4 h-4" />
          Track Dispatches
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
        {/* Editor Box */}
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold tracking-tight">Ingest Batch Data</h3>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-violet-600 hover:underline">
              <RiFileUploadLine className="w-4 h-4" />
              Upload JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              JSON Batch Input
            </label>
            <textarea
              placeholder='[\n  { "studentName": "Amit Kumar", "parentPhone": "+919999999999", "className": "Grade 10 A", "rollNo": 12 }\n]'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-80 border border-zinc-200 rounded-2xl p-4 text-xs font-mono focus:outline-none focus:border-violet-600 resize-none bg-zinc-50"
            />
          </div>

          <button
            onClick={handleValidateJson}
            className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-violet-600/20 transition-colors"
          >
            <RiFileList3Line className="w-5 h-5" />
            Validate Profiles List
          </button>
        </div>

        {/* Preview Box */}
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          <div className="space-y-4 w-full">
            <h3 className="text-lg font-bold tracking-tight">Staged Preview</h3>
            
            {parsedRecords.length === 0 ? (
              <div className="py-24 text-center text-muted-foreground text-sm font-medium">
                Verify JSON inputs on the left. Validated student profiles will show up here.
              </div>
            ) : (
              <div className="border border-zinc-100 rounded-2xl overflow-y-auto max-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Parent Phone</th>
                      <th className="px-4 py-3 text-right">Roll No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRecords.map((r, idx) => (
                      <tr key={idx} className="border-b border-zinc-100 last:border-none text-xs font-semibold hover:bg-zinc-50/55 transition-colors">
                        <td className="px-4 py-3 font-bold text-zinc-900">{r.studentName}</td>
                        <td className="px-4 py-3">{r.className}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.parentPhone}</td>
                        <td className="px-4 py-3 text-right">{r.rollNo || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {parsedRecords.length > 0 && (
            <button
              onClick={handleSubmitBatch}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 bg-violet-700 hover:bg-violet-800 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-violet-700/20 transition-colors mt-4"
            >
              {submitting ? (
                <RiLoader4Line className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RiCheckDoubleLine className="w-5 h-5" />
                  Submit to Principal for Verification
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
