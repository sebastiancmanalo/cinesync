import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Calendar, Star, Play, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">WatchTogether</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never Wonder{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              What to Watch
            </span>{" "}
            Again
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create shared watchlists with friends and family. Get smart recommendations based on your available time,
            track what you've watched, and never lose track of that perfect movie again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Watching Together
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Perfect Movie Nights</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From smart time estimates to streaming availability, WatchTogether makes coordinating your viewing
            experience effortless.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Shared Watchlists</CardTitle>
              <CardDescription>
                Create lists with friends, family, or roommates. Everyone can add, vote, and comment on what to watch
                next.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Clock className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Smart Time Estimates</CardTitle>
              <CardDescription>
                Know exactly how long your watchlist will take. Get suggestions based on your available time tonight.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Streaming Availability</CardTitle>
              <CardDescription>
                See where each title is available to stream. Filter by your shared subscription services.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Star className="w-12 h-12 text-yellow-600 mb-4" />
              <CardTitle>Group Voting</CardTitle>
              <CardDescription>
                Vote on what to watch next. Smart sorting helps you find the perfect compromise for movie night.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Calendar className="w-12 h-12 text-red-600 mb-4" />
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>
                Schedule watch sessions and sync with your calendar. Never miss a planned movie night again.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Play className="w-12 h-12 text-indigo-600 mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Mark episodes as watched, track series progress, and see your viewing history at a glance.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Movie Nights?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who've already discovered the joy of organized, shared viewing experiences.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Play className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900">WatchTogether</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-gray-900">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
