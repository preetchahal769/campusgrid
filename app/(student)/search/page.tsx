import { Input } from "@/components/ui/input"
import { RiSearchLine, RiFilter3Line } from "@remixicon/react"

export default function SearchPage() {
  return (
    <div className="min-h-screen pb-10 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tight text-white">Discover</h1>
          <p className="text-xs text-white/70 font-medium">Find students, groups, and events</p>
        </div>
      </div>

      <div className="px-5 space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <RiSearchLine className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            type="search" 
            placeholder="Search campus grid..." 
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-background/60 border-muted-foreground/20 backdrop-blur-md shadow-sm focus-visible:ring-primary/50 transition-all text-base font-medium" 
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
            <RiFilter3Line className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
        </div>

        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <h2 className="text-lg font-bold">Trending Searches</h2>
          <div className="flex flex-wrap gap-2">
            {["Study Groups", "Hackathon 2026", "Campus Cafe", "Library Hours", "Freshman Tech", "Photography Club"].map((tag) => (
              <span 
                key={tag} 
                className="px-4 py-2 rounded-xl bg-muted/40 text-sm font-semibold border border-muted-foreground/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center py-20 opacity-60">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
            <RiSearchLine className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">Type to start searching</p>
        </div>
      </div>
    </div>
  )
}
