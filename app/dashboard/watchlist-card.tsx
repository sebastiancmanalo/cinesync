import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film } from 'lucide-react'
import type { Watchlist } from '@/types/database'

interface WatchlistCardProps {
  watchlist: Watchlist
}

export function WatchlistCard({ watchlist }: WatchlistCardProps) {
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
          <div className="text-sm text-gray-500">
            Created {new Date(watchlist.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 