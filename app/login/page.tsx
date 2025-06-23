"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Film } from "lucide-react"
import Link from "next/link"
import { FaGoogle } from "react-icons/fa"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const supabase = createClient()
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.2)
            border-left-color: #ffd700
            border-radius: 50%
            width: 50px
            height: 50px
            animation: spin 1s linear infinite
          }
          @keyframes spin {
            to { transform: rotate(360deg) }
          }
        `}</style>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <Film className="w-8 h-8" />
          <span className="text-2xl font-logo tracking-wider">CineSync</span>
        </Link>
      </div>
      <Card className="w-full max-w-sm bg-background/50 backdrop-blur-sm border-border/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-heading text-primary">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground text-md pt-2">
            Sign in to continue to your watchlists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full h-12 text-lg bg-white text-black hover:bg-gray-200 flex items-center justify-center"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="mr-3" />
            <span>Continue with Google</span>
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-4">
            By continuing, you agree to our Terms of Service.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
