"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Film, PlusCircle, Settings, Users, Star, PlayCircle, Users2, ListVideo } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"

// Movie interface for recommendations
interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average: number;
}

// Watchlist interface
interface Watchlist {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    item_count: number;
    member_count: number;
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/"

export default function DashboardPage() {
    const { user } = useAuth()
    const [recommendations, setRecommendations] = useState<Movie[]>([])
    const [ownedWatchlists, setOwnedWatchlists] = useState<Watchlist[]>([])
    const [sharedWatchlists, setSharedWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
        const fetchData = async () => {
            try {
      setLoading(true)
                
                // Fetch all dashboard data from our simple API
                const response = await fetch('/api/dashboard')
                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard data")
                }
                const data = await response.json()
                
                setRecommendations(data.recommendations || [])
                setOwnedWatchlists(data.owned || [])
                setSharedWatchlists(data.shared || [])

            } catch (err) {
                setError("Failed to load dashboard data. Please try again later.")
                console.error(err)
    } finally {
      setLoading(false)
    }
  }

        fetchData()
    }, [])

    const heroMovie = recommendations.length > 0 ? recommendations[0] : null
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

    if (loading) {
        return <DashboardSkeleton />
    }

      if (error) {
    return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
          <div className="text-center">
                    <h2 className="text-2xl font-heading">Something went wrong</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
        </div>
    )
  }

  return (
    <ProtectedRoute>
            <div className="bg-background min-h-screen text-foreground font-sans">
        {/* Header */}
                <header className="fixed top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent z-50 transition-all duration-300">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                <span className="text-2xl sm:text-4xl font-logo tracking-wider">
                                    CineSync
                  </span>
                </Link>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Button asChild variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                                    <Link href="/lists/new">
                                        <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </Link>
                </Button>
                                <Button asChild variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                                    <Link href="/settings">
                                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

                <main>
                    {/* Hero Section */}
                    {heroMovie && (
                        <section
                            className="h-[60vh] sm:h-[70vh] flex items-end justify-start text-white p-4 sm:p-8 relative bg-cover bg-center"
                            style={{
                                backgroundImage: `linear-gradient(to top, rgba(19,15,12,1) 0%, rgba(19,15,12,0) 50%), url(${TMDB_IMAGE_BASE_URL}original${heroMovie.backdrop_path})`,
                            }}
                        >
                            <div className="z-10 max-w-2xl">
                                <h2 className="text-lg sm:text-2xl font-sans text-yellow-300 mb-2 sm:mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                                    Welcome, {userName}
                                </h2>
                                <h1 className="text-3xl sm:text-6xl font-heading text-white shadow-lg mb-2 sm:mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                                    {heroMovie.title}
                                </h1>
                                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="font-bold text-base sm:text-lg">{heroMovie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                                <p className="text-sm sm:text-lg text-gray-300 font-sans line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                                    {heroMovie.overview}
                                </p>
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base sm:text-lg py-3 sm:py-6 px-6 sm:px-8">
                                    <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                    Watch Trailer
                                </Button>
                      </div>
                        </section>
                    )}

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
                        {/* Your Watchlists Section */}
                        <section>
                            <h2 className="text-2xl sm:text-4xl font-heading mb-6 sm:mb-8">Your Watchlists</h2>
                            {ownedWatchlists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                                    {ownedWatchlists.map(watchlist => (
                                        <WatchlistCard key={watchlist.id} watchlist={watchlist} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12 px-4 sm:px-6 bg-secondary/20 rounded-lg">
                                    <h3 className="text-lg sm:text-xl font-semibold">You haven't created any watchlists yet.</h3>
                                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">Create a watchlist to start adding movies and sharing with friends.</p>
                                    <Button asChild className="mt-4">
                                        <Link href="/lists/new">
                                            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                            Create Your First Watchlist
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </section>

                        {/* Shared With You Section */}
                        <section className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t-2 border-dashed border-border/20">
                            <h2 className="text-2xl sm:text-4xl font-heading mb-6 sm:mb-8 text-primary">Shared With You</h2>
                            {sharedWatchlists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                                    {sharedWatchlists.map(watchlist => (
                                        <WatchlistCard key={watchlist.id} watchlist={watchlist} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12 px-4 sm:px-6 bg-secondary/20 rounded-lg">
                                    <h3 className="text-lg sm:text-xl font-semibold">No watchlists have been shared with you.</h3>
                                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">When a friend shares a watchlist, it will appear here.</p>
                                </div>
                            )}
                        </section>

                        {/* What to Watch Section */}
                        <section className="mt-12 sm:mt-16">
                            <h2 className="text-2xl sm:text-4xl font-heading mb-6 sm:mb-8">What to Watch</h2>
                            {recommendations.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                                    {recommendations.map(movie => (
                                        <RecommendationCard key={movie.id} movie={movie} />
                                    ))}
                              </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12 px-4 sm:px-6 bg-secondary/20 rounded-lg">
                                    <h3 className="text-lg sm:text-xl font-semibold">No recommendations available right now.</h3>
                                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">Add some movies to your watchlists to get personalized recommendations.</p>
                  </div>
                )}
                        </section>
                    </div>
                </main>
              </div>
        </ProtectedRoute>
    )
}

const WatchlistCard = ({ watchlist }: { watchlist: Watchlist }) => (
    <Link href={`/watchlist/${watchlist.id}`} className="block group">
        <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 p-4 sm:p-6 rounded-xl border-2 border-transparent group-hover:border-primary transition-all duration-300 h-full flex flex-col justify-between shadow-lg">
            <div>
                <h3 className="text-lg sm:text-2xl font-heading text-primary group-hover:text-yellow-300 transition-colors mb-2 sm:mb-3">{watchlist.name}</h3>
                <p className="text-muted-foreground text-sm sm:text-base font-sans line-clamp-2">{watchlist.description}</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground font-sans">
                <div className="flex items-center gap-1 sm:gap-2">
                    <ListVideo className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{watchlist.item_count} items</span>
                          </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <Users2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{watchlist.member_count} members</span>
                          </div>
                        </div>
                    </div>
    </Link>
);

const RecommendationCard = ({ movie }: { movie: Movie }) => (
    <div className="flex-shrink-0 w-full group">
        <div className="relative overflow-hidden rounded-lg shadow-lg">
            <img
                src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}w500${movie.poster_path}` : "/placeholder.svg"}
                              alt={movie.title}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-2 sm:p-4">
                <h3 className="font-bold text-white text-sm sm:text-lg leading-tight">{movie.title}</h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                </div>
            </div>
                          </div>
        <div className="mt-2 sm:mt-3">
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">{movie.overview}</p>
                          </div>
                        </div>
);

const DashboardSkeleton = () => (
    <div className="bg-background min-h-screen text-foreground animate-pulse">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/50 rounded-full"></div>
                        <div className="w-20 sm:w-32 h-6 sm:h-8 bg-primary/50 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full"></div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full"></div>
                    </div>
                </div>
            </div>
        </header>

        {/* Hero Skeleton */}
        <section className="h-[60vh] sm:h-[70vh] bg-secondary/20 flex items-end p-4 sm:p-8">
            <div className="max-w-2xl">
                <div className="h-6 sm:h-8 w-32 sm:w-48 bg-yellow-300/30 rounded-lg mb-2 sm:mb-4"></div>
                <div className="h-8 sm:h-16 w-48 sm:w-96 bg-gray-400/30 rounded-lg mb-2 sm:mb-4"></div>
                <div className="h-4 sm:h-6 w-24 sm:w-32 bg-gray-400/30 rounded-lg mb-2 sm:mb-4"></div>
                <div className="h-4 sm:h-5 w-full bg-gray-400/30 rounded-lg mb-1 sm:mb-2"></div>
                <div className="h-4 sm:h-5 w-3/4 bg-gray-400/30 rounded-lg mb-4 sm:mb-6"></div>
                <div className="h-12 sm:h-16 w-32 sm:w-48 bg-primary/50 rounded-lg"></div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
            {/* Watchlists Skeleton */}
            <section>
                <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-400/30 rounded-lg mb-6 sm:mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-secondary/20 p-4 sm:p-6 rounded-xl h-32 sm:h-40"></div>
                    ))}
        </div>
            </section>
            {/* Recommendations Skeleton */}
            <section className="mt-12 sm:mt-16">
                <div className="h-8 sm:h-10 w-56 sm:w-80 bg-gray-400/30 rounded-lg mb-6 sm:mb-8"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i}>
                            <div className="w-full aspect-[2/3] bg-secondary/20 rounded-lg"></div>
                            <div className="h-3 sm:h-4 w-3/4 bg-gray-400/30 rounded-lg mt-2 sm:mt-3"></div>
                            <div className="h-3 sm:h-4 w-1/2 bg-gray-400/30 rounded-lg mt-1 sm:mt-2"></div>
              </div>
                    ))}
              </div>
            </section>
            </div>
      </div>
);