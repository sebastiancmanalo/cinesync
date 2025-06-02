"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Clock, Star, Plus } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

// Mock search results
const mockSearchResults = [
  {
    id: 1,
    title: "Barbie",
    year: 2023,
    runtime: "1h 54m",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 7.0,
    type: "movie",
    streamingOn: ["HBO Max", "Amazon Prime"],
    description:
      "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
  },
  {
    id: 2,
    title: "The Last of Us",
    year: 2023,
    runtime: "9h 0m",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.7,
    type: "tv",
    streamingOn: ["HBO Max"],
    description:
      "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
  },
  {
    id: 3,
    title: "Wednesday",
    year: 2022,
    runtime: "8h 0m",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.1,
    type: "tv",
    streamingOn: ["Netflix"],
    description:
      "Follows Wednesday Addams' years as a student at Nevermore Academy, where she attempts to master her emerging psychic ability.",
  },
]

interface MovieSearchProps {
  onAddToWatchlist?: (movie: any) => void
}

export function MovieSearch({ onAddToWatchlist }: MovieSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(mockSearchResults)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockSearchResults.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase())))
      setIsSearching(false)
    }, 500)
  }

  const handleAddToWatchlist = (movie: any) => {
    onAddToWatchlist?.(movie)
    // Show success message or close dialog
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Movie/Show
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Movies & TV Shows</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for movies and TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                          <Image
                            src={item.poster || "/placeholder.svg"}
                            alt={item.title}
                            width={60}
                            height={90}
                            className="rounded-lg object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {item.title} ({item.year})
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.type === "movie" ? "Movie" : "TV Show"}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.runtime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  {item.rating}
                                </div>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleAddToWatchlist(item)}>
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                          {/* Streaming platforms */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Available on:</span>
                            {item.streamingOn.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery
                    ? "No results found. Try a different search term."
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
