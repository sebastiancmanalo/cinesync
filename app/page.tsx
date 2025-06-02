"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Calendar, Star, Play, Zap, Film, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              WatchTogether
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-yellow-400">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Film className="h-12 w-12 text-yellow-400 mr-4" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              WatchTogether
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            Create shared watchlists with friends and family. Track movies and TV shows, estimate watch times, and never
            run out of great content to enjoy together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium text-lg px-8 py-4"
              >
                Start Watching Together
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need for Perfect Movie Nights</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From smart time estimates to streaming availability, WatchTogether makes coordinating your viewing
            experience effortless.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Users className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Shared Watchlists</CardTitle>
              <CardDescription className="text-slate-300">
                Create lists with friends, family, or roommates. Everyone can add, vote, and comment on what to watch
                next.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Clock className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Smart Time Estimates</CardTitle>
              <CardDescription className="text-slate-300">
                Know exactly how long your watchlist will take. Get suggestions based on your available time tonight.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Streaming Availability</CardTitle>
              <CardDescription className="text-slate-300">
                See where each title is available to stream. Filter by your shared subscription services.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Star className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Group Voting</CardTitle>
              <CardDescription className="text-slate-300">
                Vote on what to watch next. Smart sorting helps you find the perfect compromise for movie night.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Calendar className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Calendar Integration</CardTitle>
              <CardDescription className="text-slate-300">
                Schedule watch sessions and sync with your calendar. Never miss a planned movie night again.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Play className="w-12 h-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Progress Tracking</CardTitle>
              <CardDescription className="text-slate-300">
                Mark episodes as watched, track series progress, and see your viewing history at a glance.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-12 text-center border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Movie Nights?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of users who've already discovered the joy of organized, shared viewing experiences.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium text-xl px-12 py-6"
            >
              Get Started for Free
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Film className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-semibold text-white">WatchTogether</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
