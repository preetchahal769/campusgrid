"use client"

import { useRouter } from "next/navigation"
import { RiCheckLine, RiCloseLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
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
            <button onClick={() => router.push('/features')} className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors hidden md:block">
              Features
            </button>
            <button onClick={() => router.push('/pricing')} className="text-sm font-bold text-zinc-900 transition-colors hidden md:block">
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-blue-50 to-transparent -z-10" />
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Plans that scale with your school.</h1>
        <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
          From small standalone academies to multi-branch institutions, SikshaTantar provides everything you need to run operations smoothly.
        </p>
      </section>

      {/* Pricing Matrix */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto bg-white border border-zinc-100 shadow-xl rounded-[3rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="p-8 w-1/4">
                    <h3 className="text-2xl font-black">Compare Plans</h3>
                    <p className="text-zinc-500 font-medium text-sm mt-1">Per-Student / Per-Month</p>
                  </th>
                  <th className="p-8 bg-zinc-50/50 w-1/4">
                    <h4 className="text-xl font-black text-zinc-900">Starter</h4>
                    <p className="text-3xl font-black mt-2">₹50</p>
                    <Button variant="outline" className="w-full mt-4 rounded-full font-bold border-2 text-zinc-900">Get Started</Button>
                  </th>
                  <th className="p-8 bg-blue-600 w-1/4 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Popular</div>
                    <h4 className="text-xl font-black text-white">Standard</h4>
                    <p className="text-3xl font-black mt-2 text-white">₹100</p>
                    <Button className="w-full mt-4 rounded-full font-bold bg-white text-blue-600 hover:bg-zinc-50">Free Trial</Button>
                  </th>
                  <th className="p-8 bg-zinc-50/50 w-1/4">
                    <h4 className="text-xl font-black text-zinc-900">Enterprise</h4>
                    <p className="text-3xl font-black mt-2">Custom</p>
                    <Button variant="outline" className="w-full mt-4 rounded-full font-bold border-2 text-zinc-900">Contact Sales</Button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {/* Section 1 */}
                <tr className="bg-zinc-50/50"><td colSpan={4} className="py-4 px-8 font-bold text-sm uppercase tracking-widest text-zinc-500">Core Administration</td></tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Student & Staff Profiles</td>
                  <td className="py-4 px-8 text-center text-zinc-500">Basic</td>
                  <td className="py-4 px-8 text-center bg-blue-50/30 text-blue-700 font-medium">Advanced</td>
                  <td className="py-4 px-8 text-center font-medium">Advanced</td>
                </tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Digital Attendance</td>
                  <td className="py-4 px-8 text-center text-zinc-500">Teacher App Only</td>
                  <td className="py-4 px-8 text-center bg-blue-50/30 text-blue-700 font-medium">Biometric Integrations</td>
                  <td className="py-4 px-8 text-center font-medium">Biometric Integrations</td>
                </tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Automated ID Cards</td>
                  <td className="py-4 px-8 text-center"><RiCloseLine className="w-5 h-5 mx-auto text-zinc-300" /></td>
                  <td className="py-4 px-8 text-center bg-blue-50/30"><RiCheckLine className="w-5 h-5 mx-auto text-blue-500" /></td>
                  <td className="py-4 px-8 text-center"><RiCheckLine className="w-5 h-5 mx-auto text-emerald-500" /></td>
                </tr>

                {/* Section 2 */}
                <tr className="bg-zinc-50/50"><td colSpan={4} className="py-4 px-8 font-bold text-sm uppercase tracking-widest text-zinc-500">Financial Engine</td></tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Fee Configurations</td>
                  <td className="py-4 px-8 text-center text-zinc-500">Flat Fees</td>
                  <td className="py-4 px-8 text-center bg-blue-50/30 text-blue-700 font-medium">Installments & Discounts</td>
                  <td className="py-4 px-8 text-center font-medium">Multi-branch Routing</td>
                </tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Online Payment Gateway</td>
                  <td className="py-4 px-8 text-center"><RiCloseLine className="w-5 h-5 mx-auto text-zinc-300" /></td>
                  <td className="py-4 px-8 text-center bg-blue-50/30"><RiCheckLine className="w-5 h-5 mx-auto text-blue-500" /></td>
                  <td className="py-4 px-8 text-center"><RiCheckLine className="w-5 h-5 mx-auto text-emerald-500" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Automated WhatsApp Reminders</td>
                  <td className="py-4 px-8 text-center"><RiCloseLine className="w-5 h-5 mx-auto text-zinc-300" /></td>
                  <td className="py-4 px-8 text-center bg-blue-50/30"><RiCheckLine className="w-5 h-5 mx-auto text-blue-500" /></td>
                  <td className="py-4 px-8 text-center"><RiCheckLine className="w-5 h-5 mx-auto text-emerald-500" /></td>
                </tr>

                {/* Section 3 */}
                <tr className="bg-zinc-50/50"><td colSpan={4} className="py-4 px-8 font-bold text-sm uppercase tracking-widest text-zinc-500">Academics & LMS</td></tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Automated Report Cards</td>
                  <td className="py-4 px-8 text-center text-zinc-500">Standard PDF</td>
                  <td className="py-4 px-8 text-center bg-blue-50/30 text-blue-700 font-medium">Custom Templates</td>
                  <td className="py-4 px-8 text-center font-medium">White-labeled</td>
                </tr>
                <tr>
                  <td className="py-4 px-8 font-medium">Parent & Student Portals</td>
                  <td className="py-4 px-8 text-center"><RiCloseLine className="w-5 h-5 mx-auto text-zinc-300" /></td>
                  <td className="py-4 px-8 text-center bg-blue-50/30"><RiCheckLine className="w-5 h-5 mx-auto text-blue-500" /></td>
                  <td className="py-4 px-8 text-center"><RiCheckLine className="w-5 h-5 mx-auto text-emerald-500" /></td>
                </tr>
              </tbody>
            </table>
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
