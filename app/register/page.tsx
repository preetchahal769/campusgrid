import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Register() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] justify-center p-6 bg-gradient-to-tl from-muted/20 to-background">
      <div className="w-full max-w-sm mx-auto animate-in zoom-in-95 duration-500">
        <div className="mb-8 text-center pt-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 -rotate-3">
            <svg className="w-8 h-8 text-primary-foreground rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join CampusGrid to connect with your peers</p>
        </div>

        <Card className="shadow-2xl border-border/50 bg-background/60 backdrop-blur-xl">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input id="name" placeholder="John Doe" className="h-12 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/50 transition-shadow rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">University Email</Label>
              <Input id="email" type="email" placeholder="student@campus.edu" className="h-12 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/50 transition-shadow rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input id="password" type="password" className="h-12 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/50 transition-shadow rounded-xl" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-6 px-6">
            <Button className="w-full h-12 text-md font-bold rounded-xl shadow-md transition-transform active:scale-95">Sign Up</Button>
            <div className="text-sm text-center text-muted-foreground font-medium w-full">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
