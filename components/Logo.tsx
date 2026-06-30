"use client"

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 48"
      className={className}
      fill="none"
    >
      {/* Grid symbol styled like a modern campus layout */}
      <rect x="6" y="6" width="14" height="14" rx="4.5" fill="#6366f1" />
      <rect x="24" y="6" width="14" height="14" rx="4.5" fill="#c84b1a" />
      <rect x="6" y="24" width="14" height="14" rx="4.5" fill="#f59e0b" />
      <rect x="24" y="24" width="14" height="14" rx="4.5" fill="#10b981" />
      
      <path d="M13 20v4M20 13h4M20 31h4M31 20v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      
      {/* Brand Text */}
      <text
        x="48"
        y="31"
        fill="currentColor"
        style={{
          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: "22px",
          letterSpacing: "-0.5px"
        }}
      >
        Siksha<tspan fill="#6366f1">tantar</tspan>
      </text>
    </svg>
  )
}
