import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display, Lora, Bebas_Neue } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair_display = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair-display",
})
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
})
const bebas_neue = Bebas_Neue({ 
  subsets: ["latin"], 
  weight: "400",
  variable: "--font-bebas-neue",
})

export const metadata: Metadata = {
  title: "CineSync - Your Social Watchlist",
  description: "Create, share, and sync watchlists with friends.",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair_display.variable} ${lora.variable} ${bebas_neue.variable} dark`}>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">{children}</div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
