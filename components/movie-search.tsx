"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Loader2, CheckCircle, Film, Tv, X } from "lucide-react"
import Image from "next/image"
import { useDebounce } from "@/hooks/use-debounce"
import { getImageUrl, getMediaTitle, getMediaYear } from "@/lib/tmdb"
import type { TMDBSearchResult } from "@/lib/tmdb"
import { useRouter } from "next/navigation"

interface MovieSearchProps {
  watchlistId: string
  onSelect: (movie: TMDBSearchResult) => void
  onClose: () => void
  isOpen: boolean
}

export function MovieSearch({ watchlistId, onSelect, onClose, isOpen }: MovieSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TMDBSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setResults([])
      setError(null)
      return
    }
  }, [isOpen])

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([])
        return
      }

    const searchMovies = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        
        if (!response.ok) {
          throw new Error("Failed to search")
        }
        
        const data = await response.json()
        setResults(data.results || [])
      } catch (err) {
        console.error("Search error:", err)
        setError("Failed to search movies. Please try again.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    searchMovies()
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSelect = (movie: TMDBSearchResult) => {
    onSelect(movie)
    onClose()
    }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={searchRef}
        className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Search Movies & TV Shows</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
        </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for movies or TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Searching...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="p-4 space-y-3">
              {results.map((movie) => (
                <Card 
                  key={`${movie.media_type}-${movie.id}`}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelect(movie)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                          <div className="flex-shrink-0">
                        <img
                          src={getImageUrl(movie.poster_path || '', 'w200')}
                          alt={getMediaTitle(movie)}
                          className="w-16 h-24 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder.svg'
                          }}
                            />
                          </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {getMediaTitle(movie)}
                                </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {movie.media_type === 'movie' ? (
                                  <Film className="w-3 h-3 mr-1" />
                                ) : (
                                  <Tv className="w-3 h-3 mr-1" />
                                )}
                                {movie.media_type === 'movie' ? 'Movie' : 'TV'}
                                  </Badge>
                              {getMediaYear(movie) && (
                                <span className="text-sm text-muted-foreground">
                                  {getMediaYear(movie)}
                                </span>
                              )}
                              {movie.vote_average > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  ⭐ {movie.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {movie.overview && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {movie.overview}
                          </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              ))}
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
