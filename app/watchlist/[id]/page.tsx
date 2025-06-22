import { Suspense } from 'react'
import { WatchlistContent } from './watchlist-content'
import { ProtectedRoute } from '@/components/protected-route'

interface WatchlistPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WatchlistPage({ params }: WatchlistPageProps) {
  const { id } = await params
  
  return (
    <ProtectedRoute>
      <Suspense fallback={<WatchlistSkeleton />}>
        <WatchlistContent watchlistId={id} />
      </Suspense>
    </ProtectedRoute>
  )
}

function WatchlistSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/20 rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/50 rounded-full"></div>
                <div className="w-32 h-8 bg-primary/50 rounded"></div>
              </div>
            </div>
            <div className="w-10 h-10 bg-primary/20 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Watchlist Header Skeleton */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="h-16 w-96 bg-primary/30 rounded-lg mb-4"></div>
              <div className="h-6 w-64 bg-secondary/30 rounded-lg mb-6"></div>
              <div className="flex items-center gap-8">
                <div className="h-6 w-32 bg-primary/20 rounded-lg"></div>
                <div className="h-6 w-24 bg-secondary/20 rounded-lg"></div>
                <div className="h-6 w-28 bg-secondary/20 rounded-lg"></div>
              </div>
            </div>
            <div className="w-32 h-12 bg-red-500/20 rounded-lg"></div>
          </div>
        </div>

        {/* Watchlist Items Skeleton */}
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-secondary/20 border-2 border-border/20 rounded-lg p-8">
              <div className="flex gap-8">
                <div className="w-32 h-48 bg-secondary/30 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 w-64 bg-primary/30 rounded-lg"></div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-16 bg-yellow-400/30 rounded-lg"></div>
                    <div className="h-6 w-20 bg-secondary/30 rounded-lg"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-secondary/30 rounded"></div>
                    <div className="h-4 w-3/4 bg-secondary/30 rounded"></div>
                    <div className="h-4 w-1/2 bg-secondary/30 rounded"></div>
                  </div>
                  <div className="h-4 w-32 bg-secondary/30 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-secondary/30 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
