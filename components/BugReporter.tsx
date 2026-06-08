"use client"

import { useState, useEffect, useRef } from "react"
import { RiBugLine, RiCloseLine, RiLoader4Line, RiCheckLine, RiErrorWarningLine } from "@remixicon/react"
import { useAppSelector } from "@/lib/store/hooks"
import * as htmlToImage from "html-to-image"

export function BugReporter() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number } | null>(null)

  const { user } = useAppSelector((state) => state.auth)

  // Only show on staging or development
  useEffect(() => {
    const hostname = window.location.hostname
    if (hostname.includes("staging") || hostname.includes("localhost") || process.env.NODE_ENV === "development") {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) return null

  const handleOpenReporter = async () => {
    try {
      setIsCapturing(true)
      
      // Wait a tiny bit for React to render the loading spinner
      await new Promise(resolve => setTimeout(resolve, 50))

      // Capture screenshot using html-to-image
      // The button is automatically excluded via the filter function below
      const blob = await htmlToImage.toBlob(document.body, {
        quality: 0.5,
        pixelRatio: 1,
        skipFonts: true,
        filter: (node) => {
          if (node.id === 'bug-reporter-btn') return false;
          return true;
        }
      })

      if (blob) {
        setScreenshotBlob(blob)
      }
      
      setIsOpen(true)
    } catch (err) {
      console.error("Failed to capture screenshot", err)
      setIsOpen(true) // Open it anyway, just without screenshot
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError("Please describe the issue")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare payload
      const formData = new FormData()
      if (screenshotBlob) {
        formData.append("screenshot", screenshotBlob, "screenshot.jpg")
      }
      formData.append("description", description)
      formData.append("url", window.location.href)
      
      if (user?.email) formData.append("userEmail", user.email)
      if (user?.role) formData.append("userRole", user.role)

      // Send to backend
      // Note: Not using apiFetch here because we might want to allow this even if token is expired/missing
      const token = localStorage.getItem("access_token")
      let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      if (!backendUrl.startsWith("http")) {
        backendUrl = `https://${backendUrl}`
      }
      
      console.log('Sending bug report to:', `${backendUrl}/bug-reports`)
      
      const response = await fetch(`${backendUrl}/bug-reports`, {
        method: 'POST',
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit bug report")
      }

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setDescription("")
      }, 3000)

    } catch (err: any) {
      setError(err.message || "An error occurred")
      const btn = document.getElementById("bug-reporter-btn")
      if (btn) btn.style.display = "flex"
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePointerDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    setHasMoved(false)
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y
    }
  }

  const handlePointerMove = (e: any) => {
    if (!isDragging || !dragRef.current) return
    
    // Only consider it a "drag" if they move more than 5 pixels
    const moveX = Math.abs(e.clientX - dragRef.current.startX - position.x)
    const moveY = Math.abs(e.clientY - dragRef.current.startY - position.y)
    
    if (moveX > 5 || moveY > 5) {
      setHasMoved(true)
    }

    setPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY
    })
  }

  const handlePointerUp = (e: any) => {
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
    // On mobile, rely on PointerUp for clicks instead of synthetic onClick which can get swallowed
    if (!hasMoved) {
      handleOpenReporter()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        id="bug-reporter-btn"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        disabled={isCapturing}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 hover:bg-rose-700 hover:scale-105 disabled:opacity-50 transition-colors z-[9999] touch-none cursor-grab active:cursor-grabbing"
        title="Report a bug"
      >
        {isCapturing ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiBugLine className="w-6 h-6" />}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/50">
            <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-2 text-rose-600">
                <RiBugLine className="w-5 h-5" />
                <h3 className="font-black tracking-tight text-foreground">Report an Issue</h3>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                    <RiCheckLine className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-lg mb-1">Got it!</h4>
                  <p className="text-sm text-muted-foreground">The screenshot and details have been sent to the developers.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold">
                      <RiErrorWarningLine className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">What went wrong?</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. I clicked the save button but nothing happened..."
                      className="w-full h-32 rounded-2xl bg-muted/40 border border-border/50 p-4 text-sm resize-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/30 outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <RiCheckLine className="w-3 h-3 text-emerald-500" /> Auto-Capturing
                    </p>
                    <p className="text-xs font-medium text-muted-foreground line-clamp-1 flex gap-2">
                      <span className="shrink-0">• Screenshot</span>
                      <span className="shrink-0">• URL</span>
                      <span className="shrink-0">• Email</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-lg shadow-rose-600/20"
                  >
                    {isSubmitting ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : "Submit Report"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
