import { Geist, Geist_Mono, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { StoreProvider } from "@/lib/store/StoreProvider"
import { GoogleAnalytics } from "@next/third-parties/google"
import { BugReporter } from "@/components/BugReporter"
import { DebugMenu } from "@/components/DebugMenu"

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  metadataBase: new URL("https://sikshatantar.app"),
  alternates: {
    canonical: "/",
  },
  title: "SikshaTantar | The Modern School Operating System",
  description: "A beautiful, lightning-fast platform that connects students, empowers teachers, and gives administrators total control. Built for schools of all sizes.",
  keywords: ["School ERP", "School Management System", "EdTech", "Student Portal", "Teacher Dashboard", "SikshaTantar"],
  openGraph: {
    title: "SikshaTantar | The Modern School Operating System",
    description: "A beautiful, lightning-fast platform that connects students, empowers teachers, and gives administrators total control.",
    url: "https://sikshatantar.app",
    siteName: "SikshaTantar",
    images: [
      {
        url: "https://sikshatantar.app/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, outfit.variable, "font-sans")} >
      <body suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </ThemeProvider>
          <BugReporter />
          <DebugMenu />
        </StoreProvider>
        <GoogleAnalytics gaId="G-N8L8H47Y5Y" />
      </body>
    </html>
  )
}
