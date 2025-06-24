import { Suspense } from 'react'
import { WatchlistContent } from './watchlist-content'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface WatchlistPageProps {
  params: Promise<{
    id: string
  }>
}

// This is the main data-fetching component for the page
async function WatchlistData({ id }: { id: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This should be handled by RLS, but as a fallback
    return redirect('/login')
  }

  const { data: watchlist, error } = await supabase
    .from('watchlists')
    .select(
      `
      id,
      name,
      description,
      owner_id,
      watchlist_items (
        *,
        profiles (id, full_name, avatar_url)
      ),
      watchlist_members (
        *,
        profiles (id, full_name, avatar_url)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !watchlist) {
    console.error('Error fetching watchlist:', error)
    // Render a user-friendly error state
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load watchlist. It might not exist or you may not have
              permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // The watchlist data is passed as a prop to the client component
  return <WatchlistContent initialWatchlist={watchlist} />
}

export default async function WatchlistPage({ params }: WatchlistPageProps) {
  const { id } = await params
  
    return (
    // The ProtectedRoute is no longer needed here as auth is checked during data fetching
      <Suspense fallback={<WatchlistSkeleton />}>
      <WatchlistData id={id} />
      </Suspense>
    )
  }

function WatchlistSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
