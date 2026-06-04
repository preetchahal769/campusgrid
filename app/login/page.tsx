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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background overflow-hidden relative">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />

      <Card className="w-full max-w-[420px] bg-background/60 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardHeader className="space-y-3 pt-10 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            <RiLockPasswordLine className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Enter your credentials to access your portal</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Message */}
            {(error || validationError) && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-semibold leading-tight">{error || validationError}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
                  School Email
                </label>
                <div className="relative">
                  <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="name@school.edu" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setValidationError(null)
                    }}
                    className="h-14 pl-12 rounded-2xl bg-muted/30 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
                  Secure Password
                </label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setValidationError(null)
                    }}
                    className="h-14 pl-12 pr-12 rounded-2xl bg-muted/30 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
                  >
                    {showPassword ? <RiEyeOffLine className="w-5 h-5 text-muted-foreground" /> : <RiEyeLine className="w-5 h-5 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group"
            >
              {isLoading ? (
                <RiLoader4Line className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Access Portal
                  <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground font-medium">
                Difficulty signing in? <button type="button" className="text-primary font-bold hover:underline">Contact Administrator</button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
