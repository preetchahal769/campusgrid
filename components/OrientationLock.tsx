"use client"

import { useEffect, useState } from "react"
import { Monitor } from "lucide-react"

export function OrientationLock() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const checkOrientation = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Determine if the device is a tablet: shorter dimension is >= 600px and <= 1024px (excluding phones and large screens)
      const minDim = Math.min(width, height)
      const isTablet = minDim >= 600 && minDim <= 1024
      
      // Prompt if it's a tablet-sized screen and is in portrait orientation
      const isPortrait = height > width
      
      setShowPrompt(isTablet && isPortrait)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900 text-white px-6 text-center animate-in fade-in duration-300">
      <div className="relative mb-8">
        {/* Device Rotation Animation */}
        <div className="w-24 h-24 flex items-center justify-center border-4 border-slate-700 rounded-2xl bg-slate-800 shadow-2xl animate-bounce">
          <Monitor size={48} className="text-[#6366f1] animate-spin [animation-duration:3s]" />
        </div>
        {/* Rotation Arrows Indicator */}
        <svg className="absolute -inset-2 w-28 h-28 text-slate-500 animate-spin [animation-duration:8s]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H18" />
        </svg>
      </div>

      <h2 className="text-xl md:text-2xl font-black tracking-tight mb-2">
        Rotate Your Device
      </h2>
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
        Sikshatantar requires landscape mode on tablets. Please rotate your device to continue.
      </p>

      {/* Micro-animation styles */}
      <style jsx global>{`
        @keyframes rotate-device {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  )
}
