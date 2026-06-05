"use client"

import { useRouter } from "next/navigation"
import { RiDashboard3Line, RiShieldUserLine, RiGraduationCapLine, RiWallet3Line, RiCheckDoubleLine, RiNotification3Line } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export default function FeaturesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-500/30 overflow-x-hidden pt-20">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
              S
            </div>
            <span className="text-xl font-black tracking-tight">SikshaTantar</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/features')} className="text-sm font-bold text-zinc-900 transition-colors hidden md:block">
              Features
            </button>
            <button onClick={() => router.push('/pricing')} className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors hidden md:block">
              Pricing
            </button>
            <Button 
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-lg shadow-blue-500/20"
            >
              Portal Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-50 to-transparent rounded-full blur-[100px] -z-10" />
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Everything you need to run a modern school.</h1>
        <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
          SikshaTantar isn't just a database. It's an intelligent operating system that automates administration, accelerates fee collection, and empowers your teachers.
        </p>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Feature 1: Admin */}
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <RiShieldUserLine className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Core Administration</h2>
            <p className="text-zinc-500 text-lg leading-relaxed font-medium">
              Say goodbye to scattered Excel sheets. Onboard students and staff in seconds, manage massive datasets, and get real-time telemetry on your entire school's operations from one unified dashboard.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-blue-500 w-5 h-5" /> Instant ID Card Generation</li>
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-blue-500 w-5 h-5" /> Biometric Attendance Integration</li>
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-blue-500 w-5 h-5" /> Comprehensive Audit Logs</li>
            </ul>
          </div>
          
          <div className="bg-zinc-100 rounded-[2rem] aspect-video border border-zinc-200 overflow-hidden relative shadow-lg">
            {/* Mockup Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
            <img src="/principal-illustration.png" className="absolute bottom-0 right-10 h-3/4 object-contain opacity-90" alt="Admin Dashboard" />
          </div>

          {/* Feature 2: Financial */}
          <div className="bg-zinc-100 rounded-[2rem] aspect-video border border-zinc-200 overflow-hidden relative shadow-lg md:order-3">
             <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-red-50 opacity-50" />
             <div className="absolute inset-x-8 bottom-8 h-32 bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Fee Collected</p>
                  <p className="text-3xl font-black text-emerald-500">₹12,45,000</p>
                </div>
                <RiWallet3Line className="w-12 h-12 text-zinc-300" />
             </div>
          </div>

          <div className="space-y-6 md:order-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <RiWallet3Line className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Financial Engine</h2>
            <p className="text-zinc-500 text-lg leading-relaxed font-medium">
              Reduce fee defaults by up to 30%. Configure complex installment plans, track pending dues automatically, and let parents pay securely online through their own portal.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-emerald-500 w-5 h-5" /> Online Payment Gateway Routing</li>
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-emerald-500 w-5 h-5" /> Automated WhatsApp/SMS Reminders</li>
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-emerald-500 w-5 h-5" /> Multi-branch P&L Tracking</li>
            </ul>
          </div>

          {/* Feature 3: Academics */}
          <div className="space-y-6 md:order-5">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
              <RiGraduationCapLine className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Academics & LMS</h2>
            <p className="text-zinc-500 text-lg leading-relaxed font-medium">
              Empower your teachers with the tools they need to actually teach, rather than do paperwork. From automated timetable generation to instant report card printing.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-orange-500 w-5 h-5" /> Intelligent Timetable Generation</li>
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-orange-500 w-5 h-5" /> Custom Grade Books & Rubrics</li>
              <li className="flex items-center gap-3 font-bold text-zinc-700"><RiCheckDoubleLine className="text-orange-500 w-5 h-5" /> Automated PDF Report Cards</li>
            </ul>
          </div>

          <div className="bg-zinc-100 rounded-[2rem] aspect-video border border-zinc-200 overflow-hidden relative shadow-lg md:order-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-amber-50 opacity-50" />
            <img src="/student-laptop-vector.png" className="absolute bottom-0 right-10 h-3/4 object-contain opacity-90" alt="LMS Dashboard" />
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-[3rem] p-12 shadow-2xl shadow-blue-500/20 text-white">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Ready to upgrade your school?</h2>
          <p className="text-blue-100 text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto">
            Join hundreds of forward-thinking institutions that have modernized their operations with SikshaTantar.
          </p>
          <Button onClick={() => router.push('/pricing')} className="h-14 px-8 rounded-full bg-white text-blue-600 hover:bg-zinc-50 font-bold text-lg shadow-xl shadow-black/10 transition-transform hover:scale-105">
            View Pricing Plans
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <span className="font-black tracking-tight">SikshaTantar</span>
          </div>
          <p className="text-sm font-medium text-zinc-400">© 2026 SikshaTantar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
