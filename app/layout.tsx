import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WatchTogether - Shared Movie & TV Watchlists",
  description:
    "Create and manage shared watchlists with friends. Track movies and TV shows with automatic time estimation.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}
