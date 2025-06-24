"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, ArrowLeft, Users, Sparkles, Star } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FaGoogle } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError("")
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })
      if (error) setError(error.message)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.2);
            border-left-color: #ffd700;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg) }
          }
        `}</style>
      </div>
    )
  }

  if (user) return null

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
          <CardTitle className="text-3xl font-heading text-primary">Create Your Account</CardTitle>
          <CardDescription className="text-muted-foreground text-md pt-2">Start your movie journey with friends.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-2 mb-2 bg-red-900/20 text-red-300 rounded text-sm">{error}</div>
          )}
          <Button 
            className="w-full h-12 text-lg bg-white text-black hover:bg-gray-200 flex items-center justify-center"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <FaGoogle className="mr-3" />
            <span>{isLoading ? "Creating account..." : "Continue with Google"}</span>
          </Button>
          <ul className="mt-6 mb-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>Collaborative watchlists</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>Personalized recommendations</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>Per-user reviews & ratings</li>
          </ul>
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary text-xs font-medium hover:underline">Sign in</Link>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            By continuing, you agree to our Terms of Service.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
