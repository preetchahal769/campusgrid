import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiBookOpenLine, RiArrowLeftLine, RiPlayCircleFill, RiFileDownloadLine, RiRobot2Line, RiTimeLine } from "@remixicon/react"
import Link from "next/link"

export default function LecturesPage() {
  const lectures = [
    { 
      id: 1, 
      title: "Introduction to Quantum Mechanics", 
      subject: "Advanced Physics", 
      date: "Mar 17, 2026", 
      duration: "45 mins",
      thumbnail: "bg-purple-900/40",
      progress: 100
    },
    { 
      id: 2, 
      title: "CPU Pipelining & Hazards", 
      subject: "Computer Architecture", 
      date: "Mar 16, 2026", 
      duration: "52 mins",
      thumbnail: "bg-blue-900/40",
      progress: 35
    },
    { 
      id: 3, 
      title: "Multiple Integrals", 
      subject: "Calculus III", 
      date: "Mar 15, 2026", 
      duration: "60 mins",
      thumbnail: "bg-emerald-900/40",
      progress: 0
    },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] p-6 bg-gradient-to-b from-purple-500/10 via-background to-background">
      <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-background/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Lecture Library</h1>
        </div>

        <Card className="p-6 rounded-3xl border-purple-500/20 bg-background/60 backdrop-blur-md shadow-lg shadow-purple-500/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
          <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 mt-2">
            <RiBookOpenLine className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Weekly Watch Time</h2>
          <div className="text-6xl font-black text-foreground tracking-tighter mb-2">4.5<span className="text-3xl text-muted-foreground">h</span></div>
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 inline-block px-3 py-1 rounded-full mt-2">On track with syllabus</p>
        </Card>

        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Recorded Lectures</h3>
          </div>
          
          <div className="space-y-5">
            {lectures.map((lecture) => (
              <Card key={lecture.id} className="overflow-hidden rounded-2xl border-border/40 bg-muted/20 hover:border-purple-500/30 transition-colors group">
                {/* Video Thumbnail Area */}
                <div className={`relative w-full h-32 ${lecture.thumbnail} flex items-center justify-center`}>
                  <RiPlayCircleFill className="w-12 h-12 text-white/80 group-hover:scale-110 group-hover:text-white transition-all shadow-xl rounded-full" />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-md flex items-center gap-1">
                    <RiTimeLine className="w-3 h-3" />
                    {lecture.duration}
                  </div>
                  
                  {/* Progress Bar */}
                  {lecture.progress > 0 && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                      <div className="h-full bg-purple-500 rounded-r-full" style={{ width: `${lecture.progress}%` }}></div>
                    </div>
                  )}
                </div>
                
                {/* Info Area */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">{lecture.subject}</span>
                    <span className="text-xs text-muted-foreground font-medium">{lecture.date}</span>
                  </div>
                  <h4 className="font-bold text-base leading-tight mb-4">{lecture.title}</h4>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-9 text-xs font-semibold rounded-xl bg-background border-border/60 hover:bg-muted text-foreground">
                      <RiFileDownloadLine className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                      Slides
                    </Button>
                    <Button variant="outline" className="flex-[1.5] h-9 text-xs font-semibold rounded-xl bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <RiRobot2Line className="w-3.5 h-3.5 mr-1.5" />
                      AI Notes
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
