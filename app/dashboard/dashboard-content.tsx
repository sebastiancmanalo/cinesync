'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { WatchlistCard } from './watchlist-card'
import { RecommendationCard } from './recommendation-card'
import { Button } from '@/components/ui/button'
import { Film, PlusCircle, Settings, Users2, ListVideo, Star } from 'lucide-react'
import Link from 'next/link'
import type { Watchlist } from '@/types/database'

interface Movie {
  id: number
  title: string
  overview: string
  poster_path?: string
  release_date: string
  runtime: number
  vote_average: number
  genres: Array<{ id: number; name: string }>
  reason: string
}

export function DashboardContent() {
  const { user } = useAuth()
  const [ownedWatchlists, setOwnedWatchlists] = useState<Watchlist[]>([])
  const [sharedWatchlists, setSharedWatchlists] = useState<Watchlist[]>([])
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return
      
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setOwnedWatchlists(data.ownedWatchlists || [])
          setSharedWatchlists(data.sharedWatchlists || [])
        }
      } catch (error) {
        console.error('Error fetching watchlists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/recommendations?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setRecommendations(data.recommendations || [])
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setRecommendationsLoading(false)
      }
    }

    fetchRecommendations()
  }, [user?.id])

  function renderWatchlistSection(title: string, watchlists: Watchlist[]) {
    return (
      <div>
        <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-6">{title}</h2>
        {watchlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlists.map(w => <WatchlistCard key={w.id} watchlist={w} />)}
          </div>
        ) : (
          <div className="text-center py-12 px-6 border-2 border-border/20 rounded-lg bg-background/50 backdrop-blur-sm">
            <ListVideo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-sans text-muted-foreground">No {title.toLowerCase()} yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Create your first watchlist to get started!</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-primary/20 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-lg p-6 shadow-lg">
                  <div className="h-6 bg-primary/20 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalWatchlists = ownedWatchlists.length + sharedWatchlists.length
  const totalItems = ownedWatchlists.reduce((sum, w) => sum + ((w as any).items?.length || 0), 0) + 
                    sharedWatchlists.reduce((sum, w) => sum + ((w as any).items?.length || 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <span className="text-2xl sm:text-4xl font-logo tracking-wider">
                  CineSync
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                asChild 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                <Link href="/lists/new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Watchlist
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                <Link href="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Hero Section - Add New Watchlist Focus */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl font-heading text-primary mb-6">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Movie Lover'}!
          </h1>
          <p className="text-lg sm:text-xl font-sans text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to discover your next favorite film? Create a new watchlist and start curating your cinematic journey.
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium text-lg px-8 py-4"
          >
            <Link href="/lists/new">
              <PlusCircle className="w-6 h-6 mr-3" />
              Create New Watchlist
            </Link>
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-lg p-6 text-center">
            <ListVideo className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-2xl font-heading text-primary">{totalWatchlists}</div>
            <div className="text-sm font-sans text-muted-foreground">Total Watchlists</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-lg p-6 text-center">
            <Film className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-2xl font-heading text-primary">{totalItems}</div>
            <div className="text-sm font-sans text-muted-foreground">Movies & Shows</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-lg p-6 text-center">
            <Users2 className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-2xl font-heading text-primary">{sharedWatchlists.length}</div>
            <div className="text-sm font-sans text-muted-foreground">Shared Lists</div>
          </div>
        </div>

        {/* Watchlists Section */}
        <div className="space-y-12">
          {renderWatchlistSection("Your Watchlists", ownedWatchlists)}
          {renderWatchlistSection("Shared With You", sharedWatchlists)}
        </div>

        {/* Recommendations Section - Moved to bottom */}
        <div className="mt-16">
          <h2 className="text-3xl sm:text-4xl font-heading text-primary mb-6 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            What to Watch
          </h2>
          {recommendationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background/50 backdrop-blur-sm border border-border/20 rounded-lg shadow-lg animate-pulse p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-36 bg-muted-foreground/20 rounded"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                      <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((movie) => (
                <RecommendationCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 border-2 border-border/20 rounded-lg bg-background/50 backdrop-blur-sm">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-sans text-muted-foreground">No recommendations available.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Add some movies to your watchlists to get personalized recommendations!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 