"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"
import {
  RiGraduationCapLine,
  RiLayoutGridLine,
  RiBookOpenLine,
  RiUserAddLine,
  RiTeamLine,
  RiShieldUserLine,
  RiCalendarCheckLine,
  RiTimeLine,
  RiLogoutBoxLine,
  RiUserSharedLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { WelcomeBoard } from "@/components/ui/welcome-board"

const ACTIONS = [
  { label: "Create Grade",   icon: RiGraduationCapLine, route: "/principal/create-grade",   color: "text-[#825CD6]",  bg: "bg-[#825CD6]/10" },
  { label: "Create Section", icon: RiLayoutGridLine,    route: "/principal/create-section", color: "text-[#45A3F5]",  bg: "bg-[#45A3F5]/10" },
  { label: "Create Subject", icon: RiBookOpenLine,      route: "/principal/create-subject", color: "text-[#6FCA72]",  bg: "bg-[#6FCA72]/10" },
  { label: "Register User",     icon: RiUserAddLine,    route: "/principal/register-user",    color: "text-[#FDB543]",  bg: "bg-[#FDB543]/10" },
  { label: "Assign Teacher",    icon: RiTeamLine,       route: "/principal/assign-teacher",   color: "text-[#FA5D5D]",  bg: "bg-[#FA5D5D]/10" },
  { label: "Set In-Charge", icon: RiShieldUserLine, route: "/principal/set-incharge", color: "text-[#0A4EA6]",  bg: "bg-[#0A4EA6]/10" },
  { label: "Leave Appeals",     icon: RiCalendarCheckLine, route: "/principal/leaves",          color: "text-[#AB47BC]",  bg: "bg-[#AB47BC]/10" },
  { label: "Substitutions", icon: RiUserSharedLine, route: "/principal/substitutions", color: "text-[#825CD6]",  bg: "bg-[#825CD6]/10" },
  { label: "Availability", icon: RiTimeLine,         route: "/principal/staff-attendance", color: "text-[#45A3F5]",  bg: "bg-[#45A3F5]/10" },
]

export default function PrincipalDashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState("Good Day")

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening")
    
    // Role-based protection
    if (user && user.role !== 'PRINCIPAL') {
      router.replace(`/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  const firstName = user?.name?.split(" ")[0] || "Principal"


  if (!mounted) return null
  if (user && user.role !== 'PRINCIPAL') return null

  return (
    <div className="relative overflow-x-hidden min-h-full pb-10">
      {/* Blue Sweeping Header Background */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      <main className="px-5 md:px-8 pt-6 space-y-8">
        
        {/* Welcome Board */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-sm font-bold text-white mb-3 px-1">Principal Portal</h2>
          <WelcomeBoard 
            title={`${greeting}, ${firstName}!`}
            subtitle="Your school's daily operations are ready to be managed."
            illustrationSrc="/principal-illustration.png"
          />
        </section>

        {/* Operations Grid (3 Column) */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mt-8">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 px-1">Administration</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {ACTIONS.map(({ label, icon: Icon, route, color, bg }) => (
              <Card
                key={label}
                className="cursor-pointer hover:shadow-md transition-all rounded-3xl border border-zinc-100 shadow-sm aspect-square flex flex-col items-center justify-center p-3 relative group bg-white"
                onClick={() => router.push(route)}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", bg, color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-[11px] md:text-sm text-center text-zinc-700 leading-tight">{label}</p>
              </Card>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
