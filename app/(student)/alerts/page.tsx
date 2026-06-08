import { Card } from "@/components/ui/card"
import { RiNotification3Line, RiCheckDoubleLine, RiCalendarCheckLine, RiMessage3Line } from "@remixicon/react"

export default function AlertsPage() {
  const alerts = [
    { id: 1, type: 'event', icon: RiCalendarCheckLine, title: "Tech Meetup Tomorrow", time: "2 hours ago", desc: "Don't forget to RSVP for the annual campus tech meetup.", unread: true },
    { id: 2, type: 'message', icon: RiMessage3Line, title: "Alex sent you a message", time: "5 hours ago", desc: "Hey, are we still studying at the library tonight?", unread: true },
    { id: 3, type: 'system', icon: RiNotification3Line, title: "Profile Updated", time: "1 day ago", desc: "Your profile information was updated successfully.", unread: false },
  ]

  return (
    <div className="min-h-screen pb-10 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tight text-white">Alerts</h1>
          <p className="text-xs text-white/70 font-medium">Stay updated with your campus life</p>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white">
          <RiCheckDoubleLine className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 space-y-4 pt-2">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <Card 
                key={alert.id} 
                className={`p-4 border-border/40 backdrop-blur-md rounded-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both flex gap-4 items-start ${alert.unread ? 'bg-background/80 shadow-md' : 'bg-background/40 shadow-sm opacity-70'}`}
                style={{ animationDelay: `${100 * (index + 1)}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.unread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold text-base truncate ${alert.unread ? 'text-foreground' : 'text-foreground/80'}`}>{alert.title}</h3>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap ml-2 mt-1">{alert.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">{alert.desc}</p>
                </div>
                {alert.unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                )}
              </Card>
            )
          })}
        </div>
    </div>
  )
}
