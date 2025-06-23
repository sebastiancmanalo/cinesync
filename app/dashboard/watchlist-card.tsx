import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film } from 'lucide-react'
import type { Watchlist } from '@/types/database'

interface WatchlistCardProps {
  watchlist: Watchlist & { items?: any[] }
  reviewsByItem: Record<string, any[]>
}

export function WatchlistCard({ watchlist, reviewsByItem }: WatchlistCardProps) {
  return (
    <Link href={`/watchlist/${watchlist.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white/95">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              {watchlist.name}
            </CardTitle>
          </div>
          {watchlist.description && (
            <CardDescription className="text-gray-600">
              {watchlist.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-gray-500 mb-2">
            Created {new Date(watchlist.created_at).toLocaleDateString()}
          </div>
          {watchlist.items && watchlist.items.length > 0 && (
            <div className="space-y-2">
              {watchlist.items.slice(0, 3).map(item => {
                const reviews = reviewsByItem[item.id] || [];
                const watchedCount = reviews.filter(r => r.watched).length;
                const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + (r.review_rating || 0), 0) / reviews.length) : 0;
                const recentReviews = reviews.filter(r => r.review_text).slice(0, 2);
                return (
                  <div key={item.id} className="border-b pb-2 last:border-b-0">
                    <div className="font-semibold text-gray-800">{item.title}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{watchedCount} watched</span>
                      <span className="ml-2">Avg rating: {avgRating.toFixed(1)}</span>
                    </div>
                    {recentReviews.map(r => (
                      <div key={r.id} className="flex items-center gap-2 text-xs bg-secondary/10 rounded p-1 mt-1">
                        <img src={r.profiles?.avatar_url || "/placeholder-user.jpg"} alt="avatar" className="w-5 h-5 rounded-full" />
                        <span className="font-semibold">{r.profiles?.full_name || "Unknown"}</span>
                        {typeof r.review_rating === 'number' && r.review_rating > 0 && (
                          <span className="ml-1 text-yellow-400">{[...Array(r.review_rating)].map((_, i) => <span key={i}>★</span>)}</span>
                        )}
                        {r.review_text && (
                          <span className="ml-2 text-muted-foreground">{r.review_text}</span>
                        )}
                        {r.watched && r.watched_at && (
                          <span className="ml-2 text-green-700 bg-green-100 rounded px-2 py-0.5">Watched {new Date(r.watched_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
} 