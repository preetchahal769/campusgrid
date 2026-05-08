import { Geist, Geist_Mono, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { StoreProvider } from "@/lib/store/StoreProvider"

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  title: "CampusGrid",
  description: "Connect. Collaborate. Excel.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, outfit.variable, "font-sans")} >
      <body>
        <StoreProvider>
          <ThemeProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
