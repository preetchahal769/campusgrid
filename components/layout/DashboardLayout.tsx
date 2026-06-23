"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Search, LogOut, type LucideIcon } from "lucide-react"

export const ORANGE = "#c84b1a"
export const INDIGO = "#6366f1"

export interface NavItem {
  icon: LucideIcon
  label: string
  id: string
}

interface Props {
  user: { name: string; sub: string; avatar: string }
  role: string
  roleColor: string
  roleBg: string
  navItems: NavItem[]
  activeId: string
  onNav: (id: string) => void
  children: ReactNode
  greeting?: string
  subline?: string
  unreadCount?: number
  hasProfile?: boolean
  onLogout?: () => void
}

export function DashboardLayout({
  user, role, roleColor, roleBg, navItems, activeId, onNav,
  children, greeting, subline, unreadCount = 0, hasProfile: propHasProfile,
  onLogout,
}: Props) {
  const router = useRouter()
  const hasProfile = propHasProfile ?? navItems.some(n => n.id === "profile")
  const hasNotices = navItems.some(n => n.id === "notices")

  // Desktop: first 4 primary, rest secondary
  const primary   = navItems.slice(0, 4)
  const secondary = navItems.slice(4)

  // Mobile bottom bar: first 4 only
  const bottomNav = navItems.slice(0, 4)

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-5 border-b border-border flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Sikshatantar" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto">
        <div className="space-y-0.5">
          {primary.map(({ icon: Icon, label, id }) => {
            const active = activeId === id
            return (
              <button key={id} onClick={() => onNav(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 text-left ${
                  active ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                style={active ? { background: roleColor } : undefined}>
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>

        {secondary.length > 0 && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">More</p>
            {secondary.map(({ icon: Icon, label, id }) => {
              const active = activeId === id
              return (
                <button key={id} onClick={() => onNav(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 text-left ${
                    active ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  style={active ? { background: roleColor } : undefined}>
                  <Icon size={15} />
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ background: ORANGE }}>
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.sub}</p>
          </div>
          <button onClick={onLogout} title="Sign out"
            className="text-muted-foreground hover:text-destructive transition-colors p-1">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden" style={{
      '--background': 'oklch(0.98 0.005 240)',
      '--foreground': 'oklch(0.15 0.01 240)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.15 0.01 240)',
      '--muted': 'oklch(0.96 0.01 240)',
      '--muted-foreground': 'oklch(0.55 0.02 240)',
      '--border': 'oklch(0.92 0.01 240)',
    } as React.CSSProperties}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 lg:w-60 flex-col bg-white border-r border-border flex-shrink-0">
        {sidebar}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 bg-white border-b border-border flex-shrink-0"
          style={{ height: 56, paddingTop: "env(safe-area-inset-top)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-border">
              <img src="/logo.png" alt="CampusGrid" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground leading-none">CampusGrid</p>
              <p className="text-[10px] font-semibold leading-none mt-0.5" style={{ color: roleColor }}>{role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground"
              onClick={() => hasNotices && onNav("notices")}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{ background: ORANGE }}
              onClick={() => hasProfile && onNav("profile")}>
              {user.avatar}
            </button>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden md:flex h-14 bg-white border-b border-border items-center gap-3 px-6 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-xs bg-muted/60 rounded-lg px-3 py-2">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input placeholder="Search…" className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/60 w-full" />
          </div>
          <div className="flex-1" />
          <button className="relative text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => hasNotices && onNav("notices")}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ background: ORANGE }}
            onClick={() => hasProfile && onNav("profile")}>
            {user.avatar}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 pb-24 md:pb-5">
          {(greeting || subline) && (
            <div className="mb-4 md:mb-5">
              <h1 className="text-lg md:text-xl font-black text-foreground">{greeting}</h1>
              {subline && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{subline}</p>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar — 4 items, clean */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {bottomNav.map(({ icon: Icon, label, id }) => {
          const active = activeId === id
          return (
            <button key={id} onClick={() => onNav(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 active:scale-95 transition-transform">
              <div className="w-10 h-6 flex items-center justify-center rounded-full transition-colors"
                style={active ? { background: roleBg } : undefined}>
                <Icon size={19} strokeWidth={active ? 2.5 : 2}
                  style={{ color: active ? roleColor : "#9ca3af" }} />
              </div>
              <span className="text-[10px] font-semibold leading-none tracking-tight"
                style={{ color: active ? roleColor : "#9ca3af" }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export function StatCard({ label, value, sub, color, bg, icon: Icon }: {
  label: string; value: string; sub: string; color: string; bg: string; icon: LucideIcon;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-border flex flex-col gap-3 active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
          <Icon size={15} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

export function SectionCard({ title, action, children }: {
  title: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="font-bold text-sm text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

export function Badge({ text, variant }: {
  text: string;
  variant: "green" | "amber" | "red" | "blue" | "purple" | "gray";
}) {
  const styles = {
    green:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber:  "bg-amber-50 text-amber-700 border border-amber-200",
    red:    "bg-red-50 text-red-600 border border-red-200",
    blue:   "bg-blue-50 text-blue-700 border border-blue-200",
    purple: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    gray:   "bg-gray-50 text-gray-600 border border-gray-200",
  }
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${styles[variant]}`}>{text}</span>
  )
}
