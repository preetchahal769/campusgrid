"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import { useSchoolInfo } from "@/hooks/useSchoolInfo"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiGraduationCapLine,
  RiBuilding2Line,
  RiListSettingsLine,
  RiDeleteBinLine,
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Section {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  name: string;
  section: Section[];
}

export default function ClerkCreateGradePage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { schoolDisplay, schoolId, isLoading: isLoadingSchool } = useSchoolInfo()

  // Setup tab states
  const [activeTab, setActiveTab] = useState<"SETUP" | "MANAGE">("SETUP")

  // Generate states
  const [name, setName] = useState("")
  const [classesCount, setClassesCount] = useState("1")
  const [startNumber, setStartNumber] = useState("1")
  const [sectionsCount, setSectionsCount] = useState("3")
  const [sectionSeriesType, setSectionSeriesType] = useState("ALPHABET")
  
  // Management states
  const [grades, setGrades] = useState<Grade[]>([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [expandedGradeId, setExpandedGradeId] = useState<string | null>(null)
  
  // Inline add section state
  const [newSectionNames, setNewSectionNames] = useState<Record<string, string>>({})
  const [addingSectionForId, setAddingSectionForId] = useState<string | null>(null)

  // Custom Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === "MANAGE") {
      loadGrades()
    }
  }, [activeTab])

  const loadGrades = async () => {
    setLoadingGrades(true)
    setError(null)
    try {
      const data = await apiFetch('/academics/grades')
      setGrades(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingGrades(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Base Name / Class Name is required"); return }
    if (!user?.School_id) { setError("Your account is not linked to a school. Please contact the administrator."); return }

    setIsSubmitting(true)
    setError(null)
    try {
      await apiFetch('/academics/grades', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          School_id: user.School_id,
          classesCount: classesCount ? parseInt(classesCount) : 1,
          startNumber: startNumber ? parseInt(startNumber) : 1,
          sectionsCount: sectionsCount ? parseInt(sectionsCount) : 0,
          sectionSeriesType: sectionSeriesType,
        }),
      })

      const count = classesCount ? parseInt(classesCount) : 1
      setSuccess(`Successfully created ${count} classes with auto-generated sections!`)
      setName("")
      setClassesCount("1")
      setStartNumber("1")
      setSectionsCount("3")
      setSectionSeriesType("ALPHABET")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Grade Handler with custom Modal
  const handleDeleteGrade = (gradeId: string, gradeName: string) => {
    setConfirmConfig({
      title: "Delete Class Profile",
      message: `Are you sure you want to delete "${gradeName}"? This will automatically unassign any active students enrolled in this class and delete all its sections.`,
      onConfirm: async () => {
        setError(null);
        try {
          await apiFetch(`/academics/grades/${gradeId}`, { method: 'DELETE' });
          setSuccess(`Class "${gradeName}" and its sections successfully deleted!`);
          loadGrades();
          setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
          setError(err.message);
        }
      }
    })
    setShowConfirmModal(true)
  }

  // Delete Section Handler with custom Modal
  const handleDeleteSection = (sectionId: string, sectionName: string) => {
    setConfirmConfig({
      title: "Delete Section Link",
      message: `Are you sure you want to delete section "${sectionName}"? Any active students in this section will be automatically unassigned.`,
      onConfirm: async () => {
        setError(null);
        try {
          await apiFetch(`/academics/sections/${sectionId}`, { method: 'DELETE' });
          setSuccess(`Section "${sectionName}" deleted successfully!`);
          loadGrades();
          setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
          setError(err.message);
        }
      }
    })
    setShowConfirmModal(true)
  }

  // Create Inline Section
  const handleAddInlineSection = async (gradeId: string) => {
    const secName = newSectionNames[gradeId]?.trim();
    if (!secName) return;

    setAddingSectionForId(gradeId);
    setError(null);
    try {
      await apiFetch('/academics/sections', {
        method: 'POST',
        body: JSON.stringify({
          name: secName,
          grade_id: gradeId
        })
      });

      setNewSectionNames(prev => ({ ...prev, [gradeId]: '' }));
      setSuccess(`Section "${secName}" added successfully!`);
      loadGrades();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingSectionForId(null);
    }
  };

  const getSectionPreview = (idx: number) => {
    if (sectionSeriesType === 'NUMERIC') return (idx + 1).toString()
    if (sectionSeriesType === 'ROMAN') {
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
      return romans[idx] || `Sec-${idx + 1}`
    }
    return String.fromCharCode(65 + idx)
  }

  const classCountVal = Math.min(15, parseInt(classesCount) || 1)
  const secCountVal = Math.min(10, parseInt(sectionsCount) || 0)
  const startNumVal = parseInt(startNumber) || 1

  return (
    <div className="min-h-screen pb-12 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-violet-600 rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white animate-all duration-300"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white font-outfit">Class & Sections Directory</h1>
          <p className="text-xs text-white/70 font-medium">Create, configure, and manage active classes and sections</p>
        </div>
      </div>

      <div className="px-5 max-w-2xl mx-auto space-y-5">
        
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

        {/* Setup Tab Selector */}
        <div className="flex p-1 bg-white/80 backdrop-blur border border-zinc-150 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab("SETUP")}
            className={cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all", activeTab === "SETUP" ? "bg-violet-600 text-white shadow-md shadow-violet-600/10" : "text-muted-foreground hover:bg-zinc-50")}
          >
            Setup & Generate
          </button>
          <button
            onClick={() => setActiveTab("MANAGE")}
            className={cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all", activeTab === "MANAGE" ? "bg-violet-600 text-white shadow-md shadow-violet-600/10" : "text-muted-foreground hover:bg-zinc-50")}
          >
            Manage Existing Classes
          </button>
        </div>

        {activeTab === "SETUP" ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-5 animate-in fade-in duration-300">
            
            {/* Base Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <RiGraduationCapLine className="w-3.5 h-3.5 text-violet-600" /> Class Base Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(null) }}
                placeholder="e.g. Grade, Class, Form, Batch..."
                className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Classes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  Number of Classes
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={classesCount}
                  onChange={e => setClassesCount(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
                />
              </div>

              {/* Start Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  Start Numbering From
                </label>
                <input
                  type="number"
                  min="0"
                  value={startNumber}
                  onChange={e => setStartNumber(e.target.value)}
                  disabled={classesCount === "1"}
                  className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all disabled:opacity-40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sections per class */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  Sections Per Class
                </label>
                <input
                  type="number"
                  min="0"
                  max="26"
                  value={sectionsCount}
                  onChange={e => setSectionsCount(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all"
                />
              </div>

              {/* Section series type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  Section Series Type
                </label>
                <select
                  value={sectionSeriesType}
                  onChange={e => setSectionSeriesType(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-zinc-50 border border-zinc-150 px-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-600 transition-all appearance-none"
                >
                  <option value="ALPHABET">Alphabetical (A, B, C...)</option>
                  <option value="NUMERIC">Numerical (1, 2, 3...)</option>
                  <option value="ROMAN">Roman Numeral (I, II, III...)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Staging Preview Widget */}
            {name.trim() && (
              <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3 animate-in fade-in duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-500 flex items-center gap-1.5">
                  <RiListSettingsLine className="w-3.5 h-3.5" /> Generation Preview (Showing up to 3)
                </p>
                <div className="space-y-2">
                  {Array.from({ length: Math.min(3, classCountVal) }, (_, cIdx) => {
                    const cName = classCountVal > 1 
                      ? `${name.trim()} ${startNumVal + cIdx}`
                      : name.trim();
                    
                    return (
                      <div key={cIdx} className="bg-white border border-zinc-100 rounded-xl p-3 flex items-center justify-between text-xs animate-in slide-in-from-bottom-1">
                        <span className="font-black text-zinc-800">{cName}</span>
                        <div className="flex items-center gap-1">
                          {secCountVal > 0 ? (
                            Array.from({ length: secCountVal }, (_, sIdx) => (
                              <span key={sIdx} className="bg-zinc-100 text-zinc-600 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                {getSectionPreview(sIdx)}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-semibold italic">No sections</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {classCountVal > 3 && (
                    <p className="text-[10px] text-zinc-400 font-bold italic text-right">+ {classCountVal - 3} more classes...</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || !user?.School_id}
              className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-sm tracking-wide shadow-lg shadow-violet-600/20"
            >
              {isSubmitting ? (
                <RiLoader4Line className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <>
                  <RiCheckLine className="w-5 h-5 mr-2" />
                  Generate Classes & Sections
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4 animate-in fade-in duration-300">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Active School Classes</h3>
            
            {loadingGrades ? (
              <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
                <RiLoader4Line className="w-6 h-6 animate-spin text-violet-600" /> Loading classes...
              </div>
            ) : grades.length === 0 ? (
              <p className="py-10 text-center text-xs font-semibold text-zinc-400 italic">No classes set up yet.</p>
            ) : (
              <div className="space-y-3">
                {grades.map((grade) => {
                  const isExpanded = expandedGradeId === grade.id;
                  
                  return (
                    <div key={grade.id} className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                      {/* Class Header Row */}
                      <div className="bg-zinc-50/50 p-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setExpandedGradeId(isExpanded ? null : grade.id)}
                          className="flex-1 flex items-center gap-3 text-left font-black text-sm text-zinc-900"
                        >
                          <RiGraduationCapLine className="w-5 h-5 text-violet-600" />
                          <span>{grade.name}</span>
                          <span className="text-[10px] font-bold text-zinc-400">({grade.section.length} sections)</span>
                          {isExpanded ? <RiArrowUpSLine className="w-4 h-4 text-zinc-400 ml-auto" /> : <RiArrowDownSLine className="w-4 h-4 text-zinc-400 ml-auto" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGrade(grade.id, grade.name)}
                          className="ml-3 p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Class Section Sublist */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-zinc-100 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                          {grade.section.length === 0 ? (
                            <p className="text-[11px] text-zinc-400 italic">No sections created for this class.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {grade.section.map((sec) => (
                                <div key={sec.id} className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-50 bg-zinc-50/20 text-xs font-bold">
                                  <span className="text-zinc-800">Section {sec.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSection(sec.id, sec.name)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                                  >
                                    <RiDeleteBinLine className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Inline Add Section Form */}
                          <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={10}
                              placeholder="Add Section (e.g. D)"
                              value={newSectionNames[grade.id] || ''}
                              onChange={e => setNewSectionNames(prev => ({ ...prev, [grade.id]: e.target.value }))}
                              className="flex-1 h-10 border border-zinc-150 rounded-xl px-3 text-xs font-semibold outline-none focus:border-violet-500 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddInlineSection(grade.id)}
                              disabled={addingSectionForId === grade.id || !newSectionNames[grade.id]?.trim()}
                              className="h-10 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm shadow-violet-600/10 disabled:opacity-50"
                            >
                              {addingSectionForId === grade.id ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiAddLine className="w-3.5 h-3.5" />}
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && confirmConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-zinc-100 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-zinc-900 font-outfit">{confirmConfig.title}</h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">{confirmConfig.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false)
                  setConfirmConfig(null)
                }}
                className="flex-1 h-12 border border-zinc-150 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmConfig.onConfirm()
                  setShowConfirmModal(false)
                  setConfirmConfig(null)
                }}
                className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-600/10 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
