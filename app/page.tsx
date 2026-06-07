"use client"

import { useRouter } from "next/navigation"
import { RiArrowRightLine, RiDashboard3Line, RiShieldUserLine, RiGraduationCapLine, RiCheckLine, RiCloseLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
              S
            </div>
            <span className="text-xl font-black tracking-tight">SikshaTantar</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/features')} className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors hidden md:block">
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50 via-transparent to-transparent -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
            The Modern <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              School Operating System.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
            A beautiful, lightning-fast platform that connects students, empowers teachers, and gives administrators total control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              onClick={() => router.push('/login')}
              className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 w-full sm:w-auto transition-transform hover:scale-105 active:scale-95"
            >
              Access Your Portal <RiArrowRightLine className="w-5 h-5 ml-2" />
            </Button>

          </div>
        </div>

        {/* Hero Image / Mockup Area */}
        <div className="max-w-6xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-zinc-100 to-white border border-zinc-200 rounded-[2rem] shadow-2xl overflow-hidden relative group">
            {/* Pseudo-UI elements to act as a placeholder illustration */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col p-6 gap-6">
              <div className="h-12 w-full max-w-md bg-zinc-100 rounded-xl" />
              <div className="flex gap-6 flex-1">
                <div className="w-64 bg-zinc-50 rounded-2xl border border-zinc-100 h-full hidden md:block" />
                <div className="flex-1 flex flex-col gap-6">
                  <div className="h-40 bg-blue-50 rounded-2xl border border-blue-100 w-full relative overflow-hidden">
                     <img src="/student-illustration.png" className="absolute right-10 bottom-0 h-48 opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Student" />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-6">
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-100 h-full" />
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-100 h-full" />
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-100 h-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Built for every role.</h2>
            <p className="text-lg text-zinc-500 font-medium">One unified platform, personalized for exactly what you need.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For Students",
                desc: "Track assignments, check schedules, and monitor your grades all in one beautiful dashboard.",
                icon: RiGraduationCapLine,
                color: "text-orange-500",
                bg: "bg-orange-50",
              },
              {
                title: "For Teachers",
                desc: "Manage classes, take attendance effortlessly, and broadcast updates to your students instantly.",
                icon: RiDashboard3Line,
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                title: "For Admins",
                desc: "Complete oversight of infrastructure, billing, and global school analytics at a glance.",
                icon: RiShieldUserLine,
                color: "text-indigo-500",
                bg: "bg-indigo-50",
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-lg text-zinc-500 font-medium">Built for schools of all sizes. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-black text-zinc-900">Starter</h3>
              <p className="text-zinc-500 font-medium mt-2">For small, standalone schools.</p>
<<<<<<< HEAD
              <div className="mt-6 mb-8 flex flex-col items-start gap-2">
                <span className="bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Coming Soon</span>
                <div>
                  <span className="text-5xl font-black tracking-tighter">₹50</span>
                  <span className="text-zinc-400 font-bold">/student/mo</span>
                </div>
=======
              <div className="mt-6 mb-8">
                <span className="text-5xl font-black tracking-tighter">₹50</span>
                <span className="text-zinc-400 font-bold">/student/mo</span>
>>>>>>> design-update
              </div>
              <ul className="space-y-4 flex-1">
                <li className="flex items-center gap-3 text-zinc-600 font-medium"><RiCheckLine className="w-5 h-5 text-emerald-500" /> Digital Attendance</li>
                <li className="flex items-center gap-3 text-zinc-600 font-medium"><RiCheckLine className="w-5 h-5 text-emerald-500" /> Standard Grade Books</li>
                <li className="flex items-center gap-3 text-zinc-600 font-medium"><RiCheckLine className="w-5 h-5 text-emerald-500" /> Admin & Teacher Portal</li>
                <li className="flex items-center gap-3 text-zinc-400 font-medium"><RiCloseLine className="w-5 h-5 text-zinc-300" /> Online Payments</li>
              </ul>
              <Button variant="outline" className="w-full h-14 rounded-full mt-8 font-bold border-2 text-zinc-900">Get Started</Button>
            </div>

            {/* Standard (Highlighted) */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-600/20 border border-blue-500 flex flex-col relative hover:-translate-y-2 transition-all duration-300 text-white transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Most Popular</div>
              <h3 className="text-2xl font-black">Standard</h3>
              <p className="text-blue-200 font-medium mt-2">For growing, modern schools.</p>
<<<<<<< HEAD
              <div className="mt-6 mb-8 flex flex-col items-start gap-2">
                <span className="bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Coming Soon</span>
                <div>
                  <span className="text-5xl font-black tracking-tighter">₹100</span>
                  <span className="text-blue-300 font-bold">/student/mo</span>
                </div>
=======
              <div className="mt-6 mb-8">
                <span className="text-5xl font-black tracking-tighter">₹100</span>
                <span className="text-blue-300 font-bold">/student/mo</span>
>>>>>>> design-update
              </div>
              <ul className="space-y-4 flex-1">
                <li className="flex items-center gap-3 font-medium"><RiCheckLine className="w-5 h-5 text-blue-200" /> Everything in Starter</li>
                <li className="flex items-center gap-3 font-medium"><RiCheckLine className="w-5 h-5 text-blue-200" /> Online Fee Collections</li>
                <li className="flex items-center gap-3 font-medium"><RiCheckLine className="w-5 h-5 text-blue-200" /> WhatsApp Reminders</li>
                <li className="flex items-center gap-3 font-medium"><RiCheckLine className="w-5 h-5 text-blue-200" /> Parent & Student App</li>
              </ul>
              <Button className="w-full h-14 rounded-full mt-8 font-bold bg-white text-blue-600 hover:bg-zinc-50">Start Free Trial</Button>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-black text-zinc-900">Enterprise</h3>
              <p className="text-zinc-500 font-medium mt-2">For multi-branch institutions.</p>
<<<<<<< HEAD
              <div className="mt-6 mb-8 flex flex-col items-start gap-2">
                <span className="bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Coming Soon</span>
                <div>
                  <span className="text-5xl font-black tracking-tighter">Custom</span>
                </div>
=======
              <div className="mt-6 mb-8">
                <span className="text-5xl font-black tracking-tighter">Custom</span>
>>>>>>> design-update
              </div>
              <ul className="space-y-4 flex-1">
                <li className="flex items-center gap-3 text-zinc-600 font-medium"><RiCheckLine className="w-5 h-5 text-emerald-500" /> Multi-Branch P&L</li>
                <li className="flex items-center gap-3 text-zinc-600 font-medium"><RiCheckLine className="w-5 h-5 text-emerald-500" /> White-labeled App</li>
                <li className="flex items-center gap-3 text-zinc-600 font-medium"><RiCheckLine className="w-5 h-5 text-emerald-500" /> Custom SSO</li>
                <li className="flex items-center gap-3 text-zinc-600 font-medium"><RiCheckLine className="w-5 h-5 text-emerald-500" /> Dedicated Manager</li>
              </ul>
              <Button variant="outline" className="w-full h-14 rounded-full mt-8 font-bold border-2 text-zinc-900">Contact Sales</Button>
            </div>
          </div>
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
