"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RiArrowLeftLine, RiSendPlaneFill } from "@remixicon/react"
import Link from "next/link"

export default function NewHomeworkPage() {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      setIsPublished(true)
    }, 1500)
  }

  if (isPublished) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
          <RiSendPlaneFill className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Published!</h1>
        <p className="text-muted-foreground mb-8">The assignment has been successfully broadcasted to the class.</p>
        <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold">
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-500/5 via-background to-background relative pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">New Assignment</h1>
        </div>
      </div>

      <div className="p-6">
        <p className="text-muted-foreground text-sm mb-6">Create and broadcast a new homework assignment to your students.</p>
        
        <form id="homework-form" onSubmit={handlePublish} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="p-1 rounded-3xl border-border/50 bg-background/60 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="class" className="text-sm font-bold ml-1 text-foreground/80">Target Class</Label>
                <Select required defaultValue="10A">
                  <SelectTrigger id="class" className="h-14 rounded-2xl bg-muted/50 border-transparent focus:border-primary/50 text-base">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="10A">Class 10-A</SelectItem>
                    <SelectItem value="10B">Class 10-B</SelectItem>
                    <SelectItem value="11Sci">Class 11 Science</SelectItem>
                    <SelectItem value="12Arts">Class 12 Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-bold ml-1 text-foreground/80">Subject / Module</Label>
                <Input 
                  id="subject" 
                  required 
                  placeholder="e.g. Physics - Kinematics" 
                  className="h-14 rounded-2xl bg-muted/50 border-transparent focus-visible:border-primary/50 focus-visible:ring-primary/20 text-base px-4" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold ml-1 text-foreground/80">Assignment Details</Label>
                <Textarea 
                  id="description" 
                  required 
                  placeholder="Describe the tasks, chapters to read, and specific requirements..." 
                  className="min-h-[120px] rounded-2xl bg-muted/50 border-transparent focus-visible:border-primary/50 focus-visible:ring-primary/20 text-base p-4 resize-none" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-bold ml-1 text-foreground/80">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  required 
                  className="h-14 rounded-2xl bg-muted/50 border-transparent focus-visible:border-primary/50 focus-visible:ring-primary/20 text-base px-4 block w-full" 
                />
              </div>

            </CardContent>
          </Card>
        </form>
      </div>

      {/* Massive Sticky Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
        <Button 
          type="submit" 
          form="homework-form"
          disabled={isPublishing}
          className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all active:scale-[0.98] group"
        >
          {isPublishing ? "Broadcasting..." : (
            <>
              Publish Assignment
              <RiSendPlaneFill className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
