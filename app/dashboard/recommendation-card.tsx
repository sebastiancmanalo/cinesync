import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Star } from 'lucide-react'

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

interface RecommendationCardProps {
  movie: Movie
}

export function RecommendationCard({ movie }: RecommendationCardProps) {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
    : '/placeholder.svg'

  return (
    <Card className="bg-white/95 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-24 h-36 object-cover rounded shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder.svg'
            }}
          />
          <div className="flex-1 space-y-2 py-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {movie.overview}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{movie.runtime} min</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre) => (
                <Badge key={genre.id} variant="secondary" className="text-xs">
                  {genre.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-blue-600 font-medium">
              {movie.reason}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 