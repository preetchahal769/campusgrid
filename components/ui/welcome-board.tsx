import React from "react"
import { Card } from "./card"
import { cn } from "@/lib/utils"

interface WelcomeBoardProps {
  title: React.ReactNode
  subtitle: React.ReactNode
  illustrationSrc: string
  className?: string
}

export function WelcomeBoard({ title, subtitle, illustrationSrc, className }: WelcomeBoardProps) {
  return (
    <Card className={cn("rounded-3xl border-none shadow-lg bg-white overflow-hidden flex flex-col md:flex-row relative min-h-[220px]", className)}>
      <div className="p-6 md:p-8 flex-1 z-10 flex flex-col justify-center">
        <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2 leading-tight max-w-[70%]">{title}</h3>
        <p className="text-sm md:text-base text-zinc-600 font-medium max-w-[70%]">{subtitle}</p>
      </div>
      
      {/* Absolute positioning for the illustration on the right */}
      <div className="absolute right-0 bottom-0 top-0 w-[50%] md:w-[40%] pointer-events-none flex items-end justify-end">
        <img 
          src={illustrationSrc} 
          alt="Illustration" 
          className="w-full h-full object-contain object-right-bottom drop-shadow-2xl"
          style={{ maxWidth: '300px', maxHeight: '120%' }}
        />
      </div>
    </Card>
  )
}
