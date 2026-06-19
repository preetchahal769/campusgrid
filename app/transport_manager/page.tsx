"use client"

import { useState } from "react"
import {
  RiBusLine,
  RiMapPinRangeLine,
  RiUserSettingsLine,
  RiAlertLine,
  RiCheckDoubleLine
} from "@remixicon/react"

export default function TransportManagerDashboard() {
  const [routes] = useState([
    { id: "1", name: "Route A - North Sector", driver: "Rajesh Kumar", status: "ACTIVE" },
    { id: "2", name: "Route B - Downtown Loop", driver: "Amit Sharma", status: "ACTIVE" },
    { id: "3", name: "Route C - South Suburbs", driver: "Gurpreet Singh", status: "MAINTENANCE" }
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600/10 via-yellow-500/5 to-transparent border border-amber-600/20 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
          <RiBusLine className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Transport Fleet Workspace</h1>
          <p className="text-sm font-medium text-muted-foreground">
            SikshaTantar Transport Management — Track routes, fleet health, and driver assignments.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RiMapPinRangeLine className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transit Routes</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">{routes.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RiUserSettingsLine className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Drivers</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">2 Active</h3>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RiAlertLine className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicles Grounded</span>
            <h3 className="text-2xl font-black tracking-tight text-amber-600 mt-0.5">1 Units</h3>
          </div>
        </div>
      </div>

      {/* Fleet List */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <RiBusLine className="w-5 h-5 text-amber-600" />
          Fleet Route Matrix
        </h3>

        <div className="border border-zinc-100 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Route</th>
                <th className="px-5 py-3.5">Assigned Driver</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-zinc-100 last:border-none text-xs font-semibold hover:bg-zinc-50/50 transition-all">
                  <td className="px-5 py-4 font-bold text-zinc-900">{route.name}</td>
                  <td className="px-5 py-4 text-zinc-600">{route.driver}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      route.status === "ACTIVE" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                        : "bg-amber-50 text-amber-700 border border-amber-200/50"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${route.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {route.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
