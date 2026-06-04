import * as React from "react"
import { cn } from "@/lib/utils"

export interface ColorfulCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colorScheme?: "blue" | "green" | "yellow" | "red" | "purple" | "white"
}

export function ColorfulCard({
  className,
  colorScheme = "white",
  children,
  ...props
}: ColorfulCardProps) {
  const colorStyles = {
    blue: "bg-[#45A3F5] text-white shadow-xl shadow-[#45A3F5]/30",
    green: "bg-[#6FCA72] text-white shadow-xl shadow-[#6FCA72]/30",
    yellow: "bg-[#FDB543] text-white shadow-xl shadow-[#FDB543]/30",
    red: "bg-[#FA5D5D] text-white shadow-xl shadow-[#FA5D5D]/30",
    purple: "bg-[#825CD6] text-white shadow-xl shadow-[#825CD6]/30",
    white: "bg-white text-zinc-900 shadow-sm border border-zinc-100",
  }

  return (
    <div
      className={cn(
        "rounded-[2.5rem] p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.02] active:scale-95 aspect-[4/5]",
        colorStyles[colorScheme],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
