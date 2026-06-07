"use client"
import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RiWallet3Line, RiArrowLeftLine, RiCheckLine, RiTimeLine, RiQrCodeLine, RiUploadCloud2Line, RiDownloadLine, RiFileList3Line, RiHandHeartLine, RiCloseCircleLine } from "@remixicon/react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function FeesPage() {
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [isConcessionDialogOpen, setIsConcessionDialogOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "uploading" | "submitted">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [concessionType, setConcessionType] = useState<"monthly" | "yearly">("monthly")
  const [percentValue, setPercentValue] = useState("50")

  // Mock initial requests
  const [concessionRequests, setConcessionRequests] = useState([
    { id: 1, type: "yearly", percentRequested: 50, percentApproved: 30, status: "Approved", date: "Jan 10, 2026", note: "Approved for 30% yearly concession based on academic merit." },
    { id: 2, type: "monthly", percentRequested: 100, percentApproved: 0, status: "Declined", date: "Nov 05, 2025", note: "Cannot provide full monthly waiver at this time." }
  ])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentStatus("uploading")
      setTimeout(() => {
        setPaymentStatus("submitted")
      }, 1500)
    }
  }

  const handleConcessionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setConcessionRequests([
      {
        id: Date.now(),
        type: concessionType,
        percentRequested: parseInt(percentValue),
        percentApproved: 0,
        status: "Pending",
        date: "Mar 18, 2026",
        note: "Awaiting Principal's review."
      },
      ...concessionRequests
    ])
    setIsConcessionDialogOpen(false)
  }

  const months = [
    { month: "March 2026", amount: 450, status: "Pending", due: "Due in 3 days" },
    { month: "February 2026", amount: 450, status: "Paid", due: "Paid Feb 02" },
    { month: "January 2026", amount: 450, status: "Paid", due: "Paid Jan 05" },
    { month: "December 2025", amount: 450, status: "Paid", due: "Paid Dec 01" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'Pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'Declined': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-muted-foreground bg-muted border-border/50'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <RiCheckLine className="w-4 h-4" />
      case 'Pending': return <RiTimeLine className="w-4 h-4" />
      case 'Declined': return <RiCloseCircleLine className="w-4 h-4" />
      default: return <RiTimeLine className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen pb-10 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Fee Status</h1>
            <p className="text-xs text-white/70 font-medium">Manage payments and requests</p>
          </div>
        </div>
        
        <Dialog open={isConcessionDialogOpen} onOpenChange={setIsConcessionDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-10 px-4 rounded-2xl bg-white text-[#0A4EA6] border-white shadow-lg shadow-black/10 hover:bg-white/90 transition-all font-bold">
              <RiHandHeartLine className="w-4 h-4 mr-1.5" />
              Request Help
            </Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-background/95 backdrop-blur-xl border-border/50">
              <DialogHeader>
                <DialogTitle>Fee Concession Request</DialogTitle>
                <DialogDescription>
                  Submit a request to the Principal for a reduction in your fees. The Principal may approve, modify, or decline your requested percentage.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleConcessionSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Duration Type</label>
                    <Select value={concessionType} onValueChange={(v: "monthly" | "yearly") => setConcessionType(v)}>
                      <SelectTrigger className="h-12 rounded-xl bg-background/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="monthly">Single Month</SelectItem>
                        <SelectItem value="yearly">Full Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Percentage Off</label>
                    <Select value={percentValue} onValueChange={setPercentValue}>
                      <SelectTrigger className="h-12 rounded-xl bg-background/50">
                        <SelectValue placeholder="%" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="25">25% Reduction</SelectItem>
                        <SelectItem value="50">50% Reduction</SelectItem>
                        <SelectItem value="75">75% Reduction</SelectItem>
                        <SelectItem value="100">100% (Full Waiver)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Reason for Request</label>
                  <Textarea required placeholder="Please explain your financial situation..." className="h-24 resize-none rounded-xl bg-background/50" />
                </div>
                
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-md text-white">
                    Submit to Principal
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

      <div className="px-5 space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="p-6 rounded-3xl border-orange-500/20 bg-background/60 backdrop-blur-md shadow-lg shadow-orange-500/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4 mt-2">
            <RiWallet3Line className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">March Tuition</h2>
          <div className="text-5xl font-black text-foreground tracking-tighter mb-4">₹24,500<span className="text-2xl text-muted-foreground">.00</span></div>
          
          <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-xl text-base font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all active:scale-95">
                <RiQrCodeLine className="w-5 h-5 mr-2" />
                Pay via QR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-background/95 backdrop-blur-xl border-border/50 text-center">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Scan to Pay</DialogTitle>
                <DialogDescription className="text-center">
                  Scan this QR code with any UPI or payment app. Amount: ₹24,500.00
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col items-center justify-center py-6 space-y-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm border-2 border-dashed border-muted-foreground/30 relative">
                  <div className="w-48 h-48 bg-black/5 rounded flex items-center justify-center flex-col gap-2">
                     <span className="text-xs font-bold text-black opacity-50 uppercase tracking-widest">SikshaTantar Pay</span>
                  </div>
                  
                  {paymentStatus === "submitted" && (
                     <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                          <RiCheckLine className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-bold text-lg text-emerald-600">Screenshot Sent!</p>
                        <p className="text-xs text-muted-foreground mt-1 px-4 text-center">School administration will review and approve your payment shortly.</p>
                     </div>
                  )}
                </div>
                
                {paymentStatus !== "submitted" && (
                  <div className="w-full space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground">Done paying? Upload your screenshot for verification.</p>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    <Button onClick={handleUploadClick} disabled={paymentStatus === "uploading"} className="w-full h-12 rounded-xl border-2 border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold transition-all">
                      {paymentStatus === "uploading" ? (
                        <div className="flex items-center">
                          <RiTimeLine className="w-5 h-5 mr-2 animate-spin" /> Uploading...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <RiUploadCloud2Line className="w-5 h-5 mr-2" /> Upload Screenshot
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              {paymentStatus === "submitted" && (
                <DialogFooter className="sm:justify-center">
                  <Button onClick={() => setIsPayDialogOpen(false)} className="w-full rounded-xl" variant="outline">
                    Close
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </Card>

        {/* Concession Requests List */}
        {concessionRequests.length > 0 && (
          <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
            <h3 className="font-bold text-lg">Concession Requests</h3>
            <div className="space-y-3">
              {concessionRequests.map((req) => (
                <Card key={req.id} className="p-4 rounded-2xl border-border/40 bg-muted/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-base capitalize">{req.type} Concession</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{req.date}</div>
                    </div>
                    <div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border", getStatusColor(req.status))}>
                      {getStatusIcon(req.status)}
                      {req.status}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-background/50 rounded-lg p-2 mt-3 mb-2 border border-border/30">
                    <div className="text-center flex-1 border-r border-border/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Requested</div>
                      <div className="font-bold">{req.percentRequested}% Off</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Approved</div>
                      <div className={cn("font-bold", req.status === "Approved" ? "text-emerald-500" : "")}>
                        {req.status === "Pending" ? "--" : `${req.percentApproved}% Off`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded-lg border-l-2 border-primary/30">
                    <span className="font-semibold not-italic">Principal's Note:</span> {req.note}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Existing Monthly List */}
        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <h3 className="font-bold text-lg">Monthly Breakdown</h3>
          
          <div className="space-y-3">
            {months.map((month, idx) => (
              <Card key={idx} className={`p-4 rounded-2xl flex flex-col gap-3 ${month.status === 'Pending' ? 'border-orange-500/30 bg-orange-500/5' : 'border-border/40 bg-muted/20 opacity-80'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${month.status === 'Pending' ? 'bg-orange-500/20 text-orange-600' : 'bg-emerald-500/20 text-emerald-600'}`}>
                    {month.status === 'Pending' ? <RiTimeLine className="w-5 h-5" /> : <RiCheckLine className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{month.month} Tuition</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{month.due}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${month.status === 'Pending' ? 'text-orange-600 dark:text-orange-400' : 'line-through text-muted-foreground decoration-foreground/30'}`}>
                      ₹{month.amount * 45}.00
                    </div>
                    <div className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${month.status === 'Pending' ? 'text-orange-600/70' : 'text-emerald-600'}`}>
                      {month.status}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-border/40">
                  <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs bg-background/50 hover:bg-background border border-border/50 text-muted-foreground">
                    <RiDownloadLine className="w-3.5 h-3.5 mr-1.5" /> Invoice
                  </Button>
                  {month.status === 'Paid' && (
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs bg-background/50 hover:bg-background border border-border/50 text-emerald-600 dark:text-emerald-400">
                      <RiFileList3Line className="w-3.5 h-3.5 mr-1.5" /> Receipt
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
