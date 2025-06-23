"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Calendar, Star, Play, Zap, Film, ArrowRight, Clapperboard, MessageSquareQuote } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      padding: 2rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.08);
    }
    .icon-wrapper {
      display: inline-flex;
      padding: 1rem;
      border-radius: 9999px;
      background: rgba(255, 215, 0, 0.1); /* Gold/Primary color */
    }
    .loader {
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-left-color: #ffd700; /* gold/primary */
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="loader"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 py-6 px-4 sm:px-8 bg-gradient-to-b from-black/60 to-transparent">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Film className="w-8 h-8 text-primary" />
            <span className="text-3xl font-logo tracking-wider text-white">
              CineSync
            </span>
          </Link>
          <div className="space-x-2">
            <Button asChild variant="ghost" className="text-white hover:bg-primary/20 hover:text-primary">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary text-black font-bold hover:bg-primary/90">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-black via-purple-900/50 to-black">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 text-white">
          <h1 className="text-5xl md:text-7xl font-heading mb-4 leading-tight">
            Share the Magic of Movies.
          </h1>
          <p className="text-xl md:text-2xl font-light text-muted-foreground max-w-3xl mx-auto mb-8">
            Create shared watchlists, discover films, and discuss your favorites with friends and family. Your next movie night, perfected.
          </p>
          <Button asChild size="lg" className="bg-primary text-black font-bold text-lg px-8 py-6 hover:bg-primary/90">
            <Link href="/login">Start Watching Together</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading text-center mb-12 text-primary">
            Everything You Need for Perfect Movie Nights
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="feature-card">
              <div className="icon-wrapper">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-heading mt-4 mb-2">Shared Watchlists</h3>
              <p className="text-muted-foreground">
                Collaborate on the ultimate movie queue. Everyone can add, vote, and see what's next.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-wrapper">
                <Clapperboard className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-heading mt-4 mb-2">Discover & Track</h3>
              <p className="text-muted-foreground">
                Find new gems and keep track of what you've watched, all in one place.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-wrapper">
                <MessageSquareQuote className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-heading mt-4 mb-2">Review & Discuss</h3>
              <p className="text-muted-foreground">
                Leave reviews, see what your friends thought, and settle the "best movie" debate once and for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CineSync. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
