"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setLoading, setAuthSuccess, setAuthFailure, clearError } from "@/lib/store/slices/authSlice"
import { setProfile } from "@/lib/store/slices/studentSlice"
import { apiFetch } from "@/lib/api"
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiLoader4Line, RiArrowRightLine, RiErrorWarningLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isLoading, error } = useAppSelector((state) => state.auth)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const role = (user?.role || '').toLowerCase()
      if (role) router.replace(`/${role}`)
    }
  }, [user, router])

  const validateForm = () => {
    if (!email || !password) { setValidationError("Please fill in all fields"); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { setValidationError("Please enter a valid email address"); return false }
    if (password.length < 6) { setValidationError("Password must be at least 6 characters"); return false }
    setValidationError(null)
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    dispatch(setLoading(true))
    dispatch(clearError())

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      
      dispatch(setAuthSuccess(data))
      
      const role = (data?.user?.role || '').toLowerCase()
      
      // Auto-load and persist profile for students
      if (role === 'student') {
        const profileData = await apiFetch('/students/me')
        dispatch(setProfile(profileData))
      }
      
      if (role) router.push(`/${role}`)
    } catch (err: any) {
      dispatch(setAuthFailure(err.message || "Failed to sign in"))
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] overflow-hidden">
      
      {/* Left Pane - Desktop/Tablet Only */}
      <div className="hidden md:flex md:w-1/2 bg-[#c84b1a] p-12 lg:p-24 flex-col justify-between relative text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Top Content: Logo Card */}
        <div className="flex flex-col items-start space-y-8 animate-in slide-in-from-left duration-700 relative z-10">
          <div className="bg-white p-5 rounded-[2.5rem] shadow-xl w-36 h-36 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Sikshatantar Logo" 
              className="w-28 h-28 object-contain"
            />
          </div>
          
          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight font-outfit">
              Connected.<br />Empowered.<br />Education.
            </h1>
            <p className="text-white/80 font-medium text-sm lg:text-base leading-relaxed">
              Your school, streamlined. Every role, every workflow, every notice — in one place.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-white/50 text-xs font-semibold mt-8 relative z-10">
          © 2026 CampusGrid · Sikshatantar
        </div>
      </div>

      {/* Right Pane - Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Logo - Mobile Only */}
          <div className="flex md:hidden justify-center mb-4">
            <div className="bg-white p-4 rounded-3xl shadow-md w-28 h-28 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Sikshatantar Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 font-outfit">
              Welcome back
            </h2>
            <p className="text-zinc-500 font-medium text-sm">
              Sign in to access your portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {(error || validationError) && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-semibold leading-tight">{error || validationError}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 tracking-wide">
                  Email address
                </label>
                <input 
                  type="email" 
                  placeholder="you@school.edu.in" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setValidationError(null)
                  }}
                  className="w-full h-14 rounded-2xl bg-white border border-zinc-200 px-4 text-sm font-semibold text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 tracking-wide">
                    Password
                  </label>
                  <button 
                    type="button" 
                    className="text-xs font-bold text-[#C2410C] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setValidationError(null)
                    }}
                    className="w-full h-14 rounded-2xl bg-white border border-zinc-200 pl-4 pr-12 text-sm font-semibold text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-[#C2410C] hover:bg-[#A8370A] text-white font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-700/10 hover:shadow-orange-700/20 active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <RiLoader4Line className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <RiArrowRightLine className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Help / Footer Links */}
            <div className="text-center space-y-4 pt-2 text-xs font-semibold">
              <p className="text-zinc-500">
                Need help? <button type="button" className="text-[#C2410C] font-bold hover:underline">Contact your school admin</button>
              </p>
              <div>
                <button 
                  type="button" 
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  <span>← Back to home</span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>

    </div>
  )
}
