"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Loader2, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useDebounce } from "@/hooks/use-debounce"
import { addMediaToWatchlist } from "@/app/actions/watchlist-actions"
import { getImageUrl, getMediaTitle, getMediaYear } from "@/lib/tmdb"
import type { TMDBSearchResult } from "@/lib/tmdb"

interface MovieSearchProps {
  watchlistId: string
}

export function MovieSearch({ watchlistId }: MovieSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set())
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const searchMedia = async () => {
      if (debouncedQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`)
        if (!response.ok) throw new Error("Search failed")
        const data = await response.json()
        setSearchResults(data)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    searchMedia()
  }, [debouncedQuery])

  const handleAddToWatchlist = async (movie: TMDBSearchResult) => {
    const itemKey = `${movie.media_type}-${movie.id}`
    setAddingItems((prev) => new Set([...prev, itemKey]))
    setError("")

    try {
      const result = await addMediaToWatchlist(watchlistId, movie.id, movie.media_type)

      if (result.success) {
        setAddedItems((prev) => new Set([...prev, itemKey]))
        // Remove from search results after a delay
        setTimeout(() => {
          setSearchResults((prev) => prev.filter((item) => `${item.media_type}-${item.id}` !== itemKey))
        }, 1000)
      } else {
        setError(result.error || "Failed to add item")
      }
    } catch (error: any) {
      setError(error.message || "Failed to add item")
    } finally {
      setAddingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemKey)
        return newSet
      })
    }
  }

  const resetDialog = () => {
    setSearchQuery("")
    setSearchResults([])
    setAddedItems(new Set())
    setError("")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Add Movie/Show
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col bg-white/95 border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">Add Movies & TV Shows</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Input */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for movies and TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/95 text-gray-900 border-gray-300"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((item) => {
                  const itemKey = `${item.media_type}-${item.id}`
                  const isAdding = addingItems.has(itemKey)
                  const isAdded = addedItems.has(itemKey)
                  const title = getMediaTitle(item)
                  const year = getMediaYear(item)

                  return (
                    <Card key={itemKey} className="hover:shadow-md transition-shadow bg-white/95 border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Poster */}
                          <div className="flex-shrink-0">
                            <Image
                              src={getImageUrl(item.poster_path || "", "w200")}
                              alt={title}
                              width={60}
                              height={90}
                              className="rounded-lg object-cover bg-gray-100"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {title} {year && `(${year})`}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <Badge variant="outline" className="text-xs text-gray-900 border-gray-300">
                                    {item.media_type === "movie" ? "Movie" : "TV Show"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddToWatchlist(item)}
                                disabled={isAdding || isAdded}
                                className={
                                  isAdded
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium border border-gray-300"
                                }
                              >
                                {isAdding ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isAdded ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>

                            {item.overview && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.overview}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery
                    ? isSearching
                      ? "Searching..."
                      : "No results found. Try a different search term."
                    : "Search for movies and TV shows to add to your watchlist."}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
