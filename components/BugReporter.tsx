"use client"

import { useState, useEffect, useRef } from "react"
import {
  RiBugLine,
  RiCloseLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
} from "@remixicon/react"
import { useAppSelector } from "@/lib/store/hooks"
import { toJpeg } from "html-to-image"

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
    if (
      hostname.includes("staging") ||
      hostname.includes("localhost") ||
      process.env.NODE_ENV === "development"
    ) {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) return null

  const handleOpenReporter = async () => {
    try {
      setIsCapturing(true)

      // Wait a tiny bit for React to render the loading spinner
      await new Promise((resolve) => setTimeout(resolve, 50))

      // html2canvas cannot parse modern CSS color functions like lab()/oklch().
      // html-to-image delegates rendering to the browser, avoiding that parser error.
      const dataUrl = await toJpeg(document.body, {
        quality: 0.5,
        pixelRatio: 1,
        filter: (node) =>
          !(node instanceof HTMLElement && node.id === "bug-reporter-btn"),
      })

      const blob = await fetch(dataUrl).then((response) => response.blob())

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
      let backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      if (!backendUrl.startsWith("http")) {
        backendUrl = `https://${backendUrl}`
      }

      console.log("Sending bug report to:", `${backendUrl}/bug-reports`)

      const response = await fetch(`${backendUrl}/bug-reports`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      startY: e.clientY - position.y,
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
      y: e.clientY - dragRef.current.startY,
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
        className="fixed right-6 bottom-6 z-9999 flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition-colors hover:scale-105 hover:bg-rose-700 active:cursor-grabbing disabled:opacity-50"
        title="Report a bug"
      >
        {isCapturing ? (
          <RiLoader4Line className="h-5 w-5 animate-spin" />
        ) : (
          <RiBugLine className="h-6 w-6" />
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-10000 flex animate-in items-center justify-center bg-black/60 backdrop-blur-sm duration-200 fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2 text-rose-600">
                <RiBugLine className="h-5 w-5" />
                <h3 className="font-black tracking-tight text-foreground">
                  Report an Issue
                </h3>
              </div>
              <button
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted transition-colors hover:bg-muted/80"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="flex animate-in flex-col items-center justify-center py-8 text-center zoom-in-95">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <RiCheckLine className="h-8 w-8" />
                  </div>
                  <h4 className="mb-1 text-lg font-black">Got it!</h4>
                  <p className="text-sm text-muted-foreground">
                    The screenshot and details have been sent to the developers.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-600">
                      <RiErrorWarningLine className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      What went wrong?
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. I clicked the save button but nothing happened..."
                      className="h-32 w-full resize-none rounded-2xl border border-border/50 bg-muted/40 p-4 text-sm transition-all outline-none focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/10"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-1 rounded-xl bg-muted/30 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      <RiCheckLine className="h-3 w-3 text-emerald-500" />{" "}
                      Auto-Capturing
                    </p>
                    <p className="line-clamp-1 flex gap-2 text-xs font-medium text-muted-foreground">
                      <span className="shrink-0">• Screenshot</span>
                      <span className="shrink-0">• URL</span>
                      <span className="shrink-0">• Email</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 font-bold text-white shadow-lg shadow-rose-600/20 transition-colors hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className="h-5 w-5 animate-spin" />
                    ) : (
                      "Submit Report"
                    )}
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
